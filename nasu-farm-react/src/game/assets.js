const assetUrl = (path) => new URL(`../../../assets/${path}`, import.meta.url).href;

export const ASSETS = {
  characters: {
    twoBlockNasu: assetUrl("characters/two-block-nasu.png"),
    longHairDaikon: assetUrl("characters/long-hair-daikon.png"),
    ikiriTomato: assetUrl("characters/ikiri-tomato.png")
  },
  crops: {
    ready: assetUrl("crops/eggplant-ready.png"),
    empty: assetUrl("crops/eggplant-empty.png"),
    sprout: assetUrl("crops/eggplant-sprout.png"),
    growing: assetUrl("crops/eggplant-growing.png")
  },
  farm: {
    1: assetUrl("farm/farm-level-1.png"),
    2: assetUrl("farm/farm-level-2.png"),
    3: assetUrl("farm/farm-level-3.png"),
    4: assetUrl("farm/farm-level-4.png")
  },
  icons: {
    farm: assetUrl("icons/farm-icon.png"),
    wallet: assetUrl("icons/wallet-icon.png"),
    market: assetUrl("icons/market-icon.png"),
    upgrade: assetUrl("icons/upgrade-icon.png"),
    coin: assetUrl("icons/nasu-coin.png")
  },
  tabBackgrounds: {
    wallet: assetUrl("tab-backgrounds/wallet-tab-bg.png"),
    market: assetUrl("tab-backgrounds/market-tab-bg.png"),
    upgrade: assetUrl("tab-backgrounds/upgrade-tab-bg.png")
  }
};
