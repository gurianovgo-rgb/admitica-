// Sidebar navigation
const Sidebar = ({ tab, setTab, name, plan, slideIn, onSettings }) => {
  const [progExpanded, setProgExpanded] = useState(tab.startsWith('p_'));

  const items = [
    { id: 'home', label: 'Главная', icon: 'home' },
    { id: 'find', label: 'Подобрать программу', icon: 'search' },
    {
      id: 'programs',
      label: 'Мои программы',
      icon: 'bookmark',
      sub: [
        { id: 'p_saved', label: 'Сохранённые' },
        { id: 'p_priority', label: 'Приоритеты' },
        { id: 'p_roadmap', label: 'Дорожные карты' },
      ],
    },
    { id: 'essay', label: 'Редактор эссе', icon: 'pen' },
    { id: 'resume', label: 'Сборка резюме', icon: 'briefcase' },
  ];

  const initial = (name || 'У').charAt(0).toUpperCase();

  return (
    <aside className={`sidebar ${slideIn}`}>
      <div className="sb-logo">
        <span className="sb-logo-mark">A</span>
        <span className="lbl">Admitica</span>
      </div>
      <nav className="sb-nav">
        {items.map((it) => {
          const Icon = Ico[it.icon];
          const isActive = tab === it.id || (it.sub && it.sub.some((s) => s.id === tab));
          return (
            <div key={it.id}>
              <div
                className={`sb-item ${isActive ? 'active' : ''} ${it.sub && progExpanded ? 'expanded' : ''}`}
                onClick={() => {
                  if (it.sub) {
                    setProgExpanded(!progExpanded);
                    if (!isActive) setTab(it.sub[0].id);
                  } else {
                    setTab(it.id);
                  }
                }}
              >
                <span className="ico"><Icon /></span>
                <span className="lbl">{it.label}</span>
                {it.sub && <span className="chev"><Ico.chev w={14} /></span>}
              </div>
              {it.sub && progExpanded && (
                <div className="sb-sub">
                  {it.sub.map((s) => (
                    <div
                      key={s.id}
                      className={`sb-sub-item ${tab === s.id ? 'active' : ''}`}
                      onClick={() => setTab(s.id)}
                    >
                      {s.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="sb-user" onClick={onSettings}>
        <div className="sb-avatar">{initial}</div>
        <div className="sb-user-meta" style={{ flex: 1, minWidth: 0 }}>
          <div className="sb-user-name">{name || 'Пользователь'}</div>
          <div className="sb-user-plan">{plan}</div>
        </div>
        <span className="sb-user-cog"><Ico.cog w={16} /></span>
      </div>
    </aside>
  );
};

window.Sidebar = Sidebar;
