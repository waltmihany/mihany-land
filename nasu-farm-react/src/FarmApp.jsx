import { useEffect, useMemo, useRef, useState } from "react";
import FarmTab from "./components/FarmTab.jsx";
import WalletTab from "./components/WalletTab.jsx";
import MarketTab from "./components/MarketTab.jsx";
import UpgradeTab from "./components/UpgradeTab.jsx";
import BottomTabs from "./components/BottomTabs.jsx";
import SalesRouteModal from "./components/SalesRouteModal.jsx";
import SettlementModal from "./components/SettlementModal.jsx";
import GameOverModal from "./components/GameOverModal.jsx";
import { ASSETS } from "./game/assets.js";
import { CONFIG } from "./game/config.js";
import {
  buildDailyReport,
  createInitialState,
  createSettlementPreview,
  formatNumber,
  generateDailyRouteDemands,
  getEffectiveHarvestLimit,
  getRecommendedRoutePreview,
  getRoutePreviews,
  getSpotGrowthState,
  loadGame,
  normalizeCropType,
  normalizeSpotsForFarmLand,
  saveGame,
  updateGameOverStatus
} from "./game/logic.js";

const tabs = [
  { id: "farm", label: "農園", icon: ASSETS.icons.farm },
  { id: "wallet", label: "財布", icon: ASSETS.icons.wallet },
  { id: "market", label: "市場", icon: ASSETS.icons.market },
  { id: "upgrade", label: "強化", icon: ASSETS.icons.upgrade }
];

export default function FarmApp() {
  const initialStateRef = useRef(null);

  if (!initialStateRef.current) {
    initialStateRef.current = loadGame();
  }

  const [state, setState] = useState(() => initialStateRef.current);
  const [activeTab, setActiveTab] = useState("farm");
  const [isSalesOpen, setSalesOpen] = useState(false);
  const [isSettlementOpen, setSettlementOpen] = useState(() => initialStateRef.current.isAwaitingNextDay);
  const [spotComment, setSpotComment] = useState(null);
  const [isFieldUpgraded, setFieldUpgraded] = useState(false);
  const [, setClock] = useState(Date.now());

  useEffect(() => {
    saveGame(state);
  }, [state]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), CONFIG.growth.updateIntervalMs);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!spotComment) {
      return undefined;
    }

    const timer = window.setTimeout(() => setSpotComment(null), CONFIG.timing.harvestFloatMs);
    return () => window.clearTimeout(timer);
  }, [spotComment]);

  const routePreviews = useMemo(() => getRoutePreviews(state), [state]);
  const recommendedRoute = useMemo(() => getRecommendedRoutePreview(routePreviews), [routePreviews]);

  function showSpotComment(label, spotId = null) {
    setSpotComment({ label, spotId, key: Date.now() });
  }

  function triggerUpgradeGlow() {
    setFieldUpgraded(true);
    window.setTimeout(() => setFieldUpgraded(false), CONFIG.timing.upgradeGlowMs);
  }

  function harvestSpot(spotId) {
    if (state.isGameOver) {
      return;
    }

    if (state.isAwaitingNextDay) {
      setSettlementOpen(true);
      return;
    }

    const spot = state.spots.find((item) => item.id === spotId);

    if (!spot || getSpotGrowthState(spot) !== "ready") {
      showSpotComment(spot?.harvestedAt ? "今日はもう抜いたナス" : "まだ育ってないナス…", spotId);
      return;
    }

    if (state.dailyHarvestCount >= getEffectiveHarvestLimit(state)) {
      showSpotComment("今日の品種ではここまでナス", spotId);
      return;
    }

    setState((current) => {
      const currentSpot = current.spots.find((item) => item.id === spotId);

      if (!currentSpot || getSpotGrowthState(currentSpot) !== "ready" || current.dailyHarvestCount >= getEffectiveHarvestLimit(current)) {
        return current;
      }

      return {
        ...current,
        dailyHarvestCount: current.dailyHarvestCount + 1,
        lastDailyReport: "収穫したナス。売上は1日の終わりにまとめるナス。",
        spots: current.spots.map((item) => item.id === spotId ? { ...item, harvestedAt: Date.now() } : item)
      };
    });
    showSpotComment("収穫ナス！", spotId);
  }

  function openSalesSelection() {
    if (state.isGameOver) {
      return;
    }

    if (state.isAwaitingNextDay) {
      setSettlementOpen(true);
      return;
    }

    setSalesOpen(true);
  }

  function selectSalesRoute(routeLevel) {
    if (state.isGameOver || state.isAwaitingNextDay || routeLevel > state.marketRouteLevel) {
      return;
    }

    const completedDay = state.dayCount ?? state.day ?? CONFIG.dayCycle.initialDay;
    const settlement = createSettlementPreview(state, completedDay, routeLevel);
    const withMoney = { ...state, money: state.money + settlement.projectedProfit };
    const checkedState = updateGameOverStatus(withMoney);
    const finalSettlement = {
      ...settlement,
      negativeBalanceDays: checkedState.negativeBalanceDays,
      moneyAfter: checkedState.money
    };

    setState({
      ...checkedState,
      isAwaitingNextDay: true,
      lastSettlement: finalSettlement,
      lastDailyReport: buildDailyReport(completedDay, finalSettlement),
      lastEventName: finalSettlement.unsoldCount > 0 ? "売れ残りあり" : "完売",
      lastEventMessage: finalSettlement.unsoldCount > 0
        ? `売れ残り：${formatNumber(finalSettlement.unsoldCount)}本。今日は売り切れなかったナス。`
        : "今日は収穫分を売り切ったナス。"
    });
    setSalesOpen(false);
    setSettlementOpen(true);
  }

  function advanceToNextDay() {
    if (state.isGameOver) {
      return;
    }

    const nextDay = (state.dayCount ?? state.day ?? CONFIG.dayCycle.initialDay) + 1;
    setState((current) => {
      const nextCropType = normalizeCropType(current.nextCropType || current.currentCropType);
      const nextCropName = CONFIG.cropTypes[nextCropType].name;

      return {
        ...current,
        day: nextDay,
        dayCount: nextDay,
        isAwaitingNextDay: false,
        dailyHarvestCount: 0,
        fertilizerType: "none",
        currentCropType: nextCropType,
        nextCropType: null,
        spots: normalizeSpotsForFarmLand(current.farmLandLevel),
        dailyRouteDemands: generateDailyRouteDemands(),
        lastDailyReport: `${current.lastDailyReport} 新しい朝ナス。今日の品種は${nextCropName}ナス。`
      };
    });
    setSettlementOpen(false);
  }

  function buyFertilizer(fertilizerType) {
    const fertilizer = CONFIG.fertilizers[fertilizerType];

    if (!fertilizer || state.isGameOver || state.isAwaitingNextDay || state.fertilizerType !== "none" || state.money < fertilizer.cost) {
      return;
    }

    setState((current) => ({
      ...current,
      money: current.money - fertilizer.cost,
      fertilizerType,
      lastDailyReport: `${fertilizer.name}をまいたナス。今日の販売単価が少し上がるナス。`
    }));
  }

  function expandMarketRoute() {
    const nextRoute = CONFIG.marketRoutes[state.marketRouteLevel + 1];

    if (!nextRoute || state.isGameOver || state.isAwaitingNextDay || state.money < nextRoute.unlockCost) {
      return;
    }

    setState((current) => ({
      ...current,
      money: current.money - nextRoute.unlockCost,
      marketRouteLevel: current.marketRouteLevel + 1,
      lastDailyReport: `${nextRoute.name}が販売先に加わったナス。1日終了時に選べるナス。`
    }));
  }

  function selectCropType(cropType) {
    const normalizedCropType = normalizeCropType(cropType);

    if (state.isGameOver || state.isAwaitingNextDay || !state.unlockedCropTypes.includes(normalizedCropType)) {
      return;
    }

    setState((current) => ({
      ...current,
      nextCropType: normalizedCropType,
      lastDailyReport: `明日の品種を${CONFIG.cropTypes[normalizedCropType].name}にするナス。`
    }));
  }

  function upgradeField() {
    if (state.isGameOver || state.isAwaitingNextDay || state.money < state.upgradeCost) {
      return;
    }

    setState((current) => ({
      ...current,
      money: current.money - current.upgradeCost,
      harvestAmount: current.harvestAmount + CONFIG.economy.harvestIncreasePerUpgrade,
      sellingPricePerEggplant: current.harvestAmount + CONFIG.economy.harvestIncreasePerUpgrade,
      upgradeCost: Math.ceil(current.upgradeCost * CONFIG.economy.upgradeCostMultiplier),
      level: current.level + 1
    }));
    triggerUpgradeGlow();
  }

  function improveFarmLand() {
    const nextLand = CONFIG.farmLandLevels[state.farmLandLevel + 1];

    if (!nextLand || state.isGameOver || state.isAwaitingNextDay || state.money < nextLand.upgradeCost) {
      return;
    }

    setState((current) => {
      const nextLevel = current.farmLandLevel + 1;
      return {
        ...current,
        money: current.money - nextLand.upgradeCost,
        farmLandLevel: nextLevel,
        spots: normalizeSpotsForFarmLand(nextLevel, current.spots),
        lastDailyReport: `${nextLand.name}になったナス。1日の最大収穫本数が${formatNumber(nextLand.spotCount)}本になったナス。`
      };
    });
    triggerUpgradeGlow();
  }

  function resetGame() {
    localStorage.removeItem(CONFIG.storageKey);
    setState(createInitialState());
    setSalesOpen(false);
    setSettlementOpen(false);
  }

  const commonProps = {
    state,
    routePreviews,
    recommendedRoute
  };

  return (
    <main className="app-shell">
      <div className="top-status-bar">
        <span className="status-pill">本日の収穫：<strong>{formatNumber(state.dailyHarvestCount)}本</strong></span>
        <span className="status-pill mini-money">
          <img src={ASSETS.icons.coin} alt="" />
          {formatNumber(state.money)} ナス円
        </span>
      </div>

      <section className="phone-frame">
        {activeTab === "farm" && (
          <FarmTab
            {...commonProps}
            spotComment={spotComment}
            isFieldUpgraded={isFieldUpgraded}
            onHarvestSpot={harvestSpot}
            onEndDay={openSalesSelection}
          />
        )}
        {activeTab === "wallet" && <WalletTab {...commonProps} />}
        {activeTab === "market" && (
          <MarketTab
            {...commonProps}
            onBuyFertilizer={buyFertilizer}
            onExpandMarketRoute={expandMarketRoute}
            onSelectCropType={selectCropType}
          />
        )}
        {activeTab === "upgrade" && (
          <UpgradeTab
            {...commonProps}
            onUpgradeField={upgradeField}
            onImproveFarmLand={improveFarmLand}
            onReset={resetGame}
          />
        )}
      </section>

      <div className="bottom-dock">
        <BottomTabs tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} />
      </div>

      <SalesRouteModal
        isOpen={isSalesOpen}
        state={state}
        routePreviews={routePreviews}
        onClose={() => setSalesOpen(false)}
        onSelect={selectSalesRoute}
      />
      <SettlementModal
        isOpen={isSettlementOpen}
        state={state}
        onNextDay={advanceToNextDay}
      />
      <GameOverModal isOpen={state.isGameOver} state={state} onReset={resetGame} />
    </main>
  );
}
