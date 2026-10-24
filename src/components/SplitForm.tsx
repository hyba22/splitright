import { useMemo } from 'react'
import { useI18n } from '../i18n'
import {
  allCurrencies,
  currencyName,
  currencySymbol,
  FEATURED_CURRENCIES,
  minorDigits,
  parseNumber,
} from '../lib/money'
import { newId } from '../lib/id'
import type { MethodKind, Person } from '../lib/split'

export type FormState = {
  amountText: string
  currency: string
  people: Person[]
  method: MethodKind
  /** Per-method, per-person raw input text. */
  inputs: Record<Exclude<MethodKind, 'equal'>, Record<string, string>>
}

type Props = {
  state: FormState
  onChange: (next: FormState) => void
  amountInvalid: boolean
}

const METHODS: { kind: MethodKind; label: 'methodEqual' | 'methodPercent' | 'methodRatio' | 'methodFixed' }[] = [
  { kind: 'equal', label: 'methodEqual' },
  { kind: 'percent', label: 'methodPercent' },
  { kind: 'ratio', label: 'methodRatio' },
  { kind: 'fixed', label: 'methodFixed' },
]

const HINTS = { equal: 'hintEqual', percent: 'hintPercent', ratio: 'hintRatio', fixed: 'hintFixed' } as const

const inputClass =
  'w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-text placeholder:text-muted/70 transition-colors hover:border-muted/50 focus:border-primary focus:outline-none'

export function SplitForm({ state, onChange, amountInvalid }: Props) {
  const { t, locale } = useI18n()
  const currencies = useMemo(() => allCurrencies(), [])
  const digits = minorDigits(state.currency)
  const set = (patch: Partial<FormState>) => onChange({ ...state, ...patch })

  const setInput = (personId: string, text: string) => {
    if (state.method === 'equal') return
    set({ inputs: { ...state.inputs, [state.method]: { ...state.inputs[state.method], [personId]: text } } })
  }

  const percentTotal =
    state.method === 'percent'
      ? state.people.reduce((sum, p) => sum + (parseNumber(state.inputs.percent[p.id] ?? '') ?? 0), 0)
      : 0
  const percentLeft = Math.round((100 - percentTotal) * 1e6) / 1e6

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-7">
      {/* Total + currency */}
      <div className="grid gap-4 sm:grid-cols-[1fr_minmax(0,14rem)]">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-muted">{t('total')}</span>
          <input
            inputMode="decimal"
            value={state.amountText}
            onChange={(e) => set({ amountText: e.target.value })}
            placeholder={(0).toFixed(digits)}
            aria-invalid={amountInvalid}
            className={`${inputClass} font-display tabular text-3xl font-semibold tracking-tight ${
              amountInvalid ? 'border-danger focus:border-danger' : ''
            }`}
          />
          {amountInvalid && <span className="mt-1.5 block text-sm text-danger">{t('errAmount', { digits })}</span>}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-muted">{t('currency')}</span>
          <select
            value={state.currency}
            onChange={(e) => set({ currency: e.target.value })}
            className={`${inputClass} h-[3.75rem] cursor-pointer`}
          >
            <optgroup label={t('featuredCurrencies')}>
              {FEATURED_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c} · {currencyName(c, locale)}
                </option>
              ))}
            </optgroup>
            <optgroup label={t('otherCurrencies')}>
              {currencies.slice(FEATURED_CURRENCIES.length).map((c) => (
                <option key={c} value={c}>
                  {c} · {currencyName(c, locale)}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
      </div>

      {/* Method */}
      <fieldset className="mt-7">
        <legend className="mb-2 text-sm font-medium text-muted">{t('method')}</legend>
        <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-surface-2 p-1.5 sm:grid-cols-4">
          {METHODS.map((m) => (
            <button
              key={m.kind}
              type="button"
              aria-pressed={state.method === m.kind}
              onClick={() => set({ method: m.kind })}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                state.method === m.kind
                  ? 'bg-surface text-text shadow-sm ring-1 ring-border'
                  : 'text-muted hover:text-text'
              }`}
            >
              {t(m.label)}
            </button>
          ))}
        </div>
        <p className="mt-2.5 text-sm text-muted">{t(HINTS[state.method])}</p>
      </fieldset>

      {/* People */}
      <fieldset className="mt-7">
        <legend className="mb-2 text-sm font-medium text-muted">{t('people')}</legend>
        <ul className="space-y-2.5">
          {state.people.map((person, i) => (
            <li key={person.id} className="flex items-center gap-2.5">
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ background: `var(--p${(i % 8) + 1})` }}
                aria-hidden="true"
              />
              <input
                value={person.name}
                onChange={(e) =>
                  set({ people: state.people.map((p) => (p.id === person.id ? { ...p, name: e.target.value } : p)) })
                }
                placeholder={`${t('personPlaceholder')} ${i + 1}`}
                aria-label={`${t('personPlaceholder')} ${i + 1}`}
                className={`${inputClass} min-w-0 flex-1`}
              />
              {state.method !== 'equal' && (
                <div className="relative w-28 shrink-0 sm:w-36">
                  <input
                    inputMode="decimal"
                    value={state.inputs[state.method][person.id] ?? ''}
                    onChange={(e) => setInput(person.id, e.target.value)}
                    placeholder={state.method === 'fixed' ? t('fixedPlaceholder') : '0'}
                    aria-label={t('valueFor', {
                      method: t(METHODS.find((m) => m.kind === state.method)!.label),
                      name: person.name || `${t('personPlaceholder')} ${i + 1}`,
                    })}
                    className={`${inputClass} tabular pr-12 text-right placeholder:text-xs`}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-sm text-muted">
                    {state.method === 'percent' ? '%' : state.method === 'ratio' ? '×' : currencySymbol(state.currency, locale)}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => set({ people: state.people.filter((p) => p.id !== person.id) })}
                aria-label={t('removePerson', { name: person.name || `${i + 1}` })}
                className="grid size-10 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-danger-soft hover:text-danger"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => set({ people: [...state.people, { id: newId(), name: '' }] })}
            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-primary/50 px-3.5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t('addPerson')}
          </button>

          {state.method === 'percent' && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold tabular ${
                percentLeft === 0
                  ? 'bg-primary-soft text-primary'
                  : percentLeft > 0
                    ? 'bg-accent-soft text-text'
                    : 'bg-danger-soft text-danger'
              }`}
            >
              {percentLeft === 0
                ? t('percentOk')
                : percentLeft > 0
                  ? t('percentLeft', { value: percentLeft.toLocaleString(locale) })
                  : t('percentOver', { value: (-percentLeft).toLocaleString(locale) })}
            </span>
          )}
        </div>
      </fieldset>
    </div>
  )
}
