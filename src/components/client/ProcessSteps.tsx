'use client'
// 工艺步骤切换（技术方案 4.4）：左侧步骤列表、右侧图片和说明，支持键盘方向键
import React, { useEffect, useRef, useState } from 'react'

import { fill } from '@/content/defineTexts'

type Step = { key: string; title: string; titleAttrs?: Record<string, string>; panel: React.ReactNode }

// 选中的步骤按条目的固定编号记，不按位置：调整顺序后仍选中同一步；
// 选中的步骤被删除或隐藏时回到第一个可见步骤（需求书第六部分“删除当前选中步骤后自动选中有效步骤”）
export function activeStepIndex(steps: { key: string }[], activeKey: string | null): number {
  const index = activeKey === null ? -1 : steps.findIndex((step) => step.key === activeKey)
  return index < 0 ? 0 : index
}

export function ProcessSteps({ steps, ariaLabel, stepAria, header }: { steps: Step[]; ariaLabel: string; stepAria: string; header: React.ReactNode }) {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const active = activeStepIndex(steps, activeKey)
  const rootRef = useRef<HTMLDivElement>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const onReveal = (e: Event) => {
      const holder = (e.target as Element).closest<HTMLElement>('[data-step-key]')
      if (holder?.dataset.stepKey) setActiveKey(holder.dataset.stepKey)
    }
    root.addEventListener('jieke:reveal', onReveal)
    return () => root.removeEventListener('jieke:reveal', onReveal)
  }, [])

  const onKey = (e: React.KeyboardEvent) => {
    const delta = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = (active + delta + steps.length) % steps.length
    setActiveKey(steps[next].key)
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
              onClick={() => setActiveKey(step.key)}
              data-step-key={step.key}
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
            data-step-key={step.key}
            hidden={i !== active}
          >
            {step.panel}
          </div>
        ))}
      </div>
    </div>
  )
}
