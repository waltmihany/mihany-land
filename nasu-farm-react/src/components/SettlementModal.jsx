import { formatNumber } from "../game/logic.js";

export default function SettlementModal({ isOpen, state, onNextDay }) {
  if (!isOpen || !state.lastSettlement) {
    return null;
  }

  const settlement = state.lastSettlement;

  return (
    <div className="modal-backdrop">
      <section className="modal-card">
        <h2>{formatNumber(settlement.day)}日目の販売結果</h2>
        <dl className="data-grid">
          <div><dt>販売先</dt><dd>{settlement.marketChannelName}</dd></div>
          <div><dt>今日の品種</dt><dd>{settlement.cropName}</dd></div>
          <div><dt>本日の収穫</dt><dd>{formatNumber(settlement.harvestCount)}本</dd></div>
          <div><dt>今日の需要</dt><dd>{formatNumber(settlement.demandCount)}本</dd></div>
          <div><dt>売れた本数</dt><dd>{formatNumber(settlement.soldCount)}本</dd></div>
          <div><dt>売れ残り</dt><dd>{formatNumber(settlement.unsoldCount)}本</dd></div>
          <div><dt>有効販売単価</dt><dd>{formatNumber(settlement.unitPrice)}ナス円</dd></div>
          <div><dt>品種ボーナス</dt><dd>+{formatNumber(settlement.cropPriceBonus)}ナス円</dd></div>
          <div><dt>売上</dt><dd>{formatNumber(settlement.actualSales)}ナス円</dd></div>
          <div><dt>固定費</dt><dd>{formatNumber(settlement.fixedCost)}ナス円</dd></div>
          <div><dt>利益</dt><dd>{formatNumber(settlement.projectedProfit)}ナス円</dd></div>
          <div><dt>決算後</dt><dd>{formatNumber(settlement.moneyAfter)}ナス円</dd></div>
        </dl>
        <p className="section-note">
          {settlement.unsoldCount > 0
            ? `売れ残り：${formatNumber(settlement.unsoldCount)}本。今日は売り切れなかったナス。`
            : "今日は収穫分を売り切ったナス。"}
        </p>
        <button className="button" type="button" onClick={onNextDay} disabled={state.isGameOver}>
          次の日へ
        </button>
      </section>
    </div>
  );
}
