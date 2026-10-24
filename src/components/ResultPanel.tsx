import { useI18n } from '../i18n'
import { formatExact, formatMoney } from '../lib/money'
import type { Person, SplitResult } from '../lib/split'

type Props = {
  total: number | null
  currency: string
  people: Person[]
  result: SplitResult | null
  /** True when the chosen method still has no values typed in. */
  awaitingValues: boolean
}

const ERRORS = {
  noPeople: 'errNoPeople',
  percentNot100: 'errPercentNot100',
  ratioZero: 'errRatioZero',
  fixedExceedsTotal: 'errFixedExceedsTotal',
  fixedMismatch: 'errFixedMismatch',
} as const

export function ResultPanel({ total, currency, people, result, awaitingValues }: Props) {
  const { t, locale } = useI18n()
  const money = (minor: number) => formatMoney(minor, currency, locale)
  const unit = money(1)
  const nameOf = (id: string) => {
    const i = people.findIndex((p) => p.id === id)
    return people[i]?.name.trim() || `${t('personPlaceholder')} ${i + 1}`
  }

  return (
    <section
      aria-live="polite"
      className="relative overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-7"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-bold">{t('result')}</h2>
        {total !== null && <span className="tabular text-sm text-muted">{money(total)}</span>}
      </div>

      {result === null || total === null ? (
        <p className="mt-6 text-sm text-muted">{t('emptyResult')}</p>
      ) : !result.ok && awaitingValues ? (
        <p className="mt-6 rounded-2xl bg-accent-soft px-4 py-3 text-sm font-medium">{t('fillValues')}</p>
      ) : !result.ok ? (
        <p className="mt-6 rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          {t(ERRORS[result.error])}
        </p>
      ) : (
        <>
          {/* Share bar */}
          <div className="mt-5 flex h-3.5 gap-0.5 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
            {total > 0 &&
              result.lines.map((line, i) =>
                line.amount > 0 ? (
                  <div
                    key={line.personId}
                    className="h-full transition-[flex-grow] duration-500 ease-out first:rounded-l-full last:rounded-r-full"
                    style={{ flexGrow: line.amount, flexBasis: 0, background: `var(--p${(i % 8) + 1})` }}
                  />
                ) : null,
              )}
          </div>

          <ul className="mt-5 divide-y divide-border">
            {result.lines.map((line, i) => (
              <li key={line.personId} className="flex items-center gap-3 py-3">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: `var(--p${(i % 8) + 1})` }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{nameOf(line.personId)}</div>
                  <div className="tabular text-xs text-muted">
                    {total > 0 ? ((line.amount / total) * 100).toLocaleString(locale, { maximumFractionDigits: 2 }) : 0} %
                  </div>
                </div>

                {line.extra > 0 && (
                  <span className="group relative">
                    <button
                      type="button"
                      aria-describedby={`why-${line.personId}`}
                      className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-ink tabular"
                    >
                      +{unit}
                    </button>
                    <span
                      id={`why-${line.personId}`}
                      role="tooltip"
                      className="pointer-events-none absolute right-0 bottom-full z-10 mb-2 w-64 rounded-2xl border border-border bg-surface p-3 text-xs leading-relaxed text-text opacity-0 shadow-lg transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
                    >
                      <strong className="mb-1 block text-sm">{t('extraCentTitle', { unit })}</strong>
                      {t('extraCentWhy', {
                        name: nameOf(line.personId),
                        exact: formatExact(line.exact, currency, locale),
                        unit,
                      })}
                    </span>
                  </span>
                )}

                <span className="font-display tabular text-xl font-semibold tracking-tight">{money(line.amount)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-primary-soft px-4 py-3 text-sm font-semibold text-primary">
            <svg viewBox="0 0 24 24" className="size-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span className="tabular">
              {t('addsUp', { total: money(result.lines.reduce((s, l) => s + l.amount, 0)) })}
            </span>
          </div>
        </>
      )}
    </section>
  )
}
