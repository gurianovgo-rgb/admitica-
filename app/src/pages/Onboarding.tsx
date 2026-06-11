import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const EASE = [0.16, 1, 0.3, 1] as const
const LETTERS = "Admitica".split("")

export interface OnboardingProps {
  onDone: (name: string) => void
}

/**
 * Letter-fly onboarding — port of the legacy onboarding.jsx:
 * phase 0 — letters appear one by one, phase 1 — name input,
 * phase 2 — exit animation, then onDone(name).
 */
export default function Onboarding({ onDone }: OnboardingProps) {
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState(0)
  const [name, setName] = useState("")

  useEffect(() => {
    const t = setTimeout(() => setPhase(1), reduced ? 100 : 1700)
    return () => clearTimeout(t)
  }, [reduced])

  const handleSubmit = () => {
    if (!name.trim()) return
    setPhase(2)
    setTimeout(() => onDone(name.trim()), reduced ? 50 : 900)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="hero-glow pointer-events-none fixed inset-0 opacity-50" />
      <AnimatePresence>
        {phase < 2 && (
          <motion.div
            exit={{ opacity: 0, y: -32, scale: 0.92 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="relative flex w-full max-w-sm flex-col items-center text-center"
          >
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl" aria-label="Admitica">
              {LETTERS.map((l, i) => (
                <motion.span
                  key={i}
                  initial={reduced ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: reduced ? 0 : i * 0.1 }}
                  className="inline-block"
                >
                  {l}
                </motion.span>
              ))}
              <motion.span
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: reduced ? 0 : LETTERS.length * 0.1 }}
                className="text-accent-text"
              >
                .
              </motion.span>
            </h1>

            <AnimatePresence>
              {phase >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="mt-10 flex w-full flex-col items-center gap-4"
                >
                  <div className="text-sm font-medium text-fg-muted">Как вас зовут?</div>
                  <Input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="Имя"
                    className="h-11 max-w-72 text-center text-base"
                    aria-label="Ваше имя"
                  />
                  <motion.div
                    initial={false}
                    animate={{ opacity: name.trim() ? 1 : 0, y: name.trim() ? 0 : 6 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    style={{ pointerEvents: name.trim() ? "auto" : "none" }}
                  >
                    <Button onClick={handleSubmit}>
                      Войти в Admitica <ArrowRight />
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
