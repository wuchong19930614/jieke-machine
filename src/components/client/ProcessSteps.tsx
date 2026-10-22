'use client'
// 工艺步骤切换（技术方案 4.4）：左侧步骤列表、右侧图片和说明，支持键盘方向键
import React, { useEffect, useRef, useState } from 'react'

import { fill } from '@/content/defineTexts'

type Step = { key: string; title: string; titleAttrs?: Record<string, string>; panel: React.ReactNode }

export function ProcessSteps({ steps, ariaLabel, stepAria, header }: { steps: Step[]; ariaLabel: string; stepAria: string; header: React.ReactNode }) {
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const onReveal = (e: Event) => {
      const holder = (e.target as Element).closest<HTMLElement>('[data-step-index]')
      if (holder) setActive(Number(holder.dataset.stepIndex))
    }
    root.addEventListener('jieke:reveal', onReveal)
    return () => root.removeEventListener('jieke:reveal', onReveal)
  }, [])

  const onKey = (e: React.KeyboardEvent) => {
    const delta = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = (active + delta + steps.length) % steps.length
    setActive(next)
    tabs.current[next]?.focus()
  }

  return (
    <div className="lp-process-layout" ref={rootRef}>
      <div>
        {header}
        <div className="lp-process-buttons" role="tablist" aria-label={ariaLabel} aria-orientation="vertical" onKeyDown={onKey}>
          {steps.map((step, i) => (
            <button
              key={step.key}
              ref={(el) => {
                tabs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`step-tab-${step.key}`}
              aria-controls={`step-panel-${step.key}`}
              aria-selected={i === active}
              aria-label={fill(stepAria, { n: i + 1, stepTitle: step.title }) || step.title}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              data-step-index={i}
              {...step.titleAttrs}
            >
              <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              {step.title}
            </button>
          ))}
        </div>
      </div>
      <div>
        {steps.map((step, i) => (
          <div
            key={step.key}
            id={`step-panel-${step.key}`}
            role="tabpanel"
            aria-labelledby={`step-tab-${step.key}`}
            data-step-index={i}
            hidden={i !== active}
          >
            {step.panel}
          </div>
        ))}
      </div>
    </div>
  )
}
