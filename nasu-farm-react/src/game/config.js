import { ASSETS } from "./assets.js";

export const CONFIG = {
  storageKey: "mihanyNasuFarmV01",
  economy: {
    initialMoney: 0,
    initialHarvestAmount: 10,
    initialUpgradeCost: 100,
    harvestIncreasePerUpgrade: 5,
    upgradeCostMultiplier: 1.5,
    sellingPricePerEggplant: 10,
    dailyFixedCost: 20,
    autoIncomePerSecond: 0,
    autoIncomeMultiplier: 1
  },
  fertilizers: {
    none: { name: "肥料なし", cost: 0, priceBonus: 0 },
    basic: { name: "ふつうの肥料", cost: 30, priceBonus: 3 },
    premium: { name: "いい肥料", cost: 80, priceBonus: 8 }
  },
  farmLandLevels: {
    1: { name: "小さな畑", spotCount: 6, upgradeCost: 0, description: "最初の小さなナス畑ナス。" },
    2: { name: "広がった畑", spotCount: 8, upgradeCost: 300, description: "少し農地が広がったナス。収穫できる本数が増えるナス。" },
    3: { name: "整備された農園", spotCount: 10, upgradeCost: 900, description: "畝が整って、農園らしくなってきたナス。" },
    4: { name: "立派なナス農園", spotCount: 12, upgradeCost: 2500, description: "だいぶ本格的な農園ナス。背伸びしすぎ注意ナス。" }
  },
  marketRoutes: {
    1: { name: "村の直売所", basePrice: 10, sellingCost: 0, demandMin: 4, demandMax: 6, unlockCost: 0, description: "安定して少しだけ売れるナス。" },
    2: { name: "町の八百屋", basePrice: 14, sellingCost: 20, demandMin: 5, demandMax: 9, unlockCost: 150, description: "ほどよく売れるが、販売コストもかかるナス。" },
    3: { name: "スーパー納品", basePrice: 20, sellingCost: 60, demandMin: 4, demandMax: 14, unlockCost: 500, description: "大量に売れる日もあるが、需要にムラがあるナス。" },
    4: { name: "高級レストラン", basePrice: 35, sellingCost: 150, demandMin: 1, demandMax: 4, unlockCost: 1500, description: "高単価だが、少量しか買ってもらえないナス。" }
  },
  growth: {
    updateIntervalMs: 1000,
    sproutAfterMs: 2000,
    growingAfterMs: 5000,
    images: ASSETS.crops
  },
  progression: {
    initialLevel: 1,
    fieldStages: [
      { minLevel: 4, tier: "fancy", name: "豪華な視察農園", comment: "いきりトマトが視察に来たナス。ちょっと腹立つナス。", background: ASSETS.farm[4], sign: "視察対応中", visitors: ["longHairDaikon", "ikiriTomato"] },
      { minLevel: 3, tier: "green", name: "ロン毛大根お手伝い畑", comment: "ロン毛大根が手伝いに来たナス。風が吹いてるナス。", background: ASSETS.farm[3], sign: "ツーブロック茄子農園", visitors: ["longHairDaikon"] },
      { minLevel: 2, tier: "sign", name: "看板つきの畑", comment: "看板が立ったナス。急に施設感が出たナス。", background: ASSETS.farm[2], sign: "ツーブロック茄子農園", visitors: [] },
      { minLevel: 1, tier: "seed", name: "小さな土の畑", comment: "まだ土しかないナス。でも国はここからナス。", background: ASSETS.farm[1], sign: "", visitors: [] }
    ]
  },
  characters: {
    twoBlockNasu: { name: "ツーブロック茄子", image: ASSETS.characters.twoBlockNasu },
    longHairDaikon: { name: "ロン毛大根", image: ASSETS.characters.longHairDaikon },
    ikiriTomato: { name: "いきりトマト", image: ASSETS.characters.ikiriTomato }
  },
  dayCycle: {
    initialDay: 1,
    reports: [
      "今日もナスは静かに育ったナス。",
      "畑に少しだけ生活感が出てきたナス。",
      "ロン毛大根が遠くを見ていたナス。"
    ]
  },
  timing: {
    harvestFloatMs: 1200,
    upgradeGlowMs: 520
  }
};
