import { Fragment } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  Heart,
  Minus,
  Sparkles,
  Star,
} from "lucide-react"

import { ProgramLogo } from "@/components/ProgramLogo"
import { Accordion, AccordionItem } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UNI_CONTENT, type UniSection } from "@/data/uniContent"
import { deadlineLabel } from "@/lib/roadmap"
import type { AnyProgram, Grant, University } from "@/legacy"
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

/* ---------- grants relevant to a specific university (same scoring as legacy) ---------- */
/* named awards > same country > EU-wide > field match */
function grantsForUni(u: University): Grant[] {
  const uniWord = (u.name || "").split(/\s+/).find((w) => w.length > 4) || u.name
  const generic = /все|любые|200\+|программ/i
  return window.AdmiticaData.grants
    .map((g) => {
      let score = 0
      if (
        g.name.toLowerCase().includes(uniWord.toLowerCase()) ||
        (g.desc || "").toLowerCase().includes(uniWord.toLowerCase())
      )
        score += 5
      if (g.country === u.country) score += 3
      if (g.country === "ЕС") score += 2
      if (generic.test(g.field || "")) score += 1
      else if (u.field && (g.field || "").toLowerCase().includes(u.field.split(/[,\s]/)[0].toLowerCase()))
        score += 2
      if (u.degree && (g.degree || "").toLowerCase().includes(u.degree.split(/[\s/]/)[0].toLowerCase()))
        score += 1
      return { g, score }
    })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.g)
}

/* ---------- small pieces ---------- */
function DeadlineBadge({ days }: { days: number }) {
  const d = deadlineLabel(days)
  const variant =
    d.tone === "danger" ? "destructive" : d.tone === "warn" ? "warning" : d.tone === "info" ? "default" : "secondary"
  return (
    <Badge variant={variant}>
      <Calendar className="size-3" /> {d.txt}
    </Badge>
  )
}

function SectionHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-xs font-semibold tracking-widest text-fg-muted uppercase", className)}>{children}</h2>
  )
}

/* ---------- rich profile section body (uniContent) ---------- */
function SectionBody({ s }: { s: UniSection }) {
  return (
    <div className="flex flex-col gap-3">
      {s.body && <p className="text-sm leading-relaxed text-fg-muted">{s.body}</p>}
      {s.facts && s.facts.length > 0 && (
        <ul className="flex flex-col gap-2 text-sm leading-relaxed">
          {s.facts.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-accent-text" />
              <span className="text-fg-muted">{f}</span>
            </li>
          ))}
        </ul>
      )}
      {(s.pros || s.cons) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {s.pros && (
            <div>
              <div className="mb-2 text-xs font-semibold tracking-widest text-positive uppercase">Плюсы</div>
              <ul className="flex flex-col gap-2 text-sm leading-relaxed">
                {s.pros.map((p) => (
                  <li key={p} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-positive" />
                    <span className="text-fg-muted">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {s.cons && (
            <div>
              <div className="mb-2 text-xs font-semibold tracking-widest text-warning uppercase">Минусы</div>
              <ul className="flex flex-col gap-2 text-sm leading-relaxed">
                {s.cons.map((c) => (
                  <li key={c} className="flex items-start gap-2.5">
                    <Minus className="mt-0.5 size-4 shrink-0 text-warning" />
                    <span className="text-fg-muted">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {s.note && <p className="text-[13px] leading-relaxed text-fg-faint">{s.note}</p>}
      {s.ru && (
        <div className="flex gap-2.5 rounded-xl border border-accent/30 bg-accent-soft p-3.5">
          <span className="shrink-0 text-base leading-none">🇷🇺</span>
          <p className="text-[13px] leading-relaxed text-fg-muted">
            <strong className="font-semibold text-accent-text">Для России: </strong>
            {s.ru}
          </p>
        </div>
      )}
    </div>
  )
}

function KvList({ rows }: { rows: { k: string; v: string }[] }) {
  return (
    <dl className="mt-4 grid grid-cols-[max-content_1fr] gap-x-6 gap-y-3 text-sm">
      {rows.map((r) =>
        r.v ? (
          <Fragment key={r.k}>
            <dt className="text-fg-muted">{r.k}</dt>
            <dd className="min-w-0 font-medium break-words">{r.v}</dd>
          </Fragment>
        ) : null,
      )}
    </dl>
  )
}

/* ---------- page ---------- */
export interface DetailProps {
  item: AnyProgram
  onBack: () => void
  saved: boolean
  prio: boolean
  toggleSave: (id: string) => void
  togglePrio: (id: string) => void
  addRoadmap: (item: AnyProgram) => void
  hasRoadmap: boolean
  openDetail: (item: AnyProgram) => void
}

export default function Detail({
  item,
  onBack,
  saved,
  prio,
  toggleSave,
  togglePrio,
  addRoadmap,
  hasRoadmap,
  openDetail,
}: DetailProps) {
  const it = item
  const uniGrants = "program" in it ? grantsForUni(it) : []
  const content = UNI_CONTENT[it.id]

  const reqs: { k: string; v: string }[] =
    "program" in it
      ? [
          { k: "Язык", v: it.language },
          { k: "IELTS / Lang", v: it.ielts },
          { k: "Оценки", v: it.gpa },
          { k: "Дедлайн", v: it.deadline },
        ]
      : "funding" in it
        ? [
            { k: "Кому", v: it.eligibility },
            { k: "Уровень", v: it.degree },
            { k: "Финансирование", v: it.funding },
            { k: "Дедлайн", v: it.deadline },
          ]
        : [
            { k: "Требования", v: it.requirements },
            { k: "Длительность", v: it.duration },
            { k: "Формат", v: it.format },
            { k: "Дедлайн", v: it.deadline },
          ]

  const facts: { k: string; v: string }[] =
    "program" in it
      ? [
          { k: "Город", v: `${it.flag} ${it.city}, ${it.country}` },
          { k: "Программа", v: it.program },
          { k: "Степень", v: it.degree },
          { k: "Направление", v: it.field },
          { k: "Стоимость", v: it.tuition },
          { k: "Стипендии", v: it.scholarship ? "Доступны" : "—" },
        ]
      : "funding" in it
        ? [
            { k: "Страна", v: `${it.flag} ${it.country}` },
            { k: "Организация", v: it.org },
            { k: "Размер", v: it.amount },
            { k: "Покрытие", v: it.funding },
            { k: "Уровень", v: it.degree },
            { k: "Направление", v: it.field },
          ]
        : [
            { k: "Город", v: `${it.flag} ${it.city}` },
            { k: "Роль", v: it.role },
            { k: "Индустрия", v: it.industry },
            { k: "Стипендия", v: it.stipend },
            { k: "Длительность", v: it.duration },
            { k: "Формат", v: it.format },
          ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* back */}
      <motion.div variants={fadeUp} className="mb-5">
        <Button variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
          <ArrowLeft /> Назад к подбору
        </Button>
      </motion.div>

      {/* head */}
      <motion.div variants={fadeUp} className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
        <ProgramLogo item={it} className="size-16 rounded-2xl text-2xl font-semibold sm:size-18" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{it.name}</h1>
            <DeadlineBadge days={it.deadlineDays} />
          </div>
          <div className="mt-1.5 text-sm text-fg-muted sm:text-base">
            {"program" in it ? it.program : "funding" in it ? `${it.org} · ${it.country}` : `${it.role} · ${it.industry}`}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button onClick={() => addRoadmap(it)} disabled={hasRoadmap}>
              {hasRoadmap ? (
                <>
                  <Check /> В дорожной карте
                </>
              ) : (
                <>
                  Создать дорожную карту <ArrowRight />
                </>
              )}
            </Button>
            <Button variant={saved ? "outline" : "ghost"} onClick={() => toggleSave(it.id)}>
              <Heart className={cn(saved && "fill-current")} /> {saved ? "Сохранено" : "Сохранить"}
            </Button>
            <Button
              variant={prio ? "outline" : "ghost"}
              onClick={() => togglePrio(it.id)}
              className={cn(prio && "border-warning/60 text-warning hover:text-warning")}
            >
              <Star className={cn(prio && "fill-current")} /> {prio ? "В приоритетах" : "Приоритет"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* quick-fact chips */}
      {content && (
        <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-2">
          {content.chips.map((c) => (
            <span
              key={c}
              className="rounded-full border border-border bg-card-2 px-3 py-1.5 text-xs font-medium text-fg-muted"
            >
              {c}
            </span>
          ))}
        </motion.div>
      )}

      {/* body grid */}
      <div className="mt-8 grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        {/* left column */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <motion.div variants={fadeUp}>
            <Card className="gap-0 p-6 sm:p-7">
              <SectionHeading>О программе</SectionHeading>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">{it.desc}</p>

              {"program" in it && !content && (
                <>
                  <SectionHeading className="mt-7">Почему это сильный выбор</SectionHeading>
                  <ul className="mt-3 flex flex-col gap-2.5 text-sm leading-relaxed text-fg-muted">
                    {[
                      "Международная среда и сильное alumni-сообщество",
                      "Англоязычная программа с европейской аккредитацией",
                      "Возможности exchange и стажировок в топ-компаниях",
                      "Конкурентоспособная стоимость обучения для региона",
                    ].map((li) => (
                      <li key={li} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 size-4 shrink-0 text-accent-text" />
                        {li}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>
          </motion.div>

          {/* extended profile (uniContent) */}
          {content && (
            <motion.div variants={fadeUp}>
              <SectionHeading className="mb-3 px-1">Профиль вуза</SectionHeading>
              <Accordion>
                {content.sections.map((s, i) => (
                  <AccordionItem key={s.title} title={s.title} accent={s.accent} defaultOpen={i === 0}>
                    <SectionBody s={s} />
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          )}

          <motion.div variants={fadeUp}>
            <Card className="gap-0 p-6 sm:p-7">
              <SectionHeading>Требования к поступлению</SectionHeading>
              <KvList rows={reqs} />
            </Card>
          </motion.div>

          {/* FAQ */}
          {content && content.faq.length > 0 && (
            <motion.div variants={fadeUp}>
              <SectionHeading className="mb-3 px-1">Частые вопросы</SectionHeading>
              <Accordion>
                {content.faq.map((f) => (
                  <AccordionItem key={f.q} title={f.q}>
                    <p className="text-sm leading-relaxed text-fg-muted">{f.a}</p>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          )}
        </div>

        {/* right column */}
        <div className="flex flex-col gap-4">
          <motion.div variants={fadeUp}>
            <Card className="gap-0 p-6">
              <SectionHeading>Ключевые факты</SectionHeading>
              <KvList rows={facts} />
            </Card>
          </motion.div>

          {uniGrants.length > 0 && (
            <motion.div variants={fadeUp}>
              <Card className="gap-0 p-4 pt-5">
                <SectionHeading className="px-2">Гранты по этому вузу</SectionHeading>
                <div className="mt-2 flex flex-col gap-1">
                  {uniGrants.map((g) => (
                    <motion.div
                      key={g.id}
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="group flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 transition-colors duration-200 hover:bg-fg/5"
                      onClick={() => openDetail(g)}
                    >
                      <ProgramLogo item={g} className="size-9 rounded-xl text-sm font-semibold" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-medium">{g.name}</div>
                        <div className="truncate text-xs text-fg-muted">{g.amount}</div>
                      </div>
                      <Badge
                        variant={/полное/i.test(g.funding) ? "default" : "secondary"}
                        className="max-w-28 shrink-0"
                      >
                        <span className="truncate">{g.funding}</span>
                      </Badge>
                      <ArrowUpRight className="size-4 shrink-0 text-fg-faint opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {"site" in it && it.site && (
            <motion.div variants={fadeUp}>
              <Card className="gap-0 p-6">
                <SectionHeading>Официальный сайт</SectionHeading>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent-text hover:underline"
                >
                  {it.site} <ArrowUpRight className="size-4" />
                </a>
              </Card>
            </motion.div>
          )}

          <motion.div variants={fadeUp}>
            <Card className="gap-0 border-accent/20 bg-accent-soft p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-accent-text" />
                <strong className="text-[13px] font-semibold text-accent-text">AI-совет</strong>
              </div>
              <p className="mt-2.5 text-[13px] leading-relaxed text-fg-muted">
                Учитывая ваш профиль (GPA 4.7/5, IELTS 7.0), у вас сильные шансы. Начните Personal Statement за 2-3
                месяца до дедлайна и параллельно подайте заявку на грант.
              </p>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
