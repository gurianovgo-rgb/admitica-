// Home tab
const QUOTES = [
  { t: 'Лучшее время посадить дерево было 20 лет назад. Второе лучшее время — сейчас.', a: 'Китайская пословица' },
  { t: 'Вы становитесь тем, во что верите.', a: 'Опра Уинфри' },
  { t: 'Образование — это самое мощное оружие, которым вы можете изменить мир.', a: 'Нельсон Мандела' },
  { t: 'Не бойтесь медленно идти — бойтесь стоять на месте.', a: 'Конфуций' },
  { t: 'Качество — это не действие, это привычка.', a: 'Аристотель' },
  { t: 'Дисциплина — это мост между целями и достижениями.', a: 'Джим Рон' },
];

const Streak = ({ streak }) => {
  const days = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
  const today = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  return (
    <div className="card card-pad-lg">
      <div className="row-between mb-16">
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 500 }}>
            Ежедневный стрик
          </h3>
          <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
            {streak} {streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'} подряд — продолжайте!
          </div>
        </div>
        <div style={{ fontSize: 32, fontWeight: 500, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Ico.flame w={28} />{streak}
        </div>
      </div>
      <div className="streak-row">
        {days.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
            <div className={`streak-day ${i < today ? 'done' : ''} ${i === today ? 'done today' : ''}`}>
              {i <= today ? <Ico.check w={14} /> : i + 1}
            </div>
            <div style={{ fontSize: 11, color: 'var(--stone-2)', marginTop: 6 }}>{d}</div>
          </div>
        ))}
      </div>
      <div className="streak-msg">
        <span className="flame">🔥</span>
        <div>
          <b style={{ fontWeight: 500 }}>Вы пропустили вчера.</b>{' '}
          <span className="muted">Сегодняшняя сессия защитит ваш стрик.</span>
        </div>
      </div>
    </div>
  );
};

const FocusTimer = () => {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [todayMin, setTodayMin] = usePersist('todayMin', 47);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false);
          setTodayMin((m) => m + 25);
          return 25 * 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="card card-pad-lg">
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Pomodoro</h3>
      <div className="muted" style={{ fontSize: 13, marginBottom: 16 }}>Сфокусируйтесь на одной задаче 25 минут</div>
      <div className="timer-display">{mm}:{ss}</div>
      <div className="timer-stats">
        <div>Сегодня <b>{todayMin} мин</b></div>
        <div>Цель <b>120 мин</b></div>
      </div>
      <div className="row gap-8" style={{ marginTop: 18 }}>
        <button className="btn btn-primary" onClick={() => setRunning(!running)}>
          {running ? <><Ico.pause w={14} /> Пауза</> : <><Ico.play w={14} /> Старт</>}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => { setRunning(false); setSeconds(25*60); }}>
          Сбросить
        </button>
      </div>
    </div>
  );
};

const Quote = () => {
  const [i, setI] = usePersist('quoteIdx', 0);
  const q = QUOTES[i % QUOTES.length];
  return (
    <div className="quote-card">
      <button className="quote-refresh" onClick={() => setI(i + 1)} title="Другая цитата">
        <Ico.refresh w={16} />
      </button>
      <div className="quote-label">Цитата дня</div>
      <div className="quote-text">«{q.t}»</div>
      <div className="quote-author">— {q.a}</div>
    </div>
  );
};

const Home = ({ name, priorities, savedIds, setTab, openDetail }) => {
  const today = new Date().toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' });
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6) return 'Доброй ночи';
    if (h < 12) return 'Доброе утро';
    if (h < 18) return 'Добрый день';
    return 'Добрый вечер';
  })();

  // Top priorities = first 3 saved with priority
  const topPrio = priorities.slice(0, 3).map((id) => {
    return AdmiticaData.universities.find((u) => u.id === id) ||
           AdmiticaData.grants.find((g) => g.id === id) ||
           AdmiticaData.internships.find((i) => i.id === id);
  }).filter(Boolean);

  // Closest deadlines
  const allItems = [
    ...AdmiticaData.universities.filter((u) => savedIds.includes(u.id)),
    ...AdmiticaData.grants.filter((g) => savedIds.includes(g.id)),
    ...AdmiticaData.internships.filter((i) => savedIds.includes(i.id)),
  ].sort((a, b) => a.deadlineDays - b.deadlineDays);
  const upcoming = allItems.filter((x) => x.deadlineDays > 0 && x.deadlineDays < 900).slice(0, 3);

  return (
    <div className="fade-page">
      <div className="page-head">
        <div>
          <div className="muted" style={{ fontSize: 13, textTransform: 'capitalize' }}>{today}</div>
          <h1 className="page-title">{greeting}, {name} 👋</h1>
        </div>
        <button className="btn btn-blue" onClick={() => setTab('find')}>
          <Ico.add w={14} /> Подобрать программу
        </button>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <Streak streak={4} />
        <FocusTimer />
        <Quote />
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card card-pad-lg">
          <div className="row-between mb-16">
            <h3 style={{ fontSize: 16, fontWeight: 500 }}>Ваши приоритеты</h3>
            <button className="btn-link" onClick={() => setTab('p_priority')}>Все →</button>
          </div>
          {topPrio.length === 0 ? (
            <div className="muted" style={{ padding: '24px 0', textAlign: 'center' }}>
              Сохраните программу и отметьте её как приоритетную, чтобы она появилась здесь
            </div>
          ) : (
            <div className="prio-list">
              {topPrio.map((p, i) => (
                <div className="prio-item" key={p.id} onClick={() => openDetail(p)}>
                  <div className="prio-num">{i + 1}</div>
                  <div className="prio-info">
                    <div className="prio-title">{p.name}</div>
                    <div className="prio-prog">{p.program || p.role || p.org}</div>
                  </div>
                  <div className="prio-meta">
                    <span className={deadlinePill(p.deadlineDays).cls}>{deadlinePill(p.deadlineDays).txt}</span>
                  </div>
                  <span className="prio-arrow"><Ico.chev w={14} /></span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card card-pad-lg">
          <div className="row-between mb-16">
            <h3 style={{ fontSize: 16, fontWeight: 500 }}>Ближайшие дедлайны</h3>
            <Pill kind="amber">{upcoming.length} активных</Pill>
          </div>
          {upcoming.length === 0 ? (
            <div className="muted" style={{ padding: '24px 0', textAlign: 'center' }}>
              Нет приближающихся дедлайнов
            </div>
          ) : (
            <div className="prio-list">
              {upcoming.map((p) => (
                <div className="prio-item" key={p.id} onClick={() => openDetail(p)}>
                  <div className="prio-num" style={{ background: 'var(--amber)' }}>
                    <Ico.cal w={14} />
                  </div>
                  <div className="prio-info">
                    <div className="prio-title">{p.name}</div>
                    <div className="prio-prog">{p.deadline}</div>
                  </div>
                  <span className={deadlinePill(p.deadlineDays).cls}>{deadlinePill(p.deadlineDays).txt}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Section title="Прогресс по этапам">
        <div className="grid-3">
          <div className="card summary-card">
            <span className="label">Поиск программ</span>
            <div className="lead">{savedIds.length} сохранено</div>
            <div className="body">
              {savedIds.length < 5
                ? 'Рекомендуем сохранить 8–12 программ для shortlist'
                : 'Хороший shortlist — теперь приоритизируйте'}
            </div>
            <div className="progress"><span style={{ width: Math.min(100, savedIds.length * 10) + '%' }}></span></div>
          </div>
          <div className="card summary-card">
            <span className="label">Эссе</span>
            <div className="lead">2 черновика</div>
            <div className="body">Personal Statement для Bocconi — 760/1000 слов. Откройте редактор, чтобы продолжить.</div>
            <button className="btn-link" onClick={() => setTab('essay')}>Открыть редактор →</button>
          </div>
          <div className="card summary-card">
            <span className="label">Словарный запас</span>
            <div className="lead">487 слов</div>
            <div className="body">Уровень C1 — академическая лексика для эссе. Сегодня доступно 12 повторений.</div>
            <button className="btn-link" onClick={() => setTab('vocab')}>Тренировать →</button>
          </div>
        </div>
      </Section>
    </div>
  );
};

window.Home = Home;
