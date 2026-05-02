export default function BottomTabs({ tabs, activeTab, onSelect }) {
  return (
    <nav className="bottom-tabs" aria-label="農園メニュー">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? "is-active" : ""}`}
          type="button"
          onClick={() => onSelect(tab.id)}
        >
          <img src={tab.icon} alt="" />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
