'use client'

import { useSyncExternalStore, type ReactNode } from 'react'

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

const currentHash = () => window.location.hash.slice(1)
const serverHash = () => ''

export function ProductCategoryNav({
  groups,
  label,
  empty,
}: {
  groups: { value: string; label: string; content: ReactNode }[]
  label: string
  empty: ReactNode
}) {
  const hash = useSyncExternalStore(subscribe, currentHash, serverHash)
  const selected = groups.find(({ value }) => value === hash) ?? groups[0]

  return (
    <>
      <nav className="lp-catalog-categories" aria-label={label}>
        {groups.map(({ value, label: name }) => (
          <a
            key={value}
            id={value}
            href={`#${value}`}
            aria-current={selected.value === value ? 'true' : undefined}
            aria-controls={`${value}-products`}
            onClick={(event) => {
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
              event.preventDefault()
              if (currentHash() === value) return
              // Update the fragment without scrolling the category row.
              window.history.pushState(null, '', `#${value}`)
              window.dispatchEvent(new HashChangeEvent('hashchange'))
            }}
          >
            {name}
          </a>
        ))}
      </nav>
      {groups.map(({ value, content }) => (
        <section
          key={value}
          id={`${value}-products`}
          aria-labelledby={value}
          className="lp-store-lines lp-catalog-panel"
          hidden={selected.value !== value}
        >
          {content ?? (selected.value === value ? empty : null)}
        </section>
      ))}
    </>
  )
}
