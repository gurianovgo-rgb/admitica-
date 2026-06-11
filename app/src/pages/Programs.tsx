import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  Banknote,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  GraduationCap,
  Heart,
  MapPin,
  Star,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { roadmapProgress, lookupItem, deadlineLabel } from "@/lib/roadmap"
import type { AnyProgram, Grant, Internship, RoadmapEntry, University } from "@/legacy"
import type { Tab } from "@/lib/nav"
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

/* ---------- type guards over the legacy data union ---------- */
const isUni = (p: AnyProgram): p is University => "program" in p
const isGrant = (p: AnyProgram): p is Grant => "funding" in p
const isIntern = (p: AnyProgram): p is Internship => "role" in p

/* ---------- small shared pieces ---------- */
function DeadlineBadge({ days, withIcon = false }: { days: number; withIcon?: boolean }) {
  const d = deadlineLabel(days)
  const variant =
    d.tone === "danger" ? "destructive" : d.tone === "warn" ? "warning" : d.tone === "info" ? "default" : "secondary"
  return (
    <Badge variant={variant}>
      {withIcon && <Calendar className="size-3" />}
      {d.txt}
    </Badge>
  )
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { id: T; label: string }[]
}) {
  return (
    <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1">
      {options.map((o) => (
        <button
          key={o.id}
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "shrink-0 rounded-lg px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
            value === o.id
              ? "bg-accent font-semibold text-accent-fg shadow-[0_8px_24px_-12px_var(--color-accent-glow)]"
              : "text-fg-muted hover:bg-fg/5 hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function EmptyState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="flex flex-col items-center gap-0 px-6 py-14 text-center">
        <span className="text-fg-faint">{icon}</span>
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-fg-muted">{text}</p>
      </Card>
    </motion.div>
  )
}

/* ---------- saved card (port of legacy UniCard, used with saved=true) ---------- */
function SavedCard({
  u,
  prio,
  toggleSave,
  togglePrio,
  onOpen,
}: {
  u: AnyProgram
  prio: boolean
  toggleSave: (id: string) => void
  togglePrio: (id: string) => void
  onOpen: (item: AnyProgram) => void
}) {
  const sub = isUni(u) ? u.program : isGrant(u) ? u.org : u.role
  const city = isUni(u) || isIntern(u) ? u.city : undefined
  const money = isUni(u) ? u.tuition : isGrant(u) ? u.amount : u.stipend
  const field = isIntern(u) ? u.industry : u.field

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -3 }} transition={{ duration: 0.2, ease: EASE }} className="h-full">
      <Card className="flex h-full flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div
            className="grid size-10 shrink-0 place-items-center rounded-xl text-sm font-semibold text-white"
            style={{ background: u.color ?? "#0f766e" }}
          >
            {u.initial ?? u.name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{u.name}</div>
            <div className="truncate text-xs text-fg-muted">{sub}</div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-accent-text hover:text-accent-text"
            title="В избранном"
            aria-label="В избранном"
            onClick={() => toggleSave(u.id)}
          >
            <Heart className="fill-current" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-fg-muted">
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="size-3.5 shrink-0" /> {u.flag} {city || u.country}
          </span>
          {"degree" in u && u.degree && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <GraduationCap className="size-3.5 shrink-0" /> {u.degree}
            </span>
          )}
          {isIntern(u) && u.duration && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <Calendar className="size-3.5 shrink-0" /> {u.duration}
            </span>
          )}
          <span className="inline-flex min-w-0 items-center gap-1">
            <Banknote className="size-3.5 shrink-0" /> {money}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{field}</Badge>
          {isUni(u) && u.language && <Badge variant="secondary">{u.language}</Badge>}
          {isUni(u) && u.scholarship && <Badge>Гранты</Badge>}
          {isIntern(u) && u.format && <Badge variant="secondary">{u.format}</Badge>}
        </div>

        <p className="line-clamp-2 text-[13px] leading-relaxed text-fg-muted">{u.desc}</p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
          <DeadlineBadge days={u.deadlineDays} withIcon />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(prio && "text-warning hover:text-warning")}
              onClick={() => togglePrio(u.id)}
            >
              <Star className={cn(prio && "fill-current")} />
              {prio ? "Приоритет" : "В приоритеты"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onOpen(u)}>
              Подробнее <ArrowRight />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

/* ---------- Saved view ---------- */
type SavedFilter = "all" | "uni" | "grant" | "intern"

function Saved({
  savedIds,
  priorities,
  toggleSave,
  togglePrio,
  openDetail,
}: {
  savedIds: string[]
  priorities: string[]
  toggleSave: (id: string) => void
  togglePrio: (id: string) => void
  openDetail: (item: AnyProgram) => void
}) {
  const [filter, setFilter] = useState<SavedFilter>("all")
  let items = savedIds.map(lookupItem).filter((x): x is AnyProgram => Boolean(x))
  if (filter === "uni") items = items.filter(isUni)
  if (filter === "grant") items = items.filter(isGrant)
  if (filter === "intern") items = items.filter(isIntern)

  return (
    <div>
      <motion.div variants={fadeUp} className="mb-6">
        <Segmented<SavedFilter>
          value={filter}
          onChange={setFilter}
          options={[
            { id: "all", label: "Все" },
            { id: "uni", label: "Университеты" },
            { id: "grant", label: "Гранты" },
            { id: "intern", label: "Стажировки" },
          ]}
        />
      </motion.div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-9" />}
          title="Ничего не сохранено"
          text="Найдите программы и нажмите ❤️ на карточке, чтобы они появились здесь"
        />
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((u) => (
            <SavedCard
              key={u.id}
              u={u}
              prio={priorities.includes(u.id)}
              toggleSave={toggleSave}
              togglePrio={togglePrio}
              onOpen={openDetail}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}

/* ---------- Priority view: ordering + inline roadmaps ---------- */
function Priority({
  priorities,
  setPriorities,
  togglePrio,
  roadmaps,
  setRoadmaps,
  openDetail,
}: {
  priorities: string[]
  setPriorities: (ids: string[]) => void
  togglePrio: (id: string) => void
  roadmaps: RoadmapEntry[]
  setRoadmaps: (r: RoadmapEntry[]) => void
  openDetail: (item: AnyProgram) => void
}) {
  const items = priorities.map(lookupItem).filter((x): x is AnyProgram => Boolean(x))
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeStage, setActiveStage] = useState<string | null>(null) // stage id within expanded roadmap

  const move = (i: number, dir: number) => {
    const arr = [...priorities]
    const j = i + dir
    if (j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    setPriorities(arr)
  }

  const rmFor = (itemId: string) => roadmaps.find((r) => r.itemId === itemId)

  const toggleExpand = (p: AnyProgram) => {
    if (!isUni(p)) {
      openDetail(p) // grants/internships: no roadmap, open detail
      return
    }
    if (expandedId === p.id) {
      setExpandedId(null)
      return
    }
    if (!rmFor(p.id)) {
      setRoadmaps([...roadmaps, { id: "rm" + Date.now(), itemId: p.id, step: 0, checks: {} }])
    }
    setExpandedId(p.id)
    setActiveStage(null)
  }

  const toggleCheck = (itemId: string, stageId: string, idx: number) => {
    setRoadmaps(
      roadmaps.map((r) => {
        if (r.itemId !== itemId) return r
        const checks: Record<string, boolean[]> = { ...(r.checks || {}) }
        const arr = [...(checks[stageId] || [])]
        arr[idx] = !arr[idx]
        checks[stageId] = arr
        return { ...r, checks }
      }),
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Star className="size-9" />}
        title="Список приоритетов пуст"
        text="Отметьте программу как приоритетную (звёздочка), чтобы она появилась здесь и в дашборде"
      />
    )
  }

  return (
    <div>
      <motion.div variants={fadeUp} className="mb-4 text-[13px] text-fg-muted">
        Нажмите на вуз, чтобы раскрыть его роадмап. Стрелками меняйте порядок — топ-3 видны на главной.
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-3">
        {items.map((p, i) => {
          const isOpen = expandedId === p.id
          const rm = rmFor(p.id)
          const prog = rm && isUni(p) ? roadmapProgress(rm, p) : null
          const stages = isOpen && isUni(p) ? window.buildRoadmapStages(p) : null
          const stage = stages
            ? (stages.find((s) => s.id === activeStage) ??
              stages.find((s) => s.name === prog?.currentName) ??
              stages[0])
            : null

          return (
            <motion.div key={p.id} variants={fadeUp} layout transition={{ duration: 0.25, ease: EASE }}>
              <Card className="gap-0 overflow-hidden p-0">
                <div
                  className="flex cursor-pointer flex-wrap items-center gap-3 p-4 transition-colors duration-200 hover:bg-fg/4 sm:gap-4"
                  onClick={() => toggleExpand(p)}
                >
                  <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      aria-label="Выше"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                    >
                      <ChevronUp />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      aria-label="Ниже"
                      onClick={() => move(i, 1)}
                      disabled={i === items.length - 1}
                    >
                      <ChevronDown />
                    </Button>
                  </div>

                  <div
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-lg text-xs font-semibold",
                      i < 3 ? "bg-accent text-accent-fg" : "bg-card-2 text-fg-muted",
                    )}
                  >
                    {i + 1}
                  </div>

                  <div
                    className="grid size-9.5 shrink-0 place-items-center rounded-xl text-[15px] font-semibold text-white"
                    style={{ background: p.color ?? "#0f766e" }}
                  >
                    {p.initial ?? p.name[0]}
                  </div>

                  <div className="min-w-0 flex-1 basis-40">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="truncate text-xs text-fg-muted">
                      {isUni(p) ? p.program : isIntern(p) ? p.role : p.org} · {p.flag} {p.country}
                    </div>
                    {prog && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-fg/8">
                          <motion.div
                            className="h-full rounded-full bg-accent"
                            initial={false}
                            animate={{ width: `${prog.pct}%` }}
                            transition={{ duration: 0.3, ease: EASE }}
                          />
                        </div>
                        <span className="text-[11px] whitespace-nowrap text-fg-muted">
                          {prog.pct}% · этап {Math.min(prog.done + 1, prog.total)}/{prog.total}
                        </span>
                      </div>
                    )}
                  </div>

                  <DeadlineBadge days={p.deadlineDays} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      openDetail(p)
                    }}
                  >
                    Детали
                  </Button>
                  {isUni(p) && (
                    <ChevronRight
                      className={cn(
                        "size-4 shrink-0 text-fg-faint transition-transform duration-200",
                        isOpen && "rotate-90",
                      )}
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-fg-faint hover:text-danger"
                    aria-label="Убрать из приоритетов"
                    onClick={(e) => {
                      e.stopPropagation()
                      togglePrio(p.id)
                    }}
                  >
                    <X />
                  </Button>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && stages && (
                    <motion.div
                      key="rm"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border bg-card-2/40 p-4">
                        {/* stage rail */}
                        <div className="flex gap-2 overflow-x-auto pb-1.5">
                          {stages.map((s, si) => {
                            const st = rm?.checks?.[s.id] ?? []
                            const full = s.checklist.length > 0 && s.checklist.every((_, ci) => st[ci])
                            const isActive = stage?.id === s.id
                            return (
                              <button
                                key={s.id}
                                onClick={() => setActiveStage(s.id)}
                                className={cn(
                                  "flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                                  isActive
                                    ? "border-accent bg-accent-soft"
                                    : "border-border bg-card hover:border-border-strong",
                                )}
                              >
                                <span
                                  className={cn(
                                    "grid size-5.5 shrink-0 place-items-center rounded-full border text-[11px] font-medium",
                                    full
                                      ? "border-transparent bg-accent text-accent-fg"
                                      : "border-border bg-card-2 text-fg-muted",
                                  )}
                                >
                                  {full ? <Check className="size-3" strokeWidth={3} /> : si + 1}
                                </span>
                                <span>
                                  <span className="block text-xs font-medium whitespace-nowrap">{s.name}</span>
                                  <span className="block text-[10.5px] whitespace-nowrap text-fg-muted">{s.date}</span>
                                </span>
                              </button>
                            )
                          })}
                        </div>

                        {/* stage detail + checklist */}
                        {stage && (
                          <div className="mt-3 rounded-xl border border-border bg-card p-4">
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                              <strong className="text-sm font-semibold">{stage.name}</strong>
                              <Badge>{stage.date}</Badge>
                            </div>
                            <p className="mb-3 text-[13px] leading-relaxed text-fg-muted">{stage.details}</p>
                            <div className="flex flex-col gap-0.5">
                              {stage.checklist.map((c, ci) => {
                                const st = rm?.checks?.[stage.id] ?? []
                                const on = !!st[ci]
                                return (
                                  <div
                                    key={ci}
                                    onClick={() => toggleCheck(p.id, stage.id, ci)}
                                    className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-200 select-none hover:bg-fg/5"
                                  >
                                    <Checkbox
                                      checked={on}
                                      onCheckedChange={() => toggleCheck(p.id, stage.id, ci)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="mt-0.5"
                                    />
                                    <span
                                      className={cn(
                                        "text-[13px] leading-relaxed",
                                        on && "text-fg-muted line-through",
                                      )}
                                    >
                                      {c}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

/* ---------- page ---------- */
export interface ProgramsProps {
  subTab: Tab // "p_saved" | "p_priority"
  setTab: (t: Tab) => void
  savedIds: string[]
  priorities: string[]
  setPriorities: (ids: string[]) => void
  toggleSave: (id: string) => void
  togglePrio: (id: string) => void
  roadmaps: RoadmapEntry[]
  setRoadmaps: (r: RoadmapEntry[]) => void
  openDetail: (item: AnyProgram) => void
}

type ProgramsView = "p_saved" | "p_priority"

export default function Programs({
  subTab,
  setTab,
  savedIds,
  priorities,
  setPriorities,
  toggleSave,
  togglePrio,
  roadmaps,
  setRoadmaps,
  openDetail,
}: ProgramsProps) {
  // p_roadmap was merged into priorities in legacy — anything not p_saved shows priorities.
  // Derived from the app tab so the sidebar highlight always matches the page.
  const view: ProgramsView = subTab === "p_saved" ? "p_saved" : "p_priority"

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">Мои программы</h1>
        <p className="mt-2 text-sm text-fg-muted">
          {savedIds.length} сохранено · {priorities.length} приоритетов
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="mb-6">
        <Segmented<ProgramsView>
          value={view}
          onChange={(v) => setTab(v)}
          options={[
            { id: "p_saved", label: "Сохранённые" },
            { id: "p_priority", label: "Приоритеты и роадмап" },
          ]}
        />
      </motion.div>

      <motion.div key={view} variants={stagger} initial="hidden" animate="show">
        {view === "p_saved" ? (
          <Saved
            savedIds={savedIds}
            priorities={priorities}
            toggleSave={toggleSave}
            togglePrio={togglePrio}
            openDetail={openDetail}
          />
        ) : (
          <Priority
            priorities={priorities}
            setPriorities={setPriorities}
            togglePrio={togglePrio}
            roadmaps={roadmaps}
            setRoadmaps={setRoadmaps}
            openDetail={openDetail}
          />
        )}
      </motion.div>
    </motion.div>
  )
}
