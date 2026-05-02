import { ASSETS } from "../game/assets.js";
import { CONFIG } from "../game/config.js";
import {
  formatNumber,
  formatSignedNumber,
  getCropTypeConfig,
  getCropTypeEntries,
  getFertilizerConfig,
  getRouteUnlockCost
} from "../game/logic.js";

export default function MarketTab({ state, routePreviews, onBuyFertilizer, onExpandMarketRoute, onSelectCropType }) {
  const currentFertilizer = getFertilizerConfig(state.fertilizerType);
  const currentCrop = getCropTypeConfig(state.currentCropType);
  const nextCrop = state.nextCropType ? getCropTypeConfig(state.nextCropType) : null;
  const nextRoute = CONFIG.marketRoutes[state.marketRouteLevel + 1] || null;

  return (
    <section className="tab-panel image-panel market-panel" style={{ "--tab-bg": `url("${ASSETS.tabBackgrounds.market}")` }}>
      <header className="panel-head">
        <h1>市場</h1>
        <span>仕入れと販売先</span>
      </header>

      <section className="card">
        <h2>今日の仕入れ</h2>
        <p>肥料は今日だけ効く短期投資ナス。本日の肥料：{currentFertilizer.name}</p>
        <div className="action-grid">
          {["basic", "premium"].map((type) => {
            const fertilizer = CONFIG.fertilizers[type];
            const disabled = state.isGameOver || state.isAwaitingNextDay || state.fertilizerType !== "none" || state.money < fertilizer.cost;
            return (
              <button className="button secondary" type="button" key={type} disabled={disabled} onClick={() => onBuyFertilizer(type)}>
                {fertilizer.name}を買う<br />
                {formatNumber(fertilizer.cost)}ナス円 / 単価 +{formatNumber(fertilizer.priceBonus)}
              </button>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2>品種選択</h2>
        <p>品種は翌日から有効ナス。今日の品種：{currentCrop.name}{nextCrop ? ` / 明日の品種：${nextCrop.name}` : ""}</p>
        <div className="crop-type-list">
          {getCropTypeEntries().filter((crop) => state.unlockedCropTypes.includes(crop.id)).map((crop) => {
            const isCurrent = state.currentCropType === crop.id;
            const isNext = state.nextCropType === crop.id;
            return (
              <article className={`crop-type-card ${isCurrent ? "is-current" : ""} ${isNext ? "is-next" : ""}`} key={crop.id}>
                <strong>{crop.name}</strong>
                <span>{crop.description}</span>
                <span>品種ボーナス {formatSignedNumber(crop.priceBonus)} / 収穫 {formatSignedNumber(crop.harvestModifier)}本 / 需要 {formatSignedNumber(crop.demandModifier)}本</span>
                <button
                  className="button secondary"
                  type="button"
                  disabled={state.isGameOver || state.isAwaitingNextDay || isNext}
                  onClick={() => onSelectCropType(crop.id)}
                >
                  {isNext ? "明日の品種に設定中" : isCurrent ? "明日もこの品種" : "この品種を育てる"}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2>販売ルート</h2>
        <p>販路は1日の終わりに選ぶ売り先ナス。解放すると選択肢が増えるナス。</p>
        <div className="route-list">
          {routePreviews.map((preview) => (
            <article className={`route-card ${preview.isUnlocked ? "" : "is-locked"}`} key={preview.level}>
              <strong>{preview.route.name}</strong>
              <span>{preview.isUnlocked ? "選択可能" : `未解放：${formatNumber(getRouteUnlockCost(preview.route))}ナス円`}</span>
              <span>今日の需要 {formatNumber(preview.demand)}本 / 単価 {formatNumber(preview.unitPrice)} / 販売コスト {formatNumber(preview.sellingCost)}</span>
              <span>見込み利益 {formatSignedNumber(preview.projectedProfit)}ナス円</span>
            </article>
          ))}
        </div>
        {nextRoute ? (
          <button
            className="button"
            type="button"
            disabled={state.isGameOver || state.isAwaitingNextDay || state.money < nextRoute.unlockCost}
            onClick={onExpandMarketRoute}
          >
            {nextRoute.name}を解放（{formatNumber(nextRoute.unlockCost)}ナス円）
          </button>
        ) : (
          <p className="section-note">販路は最大です。</p>
        )}
      </section>
    </section>
  );
}
