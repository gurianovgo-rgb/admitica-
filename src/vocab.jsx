// Vocabulary trainer
const WORD_BANK = [
  { w: 'ubiquitous', def: 'Встречающийся повсюду; вездесущий', lvl: 'C1', choices: ['Вездесущий', 'Редкий', 'Древний', 'Полезный'], correct: 0 },
  { w: 'meticulous', def: 'Тщательный, скрупулёзный', lvl: 'C1', choices: ['Быстрый', 'Скрупулёзный', 'Гибкий', 'Громкий'], correct: 1 },
  { w: 'pragmatic', def: 'Практичный, прагматичный', lvl: 'B2', choices: ['Эмоциональный', 'Идеалистический', 'Практичный', 'Спонтанный'], correct: 2 },
  { w: 'paradigm', def: 'Образец, парадигма, модель', lvl: 'C1', choices: ['Препятствие', 'Алгоритм', 'Конфликт', 'Парадигма'], correct: 3 },
  { w: 'cognitive', def: 'Связанный с познанием', lvl: 'C1', choices: ['Познавательный', 'Спортивный', 'Эмоциональный', 'Цифровой'], correct: 0 },
  { w: 'deliberate', def: 'Преднамеренный; обдуманный', lvl: 'B2', choices: ['Случайный', 'Преднамеренный', 'Лёгкий', 'Срочный'], correct: 1 },
  { w: 'inherent', def: 'Присущий, внутренне свойственный', lvl: 'C1', choices: ['Внешний', 'Дополнительный', 'Присущий', 'Сложный'], correct: 2 },
  { w: 'scrutinize', def: 'Пристально изучать', lvl: 'C1', choices: ['Игнорировать', 'Уничтожить', 'Распространить', 'Тщательно изучать'], correct: 3 },
  { w: 'corroborate', def: 'Подтверждать, подкреплять', lvl: 'C2', choices: ['Подтверждать', 'Опровергать', 'Прятать', 'Преувеличивать'], correct: 0 },
  { w: 'feasible', def: 'Осуществимый, реальный', lvl: 'B2', choices: ['Невозможный', 'Реальный', 'Дорогой', 'Хрупкий'], correct: 1 },
];

const Vocab = () => {
  const [idx, setIdx] = usePersist('vocabIdx', 0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = usePersist('vocabScore', { right: 47, wrong: 8 });
  const [streak, setStreak] = usePersist('vocabStreak', 0);
  const word = WORD_BANK[idx % WORD_BANK.length];

  const onPick = (i) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === word.correct) {
      setScore({ ...score, right: score.right + 1 });
      setStreak(streak + 1);
    } else {
      setScore({ ...score, wrong: score.wrong + 1 });
      setStreak(0);
    }
  };

  const next = () => {
    setPicked(null);
    setIdx(idx + 1);
  };

  const total = score.right + score.wrong;
  const pct = total ? Math.round((score.right / total) * 100) : 0;

  return (
    <div className="fade-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Тренажёр слов</h1>
          <div className="page-sub">Академическая лексика для эссе и IELTS · повторение по методу интервалов</div>
        </div>
        <div className="row gap-8">
          <Pill kind="teal">{score.right} верных</Pill>
          <Pill kind="red">{score.wrong} ошибок</Pill>
          {streak > 0 && <Pill kind="amber">🔥 серия {streak}</Pill>}
        </div>
      </div>

      <div className="grid-3 mb-24">
        <div className="card summary-card">
          <span className="label">Точность</span>
          <div className="lead">{pct}%</div>
          <div className="progbar"><span style={{ width: pct + '%' }}></span></div>
          <div className="body">Хороший результат для уровня C1</div>
        </div>
        <div className="card summary-card">
          <span className="label">Слов выучено</span>
          <div className="lead">487 / 2,500</div>
          <div className="progbar"><span style={{ width: '20%' }}></span></div>
          <div className="body">До C1 Academic осталось ~120 ключевых слов</div>
        </div>
        <div className="card summary-card">
          <span className="label">Сегодня</span>
          <div className="lead">12 повторений</div>
          <div className="body">Повторите слова, которые система запланировала на сегодня — это поддержит уровень.</div>
        </div>
      </div>

      <div className="vocab-card-big">
        <span className="vocab-level">{word.lvl} · Academic</span>
        <div className="vocab-word">{word.w}</div>
        <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>Выберите перевод</div>

        <div className="vocab-choices" style={{ maxWidth: 500, margin: '20px auto 0' }}>
          {word.choices.map((c, i) => {
            let cls = 'vocab-choice';
            if (picked !== null) {
              if (i === word.correct) cls += ' correct';
              else if (i === picked) cls += ' wrong';
            }
            return (
              <button key={i} className={cls} onClick={() => onPick(i)}>{c}</button>
            );
          })}
        </div>

        {picked !== null && (
          <div style={{ marginTop: 24 }}>
            <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
              {picked === word.correct ? '✓ Правильно!' : '✗ Правильный ответ:'} <b style={{ color: 'var(--stone)', fontWeight: 500 }}>{word.def}</b>
            </div>
            <button className="btn btn-primary" onClick={next}>
              Следующее слово <Ico.arrowRight w={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

window.Vocab = Vocab;
