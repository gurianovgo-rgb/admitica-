import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Bookmark,
  Briefcase,
  ChevronDown,
  Home,
  Menu,
  Moon,
  PenLine,
  Search,
  Settings,
  Sun,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Tab } from "@/lib/nav"
import { cn } from "@/lib/utils"

const EASE = [0.16, 1, 0.3, 1] as const

/* Socials — same links as the legacy sidebar.jsx */
const SOCIALS = [
  {
    label: "Telegram",
    href: "https://t.me/admitica",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.9 4.3c.3-1.2-.4-1.7-1.2-1.4L2.7 9.9c-1.2.5-1.2 1.2-.2 1.5l4.6 1.4 10.7-6.7c.5-.3 1-.2.6.2l-8.7 7.8-.3 4.8c.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3-14.6z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/admitica",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com/admitica",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.6c0-.9.3-1.6 1.7-1.6H17V4.2c-.3 0-1.3-.2-2.4-.2-2.4 0-4.1 1.5-4.1 4.2v2.3H8v3h2.5V21h3z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@admitica",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.6 3c.4 2 1.8 3.5 3.9 3.8v3c-1.5 0-2.9-.5-3.9-1.3v6.2c0 3.7-2.7 6.3-6.2 6.3-3.4 0-6-2.5-6-5.8 0-3.4 2.8-6 6.5-5.8v3.1c-.3-.1-.6-.1-.9-.1-1.6 0-2.8 1.2-2.8 2.8 0 1.6 1.2 2.8 2.7 2.8 1.7 0 3-1.3 3-3.2V3h3.7z" />
      </svg>
    ),
  },
]

const NAV_ITEMS = [
  { id: "home" as Tab, label: "Главная", icon: Home },
  { id: "find" as Tab, label: "Подобрать программу", icon: Search },
  {
    id: "programs",
    label: "Мои программы",
    icon: Bookmark,
    sub: [
      { id: "p_saved" as Tab, label: "Сохранённые" },
      { id: "p_priority" as Tab, label: "Приоритеты и роадмап" },
    ],
  },
  { id: "essay" as Tab, label: "Редактор эссе", icon: PenLine },
  { id: "resume" as Tab, label: "Сборка резюме", icon: Briefcase },
]

export interface SidebarProps {
  tab: Tab
  setTab: (t: Tab) => void
  name: string
  plan: string
  theme: "dark" | "light"
  onToggleTheme: () => void
  onSettings: () => void
  /** Slide-in entrance right after onboarding (mirrors the legacy animation). */
  animateIn?: boolean
}

function ThemeToggle({ theme, onToggle, className }: { theme: "dark" | "light"; onToggle: () => void; className?: string }) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={className}
      onClick={onToggle}
      aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  )
}

function NavContent({
  tab,
  setTab,
  name,
  plan,
  theme,
  onToggleTheme,
  onSettings,
  onNavigate,
  hideThemeToggle,
}: SidebarProps & { onNavigate?: () => void; hideThemeToggle?: boolean }) {
  const [progExpanded, setProgExpanded] = useState(tab.startsWith("p_"))
  const initial = (name || "У").charAt(0).toUpperCase()

  const go = (t: Tab) => {
    setTab(t)
    onNavigate?.()
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* logo */}
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
        <span className="grid size-8 place-items-center rounded-xl bg-accent text-sm font-bold text-accent-fg">A</span>
        <span className="text-lg font-bold tracking-tight">
          Admitica<span className="text-accent-text">.</span>
        </span>
        {!hideThemeToggle && <ThemeToggle theme={theme} onToggle={onToggleTheme} className="ml-auto" />}
      </div>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto px-3">
        {NAV_ITEMS.map((it) => {
          const Icon = it.icon
          const isActive = tab === it.id || (it.sub?.some((s) => s.id === tab) ?? false)
          return (
            <div key={it.id}>
              <button
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                  isActive ? "bg-accent-soft text-accent-text" : "text-fg-muted hover:bg-fg/5 hover:text-fg",
                )}
                onClick={() => {
                  if (it.sub) {
                    setProgExpanded(!progExpanded)
                    if (!isActive) go(it.sub[0].id)
                  } else {
                    go(it.id as Tab)
                  }
                }}
              >
                <Icon className="size-4.5 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-left">{it.label}</span>
                {it.sub && (
                  <ChevronDown className={cn("size-3.5 shrink-0 transition-transform duration-200", progExpanded && "rotate-180")} />
                )}
              </button>
              {it.sub && progExpanded && (
                <div className="mt-0.5 mb-1 ml-7 flex flex-col gap-0.5 border-l border-border pl-3">
                  {it.sub.map((s) => (
                    <button
                      key={s.id}
                      className={cn(
                        "rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                        tab === s.id ? "text-accent-text" : "text-fg-muted hover:text-fg",
                      )}
                      onClick={() => go(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* socials */}
      <div className="px-5 pb-3">
        <div className="mb-2 text-[10px] font-semibold tracking-widest text-fg-faint uppercase">Мы в соцсетях</div>
        <div className="flex items-center gap-1">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="grid size-8 place-items-center rounded-lg text-fg-faint transition-colors duration-200 hover:bg-fg/5 hover:text-fg-muted"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>

      {/* user → settings */}
      <button
        className="mx-3 mb-4 flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors duration-200 outline-none hover:bg-fg/5 focus-visible:ring-2 focus-visible:ring-accent/60"
        onClick={() => {
          onSettings()
          onNavigate?.()
        }}
      >
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-fg">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{name || "Пользователь"}</div>
          <div className="text-xs text-fg-muted">{plan}</div>
        </div>
        <Settings className="size-4 shrink-0 text-fg-faint" />
      </button>
    </div>
  )
}

export function Sidebar(props: SidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop rail */}
      <motion.aside
        initial={props.animateIn ? { x: -32, opacity: 0 } : false}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-surface lg:block"
      >
        <NavContent {...props} />
      </motion.aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-bg/80 px-3 backdrop-blur-xl lg:hidden">
        <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)} aria-label="Открыть меню">
          <Menu />
        </Button>
        <span className="text-base font-bold tracking-tight">
          Admitica<span className="text-accent-text">.</span>
        </span>
        <ThemeToggle theme={props.theme} onToggle={props.onToggleTheme} className="ml-auto" />
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: EASE }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-border bg-surface lg:hidden"
            >
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-5 right-3 z-10"
                onClick={() => setOpen(false)}
                aria-label="Закрыть меню"
              >
                <X />
              </Button>
              <NavContent {...props} onNavigate={() => setOpen(false)} hideThemeToggle />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
