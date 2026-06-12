import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Banknote,
  Briefcase,
  Calendar,
  Filter,
  GraduationCap,
  Heart,
  MapPin,
  Search,
  Star,
  Zap,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ProgramLogo } from "@/components/ProgramLogo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { deadlineLabel } from "@/lib/roadmap"
import type { AnyProgram, Grant, Internship, University } from "@/legacy"
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
const cardStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

/* ---------- types ---------- */
type Kind = "uni" | "grant" | "intern"

/** Loose view over the catalog union — mirrors the duck-typed legacy access. */
type CatalogItem = AnyProgram & Partial<University> & Partial<Grant> & Partial<Internship>

interface Filters {
  country?: string | null
  field?: string | null
  degree?: string[]
  funding?: string[]
  format?: string[]
  maxTuition?: number
  onlyScholarship?: boolean
  hideExpired?: boolean
}

type ListFilterKey = "degree" | "funding" | "format"

/* ---------- deadline pill (same tone mapping as Home) ---------- */
function DeadlineBadge({ days }: { days: number }) {
  const d = deadlineLabel(days)
  const variant =
    d.tone === "danger" ? "destructive" : d.tone === "warn" ? "warning" : d.tone === "info" ? "default" : "secondary"
  return (
    <Badge variant={variant}>
      <Calendar className="size-3" />
      {d.txt}
    </Badge>
  )
}

/* ---------- result card ---------- */
function UniCard({
  u,
  saved,
  prio,
  toggleSave,
  togglePrio,
  onOpen,
}: {
  u: CatalogItem
  saved: boolean
  prio: boolean
  toggleSave: (id: string) => void
  togglePrio: (id: string) => void
  onOpen: (item: AnyProgram) => void
}) {
  const isUni = Boolean(u.program)
  const isGrant = Boolean(u.funding)

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -3 }} transition={{ duration: 0.2, ease: EASE }} className="h-full">
      <Card
        className="h-full cursor-pointer gap-3 p-4 sm:p-5"
        onClick={() => onOpen(u)}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && e.target === e.currentTarget && onOpen(u)}
      >
        {/* head */}
        <div className="flex items-start gap-3">
          <ProgramLogo item={u} className="size-11 rounded-xl text-lg font-medium" />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] leading-snug font-medium break-words">{u.name}</div>
            <div className="mt-0.5 text-[13px] break-words text-fg-muted">
              {isUni ? u.program : isGrant ? u.org : u.role}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn("-mt-1 -mr-1 shrink-0", saved ? "text-accent-text hover:text-accent-text" : "hover:text-accent-text")}
            title={saved ? "В избранном" : "Сохранить"}
            aria-pressed={saved}
            onClick={(e) => {
              e.stopPropagation()
              toggleSave(u.id)
            }}
          >
            <Heart className={cn("size-4.5", saved && "fill-current")} />
          </Button>
        </div>

        {/* meta */}
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-fg-muted">
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="size-3.5 shrink-0" /> {u.flag} {u.city || u.country}
          </span>
          {u.degree && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <GraduationCap className="size-3.5 shrink-0" /> {u.degree}
            </span>
          )}
          {u.duration && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <Calendar className="size-3.5 shrink-0" /> {u.duration}
            </span>
          )}
          <span className="inline-flex min-w-0 items-center gap-1">
            <Banknote className="size-3.5 shrink-0" /> {u.tuition || u.amount || u.stipend}
          </span>
        </div>

        {/* tags */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{u.field || u.industry}</Badge>
          {u.language && <Badge variant="secondary">{u.language}</Badge>}
          {u.scholarship && <Badge>Гранты</Badge>}
          {u.format && <Badge variant="secondary">{u.format}</Badge>}
        </div>

        {/* description */}
        <p className="line-clamp-2 text-[13px] leading-relaxed text-fg-muted">{u.desc}</p>

        {/* footer */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <DeadlineBadge days={u.deadlineDays} />
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className={cn(prio && "text-warning hover:text-warning")}
              onClick={(e) => {
                e.stopPropagation()
                togglePrio(u.id)
              }}
            >
              <Star className={cn("size-3.5", prio && "fill-current")} />
              {prio ? "Приоритет" : "В приоритеты"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onOpen(u)
              }}
            >
              Подробнее <ArrowRight className="size-3" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

/* ---------- filter panel ---------- */
function FilterGroup({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-2 text-[11px] font-semibold tracking-widest text-fg-muted uppercase">{title}</div>
      {children}
    </div>
  )
}

function FilterPanel({
  kind,
  filters,
  setFilters,
  countries,
  fields,
}: {
  kind: Kind
  filters: Filters
  setFilters: (f: Filters) => void
  countries: string[]
  fields: string[]
}) {
  const update = <K extends keyof Filters>(key: K, val: Filters[K]) => setFilters({ ...filters, [key]: val })
  const toggle = (key: ListFilterKey, val: string) => {
    const cur = filters[key] ?? []
    update(key, cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val])
  }

  const checkRow = (key: ListFilterKey, val: string) => (
    <label key={val} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
      <Checkbox checked={(filters[key] ?? []).includes(val)} onCheckedChange={() => toggle(key, val)} />
      {val}
    </label>
  )

  return (
    <Card className="gap-0 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <strong className="flex items-center gap-1.5 text-[13px] font-semibold">
          <Filter className="size-3.5 text-accent-text" /> Фильтры
        </strong>
        <Button variant="link" size="xs" onClick={() => setFilters({})}>
          Сбросить
        </Button>
      </div>

      {/* controls stack on mobile, flow in a wrapping row on desktop */}
      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-start">
        <FilterGroup title="Страна" className="lg:w-48">
          <Select value={filters.country || ""} onChange={(e) => update("country", e.target.value || null)}>
            <option value="">Все страны</option>
            {countries.slice(0, 20).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </FilterGroup>

        <FilterGroup title="Направление" className="lg:w-56">
          <Select value={filters.field || ""} onChange={(e) => update("field", e.target.value || null)}>
            <option value="">Все направления</option>
            {fields.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
        </FilterGroup>

        {kind === "uni" && (
          <>
            <FilterGroup title="Уровень">
              {["Бакалавриат", "Магистратура", "PhD"].map((d) => checkRow("degree", d))}
            </FilterGroup>

            <FilterGroup title="Стоимость до (€/год)" className="lg:w-52">
              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={filters.maxTuition || 50000}
                onChange={(e) => update("maxTuition", +e.target.value)}
                className="w-full cursor-pointer accent-accent"
              />
              <div className="text-right text-xs text-fg-muted">до €{(filters.maxTuition || 50000).toLocaleString()}</div>
            </FilterGroup>
          </>
        )}

        {kind === "grant" && (
          <FilterGroup title="Уровень покрытия">{["Полное", "Частичное"].map((f) => checkRow("funding", f))}</FilterGroup>
        )}

        {kind === "intern" && (
          <FilterGroup title="Формат">
            {["Очно", "Гибрид", "Очно / Гибрид"].map((f) => checkRow("format", f))}
          </FilterGroup>
        )}

        <FilterGroup title="Дополнительно" className="lg:w-64">
          <label className="flex cursor-pointer items-center justify-between gap-3 py-1 text-sm">
            <span>Только со стипендиями</span>
            <Switch
              checked={Boolean(filters.onlyScholarship)}
              onCheckedChange={(v) => update("onlyScholarship", v)}
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-3 py-1 text-sm">
            <span>Скрыть с истёкшим дедлайном</span>
            <Switch checked={Boolean(filters.hideExpired)} onCheckedChange={(v) => update("hideExpired", v)} />
          </label>
        </FilterGroup>
      </div>
    </Card>
  )
}

/* ---------- page ---------- */
export interface FindProps {
  saved: string[]
  priorities: string[]
  toggleSave: (id: string) => void
  togglePrio: (id: string) => void
  openDetail: (item: AnyProgram) => void
}

const KIND_TABS: { id: Kind; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "uni", label: "Университеты", icon: GraduationCap },
  { id: "grant", label: "Гранты", icon: Zap },
  { id: "intern", label: "Стажировки", icon: Briefcase },
]

export default function Find({ saved, priorities, toggleSave, togglePrio, openDetail }: FindProps) {
  const [kind, setKind] = useState<Kind>("uni")
  const [q, setQ] = useState("")
  const [filters, setFilters] = useState<Filters>({})
  const [sort, setSort] = useState("deadline")

  const data = window.AdmiticaData
  const dataMap: Record<Kind, CatalogItem[]> = {
    uni: data.universities as unknown as CatalogItem[],
    grant: data.grants as unknown as CatalogItem[],
    intern: data.internships as unknown as CatalogItem[],
  }
  // The legacy data module also exposes a curated country list (not in the typed surface)
  const countries = (data as typeof data & { countries?: string[] }).countries ?? []
  const fields = useMemo(() => [...new Set(window.AdmiticaData.universities.map((u) => u.field))].sort(), [])

  let items = dataMap[kind].filter((it) => {
    if (
      q &&
      !(it.name + " " + (it.program || "") + " " + (it.field || it.industry || "") + " " + it.country)
        .toLowerCase()
        .includes(q.toLowerCase())
    )
      return false
    if (filters.country && it.country !== filters.country) return false
    if (filters.field && (it.field || it.industry) !== filters.field) return false
    if (filters.degree && filters.degree.length && !filters.degree.includes(it.degree ?? "")) return false
    if (filters.funding && filters.funding.length && !filters.funding.includes(it.funding ?? "")) return false
    if (filters.format && filters.format.length && !filters.format.includes(it.format ?? "")) return false
    if (filters.maxTuition && (it.tuitionMax || 0) > filters.maxTuition) return false
    if (filters.onlyScholarship && !it.scholarship) return false
    if (filters.hideExpired && it.deadlineDays <= 0) return false
    return true
  })

  if (sort === "deadline") items = [...items].sort((a, b) => a.deadlineDays - b.deadlineDays)
  if (sort === "name") items = [...items].sort((a, b) => a.name.localeCompare(b.name))
  if (sort === "tuition") items = [...items].sort((a, b) => (a.tuitionMax || 0) - (b.tuitionMax || 0))

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* page head */}
      <motion.div variants={fadeUp} className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">Подобрать программу</h1>
        <p className="mt-2 text-sm text-fg-muted">35 университетов · 35 грантов · 35 стажировок в Европе</p>
      </motion.div>

      {/* kind subtabs */}
      <motion.div
        variants={fadeUp}
        className="mb-5 flex w-full gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1 sm:w-fit"
      >
        {KIND_TABS.map((t) => {
          const active = kind === t.id
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setKind(t.id)
                setFilters({})
              }}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:px-4",
                active ? "bg-accent font-semibold text-accent-fg" : "text-fg-muted hover:bg-fg/5 hover:text-fg",
              )}
            >
              <Icon className="size-3.5" /> {t.label}
            </button>
          )
        })}
      </motion.div>

      {/* search + sort */}
      <motion.div variants={fadeUp} className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-faint" />
          <Input
            className="pl-9"
            placeholder={`Поиск ${kind === "uni" ? "университета" : kind === "grant" ? "гранта" : "стажировки"}...`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select className="sm:w-44" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="deadline">По дедлайну</option>
          <option value="name">По названию</option>
          {kind === "uni" && <option value="tuition">По стоимости</option>}
        </Select>
      </motion.div>

      {/* filters */}
      <motion.div variants={fadeUp} className="mb-6">
        <FilterPanel kind={kind} filters={filters} setFilters={setFilters} countries={countries} fields={fields} />
      </motion.div>

      {/* results */}
      <motion.div variants={fadeUp}>
        <div className="mb-3.5 text-[13px] text-fg-muted">
          Найдено: <b className="font-medium text-fg">{items.length}</b>
          {q && <> по запросу «{q}»</>}
        </div>

        <motion.div
          key={kind}
          variants={cardStagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {items.map((u) => (
            <UniCard
              key={u.id}
              u={u}
              saved={saved.includes(u.id)}
              prio={priorities.includes(u.id)}
              toggleSave={toggleSave}
              togglePrio={togglePrio}
              onOpen={openDetail}
            />
          ))}
        </motion.div>

        {items.length === 0 && (
          <Card className="p-14 text-center text-sm text-fg-muted">Ничего не найдено. Попробуйте изменить фильтры.</Card>
        )}
      </motion.div>
    </motion.div>
  )
}
