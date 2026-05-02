import { CONFIG } from "./config.js";

export function toFiniteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function formatNumber(value) {
  return Math.floor(toFiniteNumber(value, 0)).toLocaleString("ja-JP");
}

export function formatSignedNumber(value) {
  const number = Math.floor(toFiniteNumber(value, 0));
  return `${number >= 0 ? "+" : ""}${formatNumber(number)}`;
}

export function getMarketRouteEntries() {
  return Object.entries(CONFIG.marketRoutes).map(([level, route]) => ({
    level: Number(level),
    route
  }));
}

export function rollRouteDemand(route) {
  const min = Math.max(0, Math.floor(toFiniteNumber(route.demandMin, 0)));
  const max = Math.max(min, Math.floor(toFiniteNumber(route.demandMax, min)));
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function generateDailyRouteDemands() {
  return getMarketRouteEntries().reduce((demands, item) => {
    demands[item.level] = rollRouteDemand(item.route);
    return demands;
  }, {});
}

export function normalizeDailyRouteDemands(savedDemands) {
  const demands = savedDemands && typeof savedDemands === "object" ? savedDemands : {};

  return getMarketRouteEntries().reduce((normalized, item) => {
    const demand = Math.floor(toFiniteNumber(demands[item.level], Number.NaN));
    normalized[item.level] = Number.isFinite(demand) ? Math.max(0, demand) : rollRouteDemand(item.route);
    return normalized;
  }, {});
}

export function normalizeHarvestedAt(harvestedAt) {
  const timestamp = toFiniteNumber(harvestedAt, null);

  if (!timestamp || Date.now() - timestamp < 0) {
    return null;
  }

  return timestamp;
}

export function normalizeFarmLandLevel(level) {
  const normalizedLevel = Math.floor(toFiniteNumber(level, 1));
  return CONFIG.farmLandLevels[normalizedLevel] ? normalizedLevel : 1;
}

export function getFarmLandConfig(level = 1) {
  return CONFIG.farmLandLevels[level] || CONFIG.farmLandLevels[1];
}

export function normalizeSpotsForFarmLand(farmLandLevel = 1, existingSpots = []) {
  const spotCount = getFarmLandConfig(farmLandLevel).spotCount;

  return Array.from({ length: spotCount }, (_, index) => {
    const existingSpot = existingSpots.find((item) => item && toFiniteNumber(item.id, -1) === index);
    return {
      id: index,
      harvestedAt: normalizeHarvestedAt(existingSpot?.harvestedAt)
    };
  });
}

export function normalizeMarketRouteLevel(level) {
  const normalizedLevel = Math.floor(toFiniteNumber(level, 1));
  return CONFIG.marketRoutes[normalizedLevel] ? normalizedLevel : 1;
}

export function getMarketRouteConfig(level = 1) {
  return CONFIG.marketRoutes[level] || CONFIG.marketRoutes[1];
}

export function getRouteUnlockCost(route) {
  return Math.max(0, toFiniteNumber(route.unlockCost ?? route.upgradeCost, 0));
}

export function getRouteSellingCost(route) {
  return Math.max(0, toFiniteNumber(route.sellingCost ?? route.dailyRouteCost, 0));
}

export function getFertilizerConfig(fertilizerType) {
  return CONFIG.fertilizers[fertilizerType] || CONFIG.fertilizers.none;
}

export function createInitialState() {
  return {
    money: CONFIG.economy.initialMoney,
    harvestAmount: CONFIG.economy.initialHarvestAmount,
    upgradeCost: CONFIG.economy.initialUpgradeCost,
    level: CONFIG.progression.initialLevel,
    day: CONFIG.dayCycle.initialDay,
    dayCount: CONFIG.dayCycle.initialDay,
    dailyHarvestCount: 0,
    negativeBalanceDays: 0,
    isGameOver: false,
    isAwaitingNextDay: false,
    fertilizerType: "none",
    marketRouteLevel: 1,
    farmLandLevel: 1,
    dailyRouteDemands: generateDailyRouteDemands(),
    sellingPricePerEggplant: CONFIG.economy.sellingPricePerEggplant,
    lastDailyReport: "",
    lastEventName: "",
    lastEventMessage: "",
    lastSettlement: null,
    spots: normalizeSpotsForFarmLand()
  };
}

export function normalizeSettlement(settlement) {
  if (!settlement || typeof settlement !== "object") {
    return null;
  }

  const harvestCount = Math.max(0, Math.floor(toFiniteNumber(settlement.harvestCount, 0)));
  const marketRouteLevel = normalizeMarketRouteLevel(settlement.marketRouteLevel ?? settlement.marketChannelLevel);
  const marketRoute = getMarketRouteConfig(marketRouteLevel);
  const fertilizerType = CONFIG.fertilizers[settlement.fertilizerType] ? settlement.fertilizerType : "none";
  const fertilizer = getFertilizerConfig(fertilizerType);
  const demandCount = Math.max(0, Math.floor(toFiniteNumber(settlement.demandCount, marketRoute.demandMin)));
  const unitPrice = Math.max(1, toFiniteNumber(settlement.unitPrice, marketRoute.basePrice + fertilizer.priceBonus));
  const projectedSales = Math.max(0, toFiniteNumber(settlement.projectedSales, harvestCount * unitPrice));
  const fixedCost = Math.max(0, toFiniteNumber(settlement.fixedCost, CONFIG.economy.dailyFixedCost + getRouteSellingCost(marketRoute)));

  return {
    day: Math.max(CONFIG.dayCycle.initialDay, Math.floor(toFiniteNumber(settlement.day, CONFIG.dayCycle.initialDay))),
    harvestCount,
    demandCount,
    soldCount: Math.max(0, Math.floor(toFiniteNumber(settlement.soldCount, Math.min(harvestCount, demandCount)))),
    unsoldCount: Math.max(0, Math.floor(toFiniteNumber(settlement.unsoldCount, Math.max(0, harvestCount - demandCount)))),
    baseUnitPrice: Math.max(1, toFiniteNumber(settlement.baseUnitPrice, marketRoute.basePrice)),
    fertilizerType,
    fertilizerName: settlement.fertilizerName || fertilizer.name,
    fertilizerBonus: Math.max(0, toFiniteNumber(settlement.fertilizerBonus, fertilizer.priceBonus)),
    marketRouteLevel,
    marketChannelName: settlement.marketChannelName || marketRoute.name,
    marketBasePrice: Math.max(1, toFiniteNumber(settlement.marketBasePrice, marketRoute.basePrice)),
    marketPriceBonus: Math.max(1, toFiniteNumber(settlement.marketPriceBonus, marketRoute.basePrice)),
    unitPrice,
    projectedSales,
    actualSales: Math.max(0, toFiniteNumber(settlement.actualSales, projectedSales)),
    baseFixedCost: Math.max(0, toFiniteNumber(settlement.baseFixedCost, CONFIG.economy.dailyFixedCost)),
    marketDailyCostBonus: Math.max(0, toFiniteNumber(settlement.marketDailyCostBonus, getRouteSellingCost(marketRoute))),
    fixedCost,
    projectedProfit: toFiniteNumber(settlement.projectedProfit, projectedSales - fixedCost),
    moneyAfter: toFiniteNumber(settlement.moneyAfter, 0),
    negativeBalanceDays: Math.max(0, Math.floor(toFiniteNumber(settlement.negativeBalanceDays, 0)))
  };
}

export function normalizeState(savedState = {}) {
  const fallback = createInitialState();
  const dayCount = Math.max(
    CONFIG.dayCycle.initialDay,
    Math.floor(toFiniteNumber(savedState.dayCount ?? savedState.day, CONFIG.dayCycle.initialDay))
  );
  const unitPrice = Math.max(
    1,
    toFiniteNumber(savedState.harvestAmount, CONFIG.economy.initialHarvestAmount),
    toFiniteNumber(savedState.sellingPricePerEggplant, CONFIG.economy.sellingPricePerEggplant)
  );
  const marketRouteLevel = normalizeMarketRouteLevel(savedState.marketRouteLevel ?? savedState.marketChannelLevel);
  const farmLandLevel = normalizeFarmLandLevel(savedState.farmLandLevel);
  const savedSpots = Array.isArray(savedState.spots)
    ? savedState.spots
    : Array.isArray(savedState.eggplantSpots)
      ? savedState.eggplantSpots
      : [];

  return {
    ...fallback,
    ...savedState,
    money: toFiniteNumber(savedState.money, fallback.money),
    harvestAmount: unitPrice,
    upgradeCost: Math.max(1, toFiniteNumber(savedState.upgradeCost, fallback.upgradeCost)),
    level: Math.max(CONFIG.progression.initialLevel, Math.floor(toFiniteNumber(savedState.level, fallback.level))),
    day: dayCount,
    dayCount,
    dailyHarvestCount: Math.max(0, Math.floor(toFiniteNumber(savedState.dailyHarvestCount, 0))),
    negativeBalanceDays: Math.max(0, Math.floor(toFiniteNumber(savedState.negativeBalanceDays, 0))),
    isGameOver: savedState.isGameOver === true,
    isAwaitingNextDay: savedState.isAwaitingNextDay === true,
    fertilizerType: CONFIG.fertilizers[savedState.fertilizerType] ? savedState.fertilizerType : "none",
    marketRouteLevel,
    farmLandLevel,
    dailyRouteDemands: normalizeDailyRouteDemands(savedState.dailyRouteDemands),
    sellingPricePerEggplant: unitPrice,
    lastSettlement: normalizeSettlement(savedState.lastSettlement),
    spots: normalizeSpotsForFarmLand(farmLandLevel, savedSpots)
  };
}

export function loadGame() {
  const saved = localStorage.getItem(CONFIG.storageKey);

  if (!saved) {
    return createInitialState();
  }

  try {
    return normalizeState(JSON.parse(saved));
  } catch {
    return createInitialState();
  }
}

export function saveGame(state) {
  localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
}

export function getFieldView(farmLandLevel) {
  return CONFIG.progression.fieldStages.find((stage) => farmLandLevel >= stage.minLevel);
}

export function getSpotGrowthState(spot) {
  if (!spot.harvestedAt) {
    return "ready";
  }

  const elapsed = Date.now() - spot.harvestedAt;

  if (elapsed >= CONFIG.growth.growingAfterMs) {
    return "growing";
  }

  if (elapsed >= CONFIG.growth.sproutAfterMs) {
    return "sprout";
  }

  return "empty";
}

export function getRouteDemand(state, routeLevel) {
  const demand = toFiniteNumber(state.dailyRouteDemands?.[routeLevel], Number.NaN);
  return Number.isFinite(demand) ? Math.max(0, Math.floor(demand)) : rollRouteDemand(getMarketRouteConfig(routeLevel));
}

export function calculateSalesResult({ harvestCount, route, routeLevel, demand, fertilizer, fertilizerType, currentMoney, negativeBalanceDays }) {
  const soldCount = Math.min(harvestCount, demand);
  const unsoldCount = Math.max(0, harvestCount - demand);
  const unitPrice = route.basePrice + fertilizer.priceBonus;
  const projectedSales = soldCount * unitPrice;
  const sellingCost = getRouteSellingCost(route);
  const fixedCost = CONFIG.economy.dailyFixedCost + sellingCost;
  const projectedProfit = projectedSales - fixedCost;

  return {
    harvestCount,
    demandCount: demand,
    soldCount,
    unsoldCount,
    baseUnitPrice: route.basePrice,
    fertilizerType,
    fertilizerName: fertilizer.name,
    fertilizerBonus: fertilizer.priceBonus,
    marketRouteLevel: routeLevel,
    marketChannelName: route.name,
    marketBasePrice: route.basePrice,
    marketPriceBonus: route.basePrice,
    unitPrice,
    projectedSales,
    actualSales: projectedSales,
    baseFixedCost: CONFIG.economy.dailyFixedCost,
    marketDailyCostBonus: sellingCost,
    fixedCost,
    projectedProfit,
    moneyAfter: currentMoney + projectedProfit,
    negativeBalanceDays
  };
}

export function getRoutePreviews(state) {
  return getMarketRouteEntries().map((item) => {
    const result = calculateSalesResult({
      harvestCount: state.dailyHarvestCount,
      route: item.route,
      routeLevel: item.level,
      demand: getRouteDemand(state, item.level),
      fertilizer: getFertilizerConfig(state.fertilizerType),
      fertilizerType: state.fertilizerType,
      currentMoney: state.money,
      negativeBalanceDays: state.negativeBalanceDays
    });

    return {
      level: item.level,
      route: item.route,
      isUnlocked: item.level <= state.marketRouteLevel,
      demand: result.demandCount,
      unitPrice: result.unitPrice,
      fertilizerBonus: result.fertilizerBonus,
      soldCount: result.soldCount,
      unsoldCount: result.unsoldCount,
      projectedSales: result.projectedSales,
      sellingCost: result.marketDailyCostBonus,
      fixedCost: result.fixedCost,
      projectedProfit: result.projectedProfit
    };
  });
}

export function getRecommendedRoutePreview(previews) {
  return previews
    .filter((preview) => preview.isUnlocked)
    .sort((a, b) => b.projectedProfit - a.projectedProfit)[0] || null;
}

export function createSettlementPreview(state, day, routeLevel = state.marketRouteLevel) {
  const marketRoute = getMarketRouteConfig(routeLevel);
  return {
    ...calculateSalesResult({
      harvestCount: state.dailyHarvestCount,
      route: marketRoute,
      routeLevel,
      demand: getRouteDemand(state, routeLevel),
      fertilizer: getFertilizerConfig(state.fertilizerType),
      fertilizerType: state.fertilizerType,
      currentMoney: state.money,
      negativeBalanceDays: state.negativeBalanceDays
    }),
    day
  };
}

export function updateGameOverStatus(state) {
  const negativeBalanceDays = state.money < 0 ? state.negativeBalanceDays + 1 : 0;
  return {
    ...state,
    negativeBalanceDays,
    isGameOver: negativeBalanceDays >= 3
  };
}

export function getCashWarningText(state) {
  if (state.isGameOver || state.money >= 0 || state.negativeBalanceDays <= 0) {
    return "";
  }

  const remainingDays = Math.max(0, 3 - state.negativeBalanceDays);
  return `資金ショート警告：あと${formatNumber(remainingDays)}日で農園閉鎖ナス`;
}

export function buildDailyReport(day, settlement) {
  const reportIndex = (day - CONFIG.dayCycle.initialDay) % CONFIG.dayCycle.reports.length;
  const report = CONFIG.dayCycle.reports[Math.max(0, reportIndex)];
  return `${day}日目の日報：${report} 本日の収穫 ${formatNumber(settlement.harvestCount)}本。${settlement.fertilizerName}。${settlement.marketChannelName}で需要 ${formatNumber(settlement.demandCount)}本、売上 +${formatNumber(settlement.actualSales)}ナス円、売れ残り ${formatNumber(settlement.unsoldCount)}本。固定費 -${formatNumber(settlement.fixedCost)}ナス円。`;
}
