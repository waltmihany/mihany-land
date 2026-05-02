import { ASSETS } from "../game/assets.js";
import { CONFIG } from "../game/config.js";
import { formatNumber, formatSignedNumber, getCashWarningText, getCropTypeConfig, getEffectiveHarvestLimit } from "../game/logic.js";

export default function WalletTab({ state, routePreviews, recommendedRoute }) {
  const crop = getCropTypeConfig(state.currentCropType);
  const harvestLimit = getEffectiveHarvestLimit(state);
  const warningText = getCashWarningText(state) || (recommendedRoute?.projectedProfit < 0
    ? "赤字見込みナス。決算前に収穫・肥料・販路を確認するナス。"
    : "");

  return (
    <section className="tab-panel image-panel wallet-panel" style={{ "--tab-bg": `url("${ASSETS.tabBackgrounds.wallet}")` }}>
      <header className="panel-head">
        <h1>財布</h1>
        <span>{formatNumber(state.dayCount)}日目</span>
      </header>
      <div className="money-box">
        <img src={ASSETS.icons.coin} alt="" />
        <strong>{formatNumber(state.money)}</strong>
        <span>ナス円</span>
      </div>
      <div className={`profit-card ${recommendedRoute?.projectedProfit < 0 ? "is-negative" : ""}`}>
        このまま決算すると：{formatSignedNumber(recommendedRoute?.projectedProfit ?? 0)}ナス円
      </div>
      {warningText && <div className="warning">{warningText}</div>}

      <section className="card">
        <h2>今日の決算プレビュー</h2>
        <dl className="data-grid">
          <div><dt>本日の収穫</dt><dd>{formatNumber(state.dailyHarvestCount)}本</dd></div>
          <div><dt>今日の品種</dt><dd>{crop.name}</dd></div>
          <div><dt>おすすめ</dt><dd>{recommendedRoute ? recommendedRoute.route.name : "販売先なし"}</dd></div>
          <div><dt>売上見込み</dt><dd>{formatNumber(recommendedRoute?.projectedSales ?? 0)}ナス円</dd></div>
          <div><dt>合計固定費</dt><dd>{formatNumber(recommendedRoute?.fixedCost ?? CONFIG.economy.dailyFixedCost)}ナス円</dd></div>
        </dl>
      </section>

      <section className="card">
        <h2>品種情報</h2>
        <dl className="data-grid">
          <div><dt>品種ボーナス</dt><dd>{formatSignedNumber(crop.priceBonus)}ナス円</dd></div>
          <div><dt>収穫補正</dt><dd>{formatSignedNumber(crop.harvestModifier)}本</dd></div>
          <div><dt>需要補正</dt><dd>{formatSignedNumber(crop.demandModifier)}本</dd></div>
          <div><dt>最大収穫</dt><dd>{formatNumber(harvestLimit)}本</dd></div>
        </dl>
      </section>

      <section className="card">
        <h2>販路ごとの需要</h2>
        <div className="route-list">
          {routePreviews.filter((preview) => preview.isUnlocked).map((preview) => (
            <article className="route-card" key={preview.level}>
              <strong>{preview.route.name}</strong>
              <span>需要 {formatNumber(preview.demand)}本 / 単価 {formatNumber(preview.unitPrice)} / 品種 {formatSignedNumber(preview.cropPriceBonus)} / 利益 {formatSignedNumber(preview.projectedProfit)}</span>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
