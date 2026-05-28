// My Programs: Saved, Priority, Roadmaps
const lookupItem = (id) =>
  AdmiticaData.universities.find((u) => u.id === id) ||
  AdmiticaData.grants.find((g) => g.id === id) ||
  AdmiticaData.internships.find((i) => i.id === id);

const Saved = ({ savedIds, priorities, toggleSave, togglePrio, openDetail }) => {
  const [filter, setFilter] = useState('all');
  let items = savedIds.map(lookupItem).filter(Boolean);
  if (filter === 'uni') items = items.filter((i) => i.program);
  if (filter === 'grant') items = items.filter((i) => i.funding);
  if (filter === 'intern') items = items.filter((i) => i.role);

  return (
    <div>
      <div className="subtabs">
        {[
          { id: 'all', label: 'Все' },
          { id: 'uni', label: 'Университеты' },
          { id: 'grant', label: 'Гранты' },
          { id: 'intern', label: 'Стажировки' },
        ].map((t) => (
          <button key={t.id} className={`subtab ${filter === t.id ? 'active' : ''}`} onClick={() => setFilter(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <Ico.heart w={36} />
          <h3 style={{ marginTop: 16, fontSize: 18 }}>Ничего не сохранено</h3>
          <p className="muted" style={{ marginTop: 8 }}>Найдите программы и нажмите ❤️ на карточке, чтобы они появились здесь</p>
        </div>
      ) : (
        <div className="grid-2">
          {items.map((u) => (
            <UniCard
              key={u.id}
              u={u}
              saved={true}
              prio={priorities.includes(u.id)}
              toggleSave={toggleSave}
              togglePrio={togglePrio}
              onOpen={openDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Priority = ({ priorities, setPriorities, toggleSave, togglePrio, openDetail }) => {
  const items = priorities.map(lookupItem).filter(Boolean);

  const move = (i, dir) => {
    const arr = [...priorities];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setPriorities(arr);
  };

  if (items.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 60 }}>
        <Ico.star w={36} />
        <h3 style={{ marginTop: 16, fontSize: 18 }}>Список приоритетов пуст</h3>
        <p className="muted" style={{ marginTop: 8 }}>Отметьте программу как приоритетную (звёздочка), чтобы она появилась здесь и в дашборде</p>
      </div>
    );
  }

  return (
    <div>
      <div className="muted mb-16" style={{ fontSize: 13 }}>
        Перетаскивайте программы стрелками, чтобы поменять порядок. Топ-3 показываются на главной.
      </div>
      <div className="card" style={{ padding: 0 }}>
        {items.map((p, i) => {
          const dp = deadlinePill(p.deadlineDays);
          return (
            <div className="prio-item" style={{ padding: 16, gap: 16 }} key={p.id}>
              <div className="col gap-8">
                <button className="prio-edit" style={{ width: 24, height: 22, padding: 0 }} onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                <button className="prio-edit" style={{ width: 24, height: 22, padding: 0 }} onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</button>
              </div>
              <div className="prio-num" style={{ background: i < 3 ? 'var(--amber)' : 'var(--mid-blue-dark)' }}>
                {i + 1}
              </div>
              <div className="u-logo" style={{ background: p.color, width: 38, height: 38, fontSize: 15 }}>{p.initial}</div>
              <div className="prio-info">
                <div className="prio-title">{p.name}</div>
                <div className="prio-prog">{p.program || p.role || p.org} · {p.flag} {p.country}</div>
              </div>
              <span className={dp.cls}>{dp.txt}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => openDetail(p)}>Открыть</button>
              <button className="u-heart" onClick={() => togglePrio(p.id)}><Ico.close w={16} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ROADMAP_STAGES = [
  { id: 's1', name: 'Изучение', desc: 'Программа отобрана' },
  { id: 's2', name: 'Языковой тест', desc: 'IELTS / DELE / TestDaF' },
  { id: 's3', name: 'Документы', desc: 'Транскрипт, диплом, апостиль' },
  { id: 's4', name: 'Эссе и SOP', desc: 'Personal Statement, мотивационное' },
  { id: 's5', name: 'Рекомендации', desc: '2-3 LoR' },
  { id: 's6', name: 'Подача заявки', desc: 'Через портал университета' },
  { id: 's7', name: 'Виза и въезд', desc: 'Studienkollegium / TLS' },
];

const RoadmapView = ({ roadmaps, setRoadmaps, openDetail }) => {
  if (roadmaps.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 60 }}>
        <Ico.cap w={36} />
        <h3 style={{ marginTop: 16, fontSize: 18 }}>Дорожных карт пока нет</h3>
        <p className="muted" style={{ marginTop: 8 }}>Откройте программу и нажмите «Создать дорожную карту»</p>
      </div>
    );
  }

  const advance = (id) => {
    setRoadmaps(roadmaps.map((r) => r.id === id ? { ...r, step: Math.min(ROADMAP_STAGES.length - 1, r.step + 1) } : r));
  };
  const back = (id) => {
    setRoadmaps(roadmaps.map((r) => r.id === id ? { ...r, step: Math.max(0, r.step - 1) } : r));
  };

  return (
    <div className="col gap-24">
      {roadmaps.map((r) => {
        const it = lookupItem(r.itemId);
        if (!it) return null;
        const dp = deadlinePill(it.deadlineDays);
        return (
          <div key={r.id} className="card card-pad-lg">
            <div className="row-between mb-16">
              <div className="row gap-12">
                <div className="u-logo" style={{ background: it.color }}>{it.initial}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{it.name}</div>
                  <div className="muted" style={{ fontSize: 13 }}>{it.program || it.role || it.org} · дедлайн {it.deadline}</div>
                </div>
              </div>
              <span className={dp.cls}>{dp.txt}</span>
            </div>

            <div className="roadmap">
              {ROADMAP_STAGES.map((s, i) => {
                const cls = i < r.step ? 'done' : i === r.step ? 'in-progress' : '';
                return (
                  <div className={`rm-step ${cls}`} key={s.id} style={{ minWidth: 130 }}>
                    <div className="rm-circle">
                      {i < r.step ? <Ico.check w={14} /> : i + 1}
                    </div>
                    <div className="rm-name">{s.name}</div>
                    <div className="rm-date">{s.desc}</div>
                  </div>
                );
              })}
            </div>

            <div className="row-between" style={{ marginTop: 18 }}>
              <div className="muted" style={{ fontSize: 13 }}>
                Этап <b style={{ color: 'var(--stone)' }}>{r.step + 1} / {ROADMAP_STAGES.length}</b>:
                {' '}{ROADMAP_STAGES[r.step].name}
              </div>
              <div className="row gap-8">
                <button className="btn btn-ghost btn-sm" onClick={() => back(r.id)}>Назад</button>
                <button className="btn btn-primary btn-sm" onClick={() => advance(r.id)}>
                  Следующий этап <Ico.arrowRight w={12} />
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => openDetail(it)}>Детали программы</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ProgramsTab = ({ subTab, savedIds, priorities, setPriorities, toggleSave, togglePrio, roadmaps, setRoadmaps, openDetail }) => {
  return (
    <div className="fade-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Мои программы</h1>
          <div className="page-sub">
            {savedIds.length} сохранено · {priorities.length} приоритетов · {roadmaps.length} дорожных карт
          </div>
        </div>
      </div>

      {subTab === 'p_saved' && <Saved savedIds={savedIds} priorities={priorities} toggleSave={toggleSave} togglePrio={togglePrio} openDetail={openDetail} />}
      {subTab === 'p_priority' && <Priority priorities={priorities} setPriorities={setPriorities} toggleSave={toggleSave} togglePrio={togglePrio} openDetail={openDetail} />}
      {subTab === 'p_roadmap' && <RoadmapView roadmaps={roadmaps} setRoadmaps={setRoadmaps} openDetail={openDetail} />}
    </div>
  );
};

window.ProgramsTab = ProgramsTab;
window.ROADMAP_STAGES = ROADMAP_STAGES;
