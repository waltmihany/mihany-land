import { ASSETS } from "../game/assets.js";
import { CONFIG } from "../game/config.js";
import { formatNumber, getFarmLandConfig } from "../game/logic.js";

export default function UpgradeTab({ state, onUpgradeField, onImproveFarmLand, onReset }) {
  const currentLand = getFarmLandConfig(state.farmLandLevel);
  const nextLand = CONFIG.farmLandLevels[state.farmLandLevel + 1] || null;

  return (
    <section className="tab-panel image-panel upgrade-panel" style={{ "--tab-bg": `url("${ASSETS.tabBackgrounds.upgrade}")` }}>
      <header className="panel-head">
        <h1>強化</h1>
        <span>農園を育てる</span>
      </header>

      <section className="card">
        <h2>農地改善</h2>
        <p>1日に収穫できるナススポット数を増やすナス。</p>
        <dl className="data-grid">
          <div><dt>現在</dt><dd>Lv.{formatNumber(state.farmLandLevel)} {currentLand.name}</dd></div>
          <div><dt>最大収穫</dt><dd>{formatNumber(currentLand.spotCount)}本</dd></div>
        </dl>
        {nextLand ? (
          <button
            className="button"
            type="button"
            disabled={state.isGameOver || state.isAwaitingNextDay || state.money < nextLand.upgradeCost}
            onClick={onImproveFarmLand}
          >
            {nextLand.name}へ改善（+{formatNumber(nextLand.spotCount - currentLand.spotCount)}スポット / {formatNumber(nextLand.upgradeCost)}ナス円）
          </button>
        ) : (
          <p className="section-note">農地は最大まで整備済みナス。</p>
        )}
      </section>

      <section className="card">
        <h2>畑アップグレード</h2>
        <p>畑レベルを上げる恒久強化ナス。HTML版との互換のため残しています。</p>
        <dl className="data-grid">
          <div><dt>畑レベル</dt><dd>Lv.{formatNumber(state.level)}</dd></div>
          <div><dt>必要ナス円</dt><dd>{formatNumber(state.upgradeCost)}</dd></div>
        </dl>
        <button
          className="button secondary"
          type="button"
          disabled={state.isGameOver || state.isAwaitingNextDay || state.money < state.upgradeCost}
          onClick={onUpgradeField}
        >
          畑をアップグレード
        </button>
      </section>

      <button className="button danger" type="button" onClick={onReset}>リセット</button>
    </section>
  );
}
