import { ASSETS } from "../game/assets.js";
import { CONFIG } from "../game/config.js";
import { formatNumber, formatSignedNumber, getCashWarningText } from "../game/logic.js";

export default function WalletTab({ state, routePreviews, recommendedRoute }) {
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
          <div><dt>おすすめ</dt><dd>{recommendedRoute ? recommendedRoute.route.name : "販売先なし"}</dd></div>
          <div><dt>売上見込み</dt><dd>{formatNumber(recommendedRoute?.projectedSales ?? 0)}ナス円</dd></div>
          <div><dt>合計固定費</dt><dd>{formatNumber(recommendedRoute?.fixedCost ?? CONFIG.economy.dailyFixedCost)}ナス円</dd></div>
        </dl>
      </section>

      <section className="card">
        <h2>販路ごとの需要</h2>
        <div className="route-list">
          {routePreviews.filter((preview) => preview.isUnlocked).map((preview) => (
            <article className="route-card" key={preview.level}>
              <strong>{preview.route.name}</strong>
              <span>需要 {formatNumber(preview.demand)}本 / 単価 {formatNumber(preview.unitPrice)} / 利益 {formatSignedNumber(preview.projectedProfit)}</span>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
