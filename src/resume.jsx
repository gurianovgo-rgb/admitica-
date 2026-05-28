// Resume builder via AI chat
const initialAchievements = [
  { id: 'a1', title: 'Победа в международной олимпиаде по математике', org: 'IMO Tashkent · 2023', skills: ['analytical', 'math', 'leadership'], desc: 'Серебряная медаль в командном этапе. Выступал в составе сборной Узбекистана.' },
  { id: 'a2', title: 'Стажировка в EY Tashkent — Audit', org: 'EY · Лето 2024 · 6 недель', skills: ['finance', 'excel', 'audit'], desc: 'Подготовил 14 рабочих файлов для аудита банковского сектора. Прошёл внутренний тренинг IFRS.' },
];

const AchievementForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial || { title: '', org: '', desc: '', skills: '' });
  const skillsArr = typeof form.skills === 'string' ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : form.skills;

  return (
    <div className="card" style={{ background: 'rgba(15,110,86,0.04)', border: '1px solid var(--teal)', marginTop: 16 }}>
      <div className="row-between mb-16">
        <strong style={{ fontSize: 14 }}>{initial?.id ? 'Редактировать' : 'Новое достижение'}</strong>
        <button className="btn-link" onClick={onCancel}><Ico.close w={14} /></button>
      </div>
      <div className="col gap-12">
        <div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Название</div>
          <input className="ob-input" style={{ fontSize: 14, padding: '8px 12px' }} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Например, Победа в олимпиаде по математике" />
        </div>
        <div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Организация и дата</div>
          <input className="ob-input" style={{ fontSize: 14, padding: '8px 12px' }} value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} placeholder="EY · Лето 2024" />
        </div>
        <div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Описание (1-2 предложения с метриками)</div>
          <textarea
            className="ob-input"
            style={{ fontSize: 14, padding: '10px 12px', minHeight: 70, fontFamily: 'inherit' }}
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
            placeholder="Что вы сделали, какой был результат (число / %)"
          />
        </div>
        <div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Навыки (через запятую)</div>
          <input className="ob-input" style={{ fontSize: 14, padding: '8px 12px' }} value={typeof form.skills === 'string' ? form.skills : (form.skills || []).join(', ')} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="leadership, analytical, math" />
        </div>
        <div className="row gap-8" style={{ marginTop: 4 }}>
          <button
            className="btn btn-primary"
            disabled={!form.title.trim()}
            onClick={() => onSave({ ...form, skills: skillsArr })}
          >
            <Ico.check w={13} /> Сохранить
          </button>
          <button className="btn btn-ghost" onClick={onCancel}>Отмена</button>
        </div>
      </div>
    </div>
  );
};

const SuggestionCard = ({ suggestion, onAccept, onTweak }) => (
  <div className="card" style={{ background: 'rgba(60,52,137,0.05)', border: '1px solid rgba(60,52,137,0.25)', marginTop: 6, marginBottom: 8 }}>
    <div className="row gap-8" style={{ marginBottom: 10 }}>
      <Ico.sparkle w={14} />
      <strong style={{ fontSize: 12, color: 'var(--purple-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI оформил пункт</strong>
    </div>
    <div style={{ fontWeight: 500, fontSize: 15 }}>{suggestion.title}</div>
    <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{suggestion.org}</div>
    <div style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{suggestion.desc}</div>
    <div className="ac-skills" style={{ marginTop: 10 }}>
      {(suggestion.skills || []).map((s) => <span key={s} className="tag">#{s}</span>)}
    </div>
    <div className="row gap-8" style={{ marginTop: 14 }}>
      <button className="btn btn-primary btn-sm" onClick={onAccept}>
        <Ico.add w={12} /> Добавить в резюме
      </button>
      <button className="btn btn-ghost btn-sm" onClick={onTweak}>Изменить</button>
    </div>
  </div>
);

const Resume = () => {
  const [achievements, setAchievements] = usePersist('achievements', initialAchievements);
  const [msgs, setMsgs] = usePersist('chat_v2', [
    { from: 'ai', txt: 'Привет! Я помогу собрать сильное резюме. Расскажите про достижение — олимпиада, стажировка, проект, лидерская роль и т.д. Я задам пару уточнений и оформлю это в готовый пункт CV.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [turnCount, setTurnCount] = useState(0); // user replies in current achievement story
  const [draft, setDraft] = useState(null); // suggested achievement awaiting approval
  const [editing, setEditing] = useState(null); // null | 'new' | achievement object
  const showToast = React.useContext(ToastCtx);
  const scrollRef = React.useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, typing, draft]);

  const send = async () => {
    if (!input.trim() || typing) return;
    const userMsg = input.trim();
    const newMsgs = [...msgs, { from: 'user', txt: userMsg }];
    setMsgs(newMsgs);
    setInput('');
    setTyping(true);
    const nextTurn = turnCount + 1;
    setTurnCount(nextTurn);

    try {
      // After 2 user replies — generate suggestion. Otherwise — clarifying question.
      if (nextTurn >= 2) {
        const reply = await window.claude.complete(
          `Ты помогаешь собрать резюме для европейских университетов. На основе диалога оформи одно достижение в JSON: {"title":"короткое название","org":"организация и дата","desc":"1-2 предложения с метриками","skills":["3 английских тега"]}. Только JSON, без markdown.

Диалог:
${newMsgs.map((m) => `${m.from}: ${m.txt}`).join('\n')}`
        );
        const m = reply.match(/\{[\s\S]*\}/);
        if (m) {
          const obj = JSON.parse(m[0]);
          setMsgs((prev) => [...prev, { from: 'ai', txt: 'Я оформил это в готовый пункт резюме. Проверьте — можно сразу добавить или подправить:', suggestion: obj }]);
          setDraft(obj);
          setTurnCount(0);
        } else {
          setMsgs((prev) => [...prev, { from: 'ai', txt: 'Спасибо! Чтобы оформить пункт, мне нужен ещё один момент: какой был конкретный результат — число, процент, место?' }]);
        }
      } else {
        const reply = await window.claude.complete(
          `Ты помогаешь собрать резюме. Пользователь рассказал о достижении. Задай ОДИН короткий уточняющий вопрос (1-2 предложения, на русском), чтобы добавить конкретику — числа, метрики, роль. Не повторяйся, не благодари.

Сообщение: ${userMsg}`
        );
        setMsgs((prev) => [...prev, { from: 'ai', txt: reply.trim() }]);
      }
    } catch (e) {
      // Offline fallback
      const fallbacks = [
        'Какой конкретный результат — число, %, место? Это сделает пункт сильнее.',
        'Какая была ваша личная роль и что вы делали в команде?',
      ];
      setMsgs((prev) => [...prev, { from: 'ai', txt: fallbacks[Math.min(nextTurn - 1, fallbacks.length - 1)] }]);
    }
    setTyping(false);
  };

  const acceptDraft = (d) => {
    setAchievements([...achievements, { id: 'a' + Date.now(), ...d }]);
    setDraft(null);
    setMsgs((m) => [...m, { from: 'ai', txt: '✓ Добавил в резюме. Расскажите о следующем достижении или нажмите «Сбросить диалог», чтобы начать заново.' }]);
    showToast('Достижение добавлено');
  };

  const resetChat = () => {
    setMsgs([{ from: 'ai', txt: 'Поехали заново! Расскажите про любое достижение — академическое, профессиональное или общественное.' }]);
    setTurnCount(0);
    setDraft(null);
  };

  const saveManual = (form) => {
    if (editing && editing.id) {
      setAchievements(achievements.map((a) => a.id === editing.id ? { ...a, ...form } : a));
      showToast('Изменения сохранены');
    } else {
      setAchievements([...achievements, { id: 'a' + Date.now(), ...form }]);
      showToast('Достижение добавлено');
    }
    setEditing(null);
  };

  return (
    <div className="fade-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Сборка резюме</h1>
          <div className="page-sub">AI помогает превратить ваши истории в bullet points для европейских CV</div>
        </div>
        <div className="row gap-8">
          <button className="btn btn-ghost"><Ico.dl w={13} /> Экспорт PDF</button>
        </div>
      </div>

      <div className="essay-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 600 }}>
          <div className="row-between" style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <div>
              <strong style={{ fontSize: 14 }}>AI-помощник</strong>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Расскажите → AI уточнит → оформит готовый пункт</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={resetChat}>
              <Ico.refresh w={12} /> Сбросить
            </button>
          </div>
          <div className="chat-stream" ref={scrollRef} style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
            {msgs.map((m, i) => (
              <React.Fragment key={i}>
                <div className={`chat-bubble ${m.from}`}>{m.txt}</div>
                {m.suggestion && (
                  <SuggestionCard
                    suggestion={m.suggestion}
                    onAccept={() => acceptDraft(m.suggestion)}
                    onTweak={() => { setEditing({ ...m.suggestion }); }}
                  />
                )}
              </React.Fragment>
            ))}
            {typing && (
              <div className="chat-bubble ai">
                <div className="typing-dots"><span></span><span></span><span></span></div>
              </div>
            )}
          </div>
          <div style={{ padding: 14, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input
              className="ob-input"
              style={{ flex: 1, fontSize: 14, padding: '10px 14px' }}
              placeholder={typing ? 'AI печатает…' : 'Расскажите о достижении…'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              disabled={typing}
            />
            <button className="btn btn-primary" onClick={send} disabled={!input.trim() || typing}>
              <Ico.send w={14} />
            </button>
          </div>
        </div>

        <div>
          <div className="row-between mb-16">
            <strong style={{ fontSize: 14 }}>Ваши достижения</strong>
            <div className="row gap-8">
              <Pill kind="teal">{achievements.length} в резюме</Pill>
              <button className="btn btn-blue btn-sm" onClick={() => setEditing({ title: '', org: '', desc: '', skills: '' })}>
                <Ico.add w={12} /> Добавить
              </button>
            </div>
          </div>

          {editing && (
            <AchievementForm
              initial={editing}
              onSave={saveManual}
              onCancel={() => setEditing(null)}
            />
          )}

          <div className="col gap-12" style={{ marginTop: editing ? 16 : 0 }}>
            {achievements.length === 0 && !editing && (
              <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--stone-2)' }}>
                Пока пусто. Расскажите AI о достижении или добавьте вручную.
              </div>
            )}
            {achievements.map((a) => (
              <div key={a.id} className="achievement-card">
                <div className="ac-title">{a.title}</div>
                <div className="ac-row">{a.org}</div>
                <div style={{ fontSize: 13, color: 'var(--stone)', marginTop: 8, lineHeight: 1.5 }}>{a.desc}</div>
                <div className="ac-skills">
                  {(a.skills || []).map((s) => <span key={s} className="tag">#{s}</span>)}
                </div>
                <div className="row" style={{ marginTop: 10, gap: 6 }}>
                  <button className="btn-link" onClick={() => setEditing({ ...a })}>Изменить</button>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <button className="btn-link" onClick={() => setAchievements(achievements.filter((x) => x.id !== a.id))}>Удалить</button>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginTop: 16, background: 'rgba(60,52,137,0.04)', border: '1px solid rgba(60,52,137,0.15)' }}>
            <div className="row gap-8" style={{ marginBottom: 8 }}>
              <Ico.sparkle w={14} />
              <strong style={{ fontSize: 13, color: 'var(--purple-dark)' }}>Что усилит резюме</strong>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--stone)', lineHeight: 1.65 }}>
              <li>Стажировка в финансах или консалтинге</li>
              <li>Лидерская роль в студенческой организации</li>
              <li>Количественный результат в каждом пункте</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Resume = Resume;
