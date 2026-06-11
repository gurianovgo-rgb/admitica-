import { useEffect, useRef } from "react"
import { motion, animate, useReducedMotion } from "framer-motion"
import { ArrowRight, ArrowUpRight, Calendar, Check, Flame, Moon, RefreshCw, Sparkles, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePersist, readPersist } from "@/lib/persist"
import { roadmapProgress, lookupItem, deadlineLabel } from "@/lib/roadmap"
import type { AnyProgram, RoadmapEntry } from "@/legacy"
import { cn } from "@/lib/utils"

/* ---------- shared motion presets (ease-out, 200–300ms) ---------- */
const EASE = [0.16, 1, 0.3, 1] as const
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
}
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

/* ---------- content (same as legacy home.jsx) ---------- */
const QUOTES = [
  { t: "Лучшее время посадить дерево было 20 лет назад. Второе лучшее время — сейчас.", a: "Китайская пословица" },
  { t: "Вы становитесь тем, во что верите.", a: "Опра Уинфри" },
  { t: "Образование — это самое мощное оружие, которым вы можете изменить мир.", a: "Нельсон Мандела" },
  { t: "Не бойтесь медленно идти — бойтесь стоять на месте.", a: "Конфуций" },
  { t: "Качество — это не действие, это привычка.", a: "Аристотель" },
  { t: "Дисциплина — это мост между целями и достижениями.", a: "Джим Рон" },
]

/* ---------- tiny count-up number ---------- */
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced) {
      el.textContent = String(to) + suffix
      return
    }
    const controls = animate(0, to, {
      duration: 0.9,
      ease: EASE,
      onUpdate: (v) => {
        el.textContent = String(Math.round(v)) + suffix
      },
    })
    return () => controls.stop()
  }, [to, suffix, reduced])
  return <span ref={ref}>0{suffix}</span>
}

/* ---------- greeting helpers (как в legacy) ---------- */
const greetByHour = () => {
  const h = new Date().getHours()
  if (h < 6) return "Доброй ночи"
  if (h < 12) return "Доброе утро"
  if (h < 18) return "Добрый день"
  return "Добрый вечер"
}
const todayName = () =>
  new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })

/* ---------- cards ---------- */
function GoalCard({ roadmaps }: { roadmaps: RoadmapEntry[] }) {
  const progs = roadmaps
    .map((r) => ({ r, item: lookupItem(r.itemId) }))
    .filter((x): x is { r: RoadmapEntry; item: AnyProgram } => Boolean(x.item))
    .map((x) => ({ ...x, p: roadmapProgress(x.r, x.item) }))

  const pct = progs.length ? Math.round(progs.reduce((s, x) => s + x.p.pct, 0) / progs.length) : 0
  const current = progs[0] ?? null

  return (
    <Card className="relative col-span-2 overflow-hidden p-7 max-md:col-span-full">
      <div className="hero-glow pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-fg-muted uppercase">
          <Sparkles className="size-3.5 text-accent-text" />
          Цель — поступление
        </div>
        <div className="mt-4 text-6xl font-bold tracking-tight">
          <CountUp to={pct} suffix="%" />
        </div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-fg/8">
          <motion.div
            className="h-full rounded-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          />
        </div>
        <div className="mt-5 flex items-end justify-between gap-4">
          <p className="text-sm leading-relaxed text-fg-muted">
            {current ? (
              <>
                Сейчас: <span className="font-semibold text-fg">{current.item.name}</span>
                <br />
                Этап {Math.min(current.p.done + 1, current.p.total)} из {current.p.total}
                {current.p.currentName ? ` — ${current.p.currentName}` : " — всё выполнено"}
              </>
            ) : (
              "Добавь вуз в приоритеты, чтобы начать отслеживать прогресс."
            )}
          </p>
          <Button variant="secondary" size="sm" className="shrink-0">
            Открыть <ArrowRight />
          </Button>
        </div>
      </div>
    </Card>
  )
}

function StreakCard() {
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
  const jsDay = new Date().getDay()
  const today = jsDay === 0 ? 6 : jsDay - 1
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold">Ежедневный стрик</div>
          <div className="mt-1 text-xs text-fg-muted">4 дня подряд — продолжайте</div>
        </div>
        <div className="flex items-center gap-1.5 text-2xl font-bold text-warning">
          <Flame className="size-5" />4
        </div>
      </div>
      <div className="mt-5 flex justify-between gap-1.5">
        {days.map((d, i) => {
          const done = i <= today
          return (
            <div key={d} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25, ease: EASE, delay: 0.25 + i * 0.05 }}
                className={cn(
                  "grid aspect-square w-full max-w-8 place-items-center rounded-full border text-[10px] font-medium",
                  done
                    ? "border-transparent bg-accent text-accent-fg"
                    : "border-border bg-card-2 text-fg-faint",
                  i === today && "ring-2 ring-accent/40",
                )}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </motion.div>
              <span className="text-[10px] text-fg-faint">{d}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function QuoteCard() {
  const [i, setI] = usePersist<number>("quoteIdx", 0)
  const q = QUOTES[i % QUOTES.length]
  return (
    <Card className="relative p-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="absolute top-4 right-4"
        onClick={() => setI(i + 1)}
        aria-label="Другая цитата"
      >
        <RefreshCw />
      </Button>
      <div className="text-xs font-semibold tracking-widest text-accent-text uppercase">Цитата дня</div>
      <motion.blockquote
        key={i}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: EASE }}
        className="mt-3 text-[15px] leading-relaxed font-medium text-balance"
      >
        «{q.t}»
      </motion.blockquote>
      <div className="mt-3 text-xs text-fg-muted">— {q.a}</div>
    </Card>
  )
}

function ListRow({
  item,
  index,
  trailing,
}: {
  item: AnyProgram
  index?: number
  trailing?: React.ReactNode
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ x: 3 }}
      transition={{ duration: 0.2, ease: EASE }}
      className="group flex cursor-pointer items-center gap-3.5 rounded-xl px-3 py-3 transition-colors duration-200 hover:bg-fg/4"
    >
      {index !== undefined && (
        <div
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-lg text-xs font-semibold",
            index < 3 ? "bg-accent text-accent-fg" : "bg-card-2 text-fg-muted",
          )}
        >
          {index + 1}
        </div>
      )}
      <div
        className="grid size-9 shrink-0 place-items-center rounded-xl text-sm font-semibold text-white"
        style={{ background: (item as { color?: string }).color ?? "#0f766e" /* white label needs a dark fill in both themes */ }}
      >
        {(item as { initial?: string }).initial ?? item.name[0]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{item.name}</div>
        <div className="truncate text-xs text-fg-muted">
          {"program" in item ? item.program : "org" in item ? item.org : (item as { role?: string }).role}
        </div>
      </div>
      {trailing}
      <ArrowUpRight className="size-4 shrink-0 text-fg-faint opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    </motion.div>
  )
}

function DeadlineBadge({ days }: { days: number }) {
  const d = deadlineLabel(days)
  const variant =
    d.tone === "danger" ? "destructive" : d.tone === "warn" ? "warning" : d.tone === "info" ? "default" : "secondary"
  return <Badge variant={variant}>{d.txt}</Badge>
}

/* ---------- page ---------- */
export default function App() {
  // Theme lives in a NEW key (admitica.theme) — existing keys untouched.
  const [theme, setTheme] = usePersist<"dark" | "light">("theme", "dark")
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // Same storage keys and defaults as the legacy desktop app — DO NOT change.
  const name = readPersist<string>("name", "друг")
  const [priorities] = usePersist<string[]>("priorities", ["u1", "u2", "g1"])
  const [savedIds] = usePersist<string[]>("savedIds", ["u1", "u2", "g1", "g2", "i1"])
  const [roadmaps] = usePersist<RoadmapEntry[]>("roadmaps", [{ id: "rm1", itemId: "u1", step: 2 }])

  const topPrio = priorities.slice(0, 3).map(lookupItem).filter((x): x is AnyProgram => Boolean(x))
  const upcoming = savedIds
    .map(lookupItem)
    .filter((x): x is AnyProgram => Boolean(x))
    .filter((x) => x.deadlineDays > 0 && x.deadlineDays < 900)
    .sort((a, b) => a.deadlineDays - b.deadlineDays)
    .slice(0, 3)

  return (
    <div className="min-h-screen">
      {/* nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6">
          <div className="flex items-center gap-2 text-lg font-bold tracking-tight">
            Admitica<span className="size-1.5 rounded-full bg-accent" />
          </div>
          <Badge variant="outline" className="max-sm:hidden">
            v2 preview · Vite
          </Badge>
          <Button
            variant="outline"
            size="icon-sm"
            className="ml-auto"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
          <Button size="sm" className="max-sm:hidden">
            Подобрать программу <ArrowRight />
          </Button>
        </div>
      </header>

      <motion.main variants={stagger} initial="hidden" animate="show" className="mx-auto max-w-6xl px-6 pt-12 pb-24">
        {/* hero */}
        <motion.div variants={fadeUp} className="mb-10">
          <div className="text-sm text-fg-muted capitalize">{todayName()}</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {greetByHour()}, {name}
            <span className="text-accent-text">.</span>
          </h1>
          <p className="mt-3 max-w-xl text-fg-muted">
            Твой путь к поступлению в Европу — программы, дедлайны и прогресс в одном месте.
          </p>
        </motion.div>

        {/* bento: goal + streak + quote */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          <GoalCard roadmaps={roadmaps} />
          <div className="flex flex-col gap-4">
            <StreakCard />
          </div>
          <div className="col-span-3 grid grid-cols-3 gap-4 max-md:col-span-1 max-md:grid-cols-1">
            <div className="col-span-1 max-md:col-span-1">
              <QuoteCard />
            </div>

            {/* priorities */}
            <Card className="p-5">
              <div className="mb-2 flex items-center justify-between px-3">
                <h2 className="text-sm font-semibold">Ваши приоритеты</h2>
                <Button variant="link" size="xs">
                  Все <ArrowRight />
                </Button>
              </div>
              <motion.div variants={stagger} initial="hidden" animate="show">
                {topPrio.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-fg-muted">
                    Отметьте программу как приоритетную, чтобы она появилась здесь
                  </p>
                ) : (
                  topPrio.map((p, i) => (
                    <ListRow key={p.id} item={p} index={i} trailing={<DeadlineBadge days={p.deadlineDays} />} />
                  ))
                )}
              </motion.div>
            </Card>

            {/* deadlines */}
            <Card className="p-5">
              <div className="mb-2 flex items-center justify-between px-3">
                <h2 className="text-sm font-semibold">Ближайшие дедлайны</h2>
                <Badge variant="warning">
                  <Calendar className="size-3" /> {upcoming.length} активных
                </Badge>
              </div>
              <motion.div variants={stagger} initial="hidden" animate="show">
                {upcoming.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-fg-muted">Нет приближающихся дедлайнов</p>
                ) : (
                  upcoming.map((p) => (
                    <ListRow key={p.id} item={p} trailing={<DeadlineBadge days={p.deadlineDays} />} />
                  ))
                )}
              </motion.div>
            </Card>
          </div>
        </motion.div>

        {/* progress summary */}
        <motion.div variants={fadeUp} className="mt-10">
          <h2 className="mb-4 text-xs font-semibold tracking-widest text-fg-muted uppercase">Прогресс по этапам</h2>
          <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
            {(
              [
                {
                  label: "Поиск программ",
                  lead: `${savedIds.length} сохранено`,
                  body:
                    savedIds.length < 5
                      ? "Рекомендуем сохранить 8–12 программ для shortlist"
                      : "Хороший shortlist — теперь приоритизируйте",
                  bar: Math.min(100, savedIds.length * 10),
                },
                {
                  label: "Эссе",
                  lead: "2 черновика",
                  body: "Personal Statement для Bocconi — 760/1000 слов. Откройте редактор, чтобы продолжить.",
                },
                {
                  label: "Резюме",
                  lead: "2 достижения",
                  body: "AI-помощник поможет оформить опыт в bullet points для европейских CV.",
                },
              ] as { label: string; lead: string; body: string; bar?: number }[]
            ).map((c) => (
              <motion.div
                key={c.label}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2, ease: EASE }}
              >
                <Card className="h-full p-6">
                  <div className="text-xs font-semibold tracking-widest text-fg-muted uppercase">{c.label}</div>
                  <div className="mt-2 text-xl font-bold">{c.lead}</div>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-muted">{c.body}</p>
                  {c.bar !== undefined && (
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-fg/8">
                      <motion.div
                        className="h-full rounded-full bg-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${c.bar}%` }}
                        transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
                      />
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.main>
    </div>
  )
}
