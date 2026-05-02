import { ASSETS } from "../game/assets.js";
import { CONFIG } from "../game/config.js";
import { formatNumber, getFieldView, getSpotGrowthState } from "../game/logic.js";

function getFarmHint(state) {
  if (state.isGameOver) {
    return "農園はお休み中ナス";
  }

  const readyCount = state.spots.filter((spot) => getSpotGrowthState(spot) === "ready").length;

  if (readyCount > 0) {
    return "ナスを収穫して、売り先を選ぶナス";
  }

  if (state.dailyHarvestCount > 0) {
    return "需要は財布/市場で確認するナス";
  }

  return "今日の畑を確認するナス";
}

export default function FarmTab({ state, spotComment, isFieldUpgraded, onHarvestSpot, onEndDay }) {
  const fieldView = getFieldView(state.farmLandLevel);

  return (
    <section className="tab-panel farm-panel">
      <div className={`field ${isFieldUpgraded ? "is-upgraded" : ""}`}>
        <div
          className={`field-stage tier-${fieldView.tier} spots-${state.spots.length}`}
          style={{ "--farm-bg": `url("${fieldView.background}")` }}
        >
          <div className="farm-hud">
            <div className="harvest-badge">本日の収穫：<strong>{formatNumber(state.dailyHarvestCount)}本</strong></div>
            <button className="button day stage-end-day" type="button" onClick={onEndDay} disabled={state.isGameOver}>
              1日を終える
            </button>
          </div>
          <div className="day-badge">{formatNumber(state.dayCount)}日目</div>
          <div className="farm-hint">{getFarmHint(state)}</div>
          <div className="stage-guide">
            <img src={ASSETS.characters.twoBlockNasu} alt="" aria-hidden="true" />
          </div>
          {fieldView.sign && <div className="sign">{fieldView.sign}</div>}
          <div className="farm-plot">
            {state.spots.map((spot) => {
              const spotState = getSpotGrowthState(spot);
              return (
                <button
                  key={spot.id}
                  className={`crop spot-${spotState}`}
                  type="button"
                  onClick={() => onHarvestSpot(spot.id)}
                  disabled={state.isGameOver}
                  aria-label={`ナススポット ${spot.id + 1}`}
                >
                  <img src={CONFIG.growth.images[spotState]} alt="" draggable="false" />
                  {spotComment?.spotId === spot.id && (
                    <span key={spotComment.key} className="spot-comment">{spotComment.label}</span>
                  )}
                </button>
              );
            })}
          </div>
          {fieldView.visitors.length > 0 && (
            <div className="visitors">
              {fieldView.visitors.map((visitorId) => {
                const character = CONFIG.characters[visitorId];
                return (
                  <span className="visitor" key={visitorId}>
                    <img src={character.image} alt="" />
                    {character.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <p className="field-note">{fieldView.name}</p>
      <p className="field-status">{fieldView.comment}</p>
      <div className="message-row farm-message">
        <img src={ASSETS.characters.twoBlockNasu} alt="" />
        <p>{state.lastDailyReport || fieldView.comment}</p>
      </div>
      <section className="event-log" aria-label="今日の出来事">
        <span className="event-label">今日の出来事</span>
        <p className="event-title">{state.lastEventName || "まだ記録なし"}</p>
        <p className="event-message">{state.lastEventMessage || "1日を終えると、ここに農園の出来事が記録されるナス。"}</p>
      </section>
      <p className="version">ツーブロック茄子農園 React Prototype / Ver.13互換</p>
    </section>
  );
}
