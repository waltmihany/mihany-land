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
          <div className="farm-overlay top-left">本日の収穫：{formatNumber(state.dailyHarvestCount)}本</div>
          <button className="end-day-button" type="button" onClick={onEndDay} disabled={state.isGameOver}>
            1日を終える
          </button>
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
      <div className="message-row">
        <img src={ASSETS.characters.twoBlockNasu} alt="" />
        <p>{state.lastDailyReport || fieldView.comment}</p>
      </div>
      <p className="version">ツーブロック茄子農園 React Prototype / Ver.13互換</p>
    </section>
  );
}
