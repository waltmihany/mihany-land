import { formatNumber, formatSignedNumber, getCropTypeConfig, getRouteUnlockCost } from "../game/logic.js";

export default function SalesRouteModal({ isOpen, state, routePreviews, onClose, onSelect }) {
  if (!isOpen) {
    return null;
  }

  const crop = getCropTypeConfig(state.currentCropType);

  return (
    <div className="modal-backdrop">
      <section className="modal-card">
        <header className="modal-head">
          <h2>販売先を選ぶ</h2>
          <button type="button" onClick={onClose}>閉じる</button>
        </header>
        <p>本日の収穫：{formatNumber(state.dailyHarvestCount)}本 / 今日の品種：{crop.name}</p>
        <div className="route-list">
          {routePreviews.map((preview) => (
            <article className={`route-card ${preview.isUnlocked ? "" : "is-locked"}`} key={preview.level}>
              <strong>{preview.route.name}</strong>
              <span>{preview.isUnlocked ? "選択可能" : `未解放（解放費用 ${formatNumber(getRouteUnlockCost(preview.route))}ナス円）`}</span>
              <span>需要 {formatNumber(preview.demand)}本 / 有効販売単価 {formatNumber(preview.unitPrice)} / 販売コスト {formatNumber(preview.sellingCost)}</span>
              <span>肥料 {formatSignedNumber(preview.fertilizerBonus)} / 品種 {formatSignedNumber(preview.cropPriceBonus)} / 需要補正 {formatSignedNumber(preview.cropDemandModifier)}本</span>
              <span>売上 {formatNumber(preview.projectedSales)} / 利益 {formatSignedNumber(preview.projectedProfit)}ナス円</span>
              <button className="button" type="button" disabled={!preview.isUnlocked || state.isGameOver} onClick={() => onSelect(preview.level)}>
                ここで売る
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
