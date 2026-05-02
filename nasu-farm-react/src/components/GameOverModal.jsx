import { formatNumber } from "../game/logic.js";

export default function GameOverModal({ isOpen, state, onReset }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <section className="modal-card game-over-card">
        <h2>農園は資金ショートしたナス…</h2>
        <dl className="data-grid">
          <div><dt>到達日数</dt><dd>{formatNumber(state.lastSettlement?.day ?? state.dayCount)}日目</dd></div>
          <div><dt>最終所持</dt><dd>{formatNumber(state.money)}ナス円</dd></div>
          <div><dt>資金ショート</dt><dd>{formatNumber(state.negativeBalanceDays)}日連続</dd></div>
        </dl>
        <button className="button danger" type="button" onClick={onReset}>最初からやり直す</button>
      </section>
    </div>
  );
}
