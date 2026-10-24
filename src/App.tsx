import { useMemo, useState } from 'react'
import { Header } from './components/Header'
import { ResultPanel } from './components/ResultPanel'
import { SplitForm, type FormState } from './components/SplitForm'
import { useI18n } from './i18n'
import { newId } from './lib/id'
import { minorDigits, parseAmount, parseNumber } from './lib/money'
import { splitBill, type Method } from './lib/split'

function initialState(names: string): FormState {
  return {
    amountText: '1200',
    currency: 'USD',
    people: names.split(',').map((name) => ({ id: newId(), name })),
    method: 'equal',
    inputs: { percent: {}, ratio: {}, fixed: {} },
  }
}

function buildMethod(state: FormState, digits: number): Method {
  const numbers = (texts: Record<string, string>) =>
    Object.fromEntries(Object.entries(texts).map(([id, text]) => [id, parseNumber(text) ?? undefined]))

  switch (state.method) {
    case 'equal':
      return { kind: 'equal' }
    case 'percent':
      return { kind: 'percent', values: numbers(state.inputs.percent) }
    case 'ratio':
      return { kind: 'ratio', values: numbers(state.inputs.ratio) }
    case 'fixed':
      return {
        kind: 'fixed',
        values: Object.fromEntries(
          Object.entries(state.inputs.fixed).map(([id, text]) => [id, parseAmount(text, digits) ?? undefined]),
        ),
      }
  }
}

export default function App() {
  const { t } = useI18n()
  const [state, setState] = useState<FormState>(() => initialState(t('defaultNames')))

  const digits = minorDigits(state.currency)
  const total = parseAmount(state.amountText, digits)
  const amountInvalid = state.amountText.trim() !== '' && total === null
  const method = state.method
  const awaitingValues =
    method !== 'equal' && state.people.every((p) => !state.inputs[method][p.id]?.trim())

  const result = useMemo(
    () => (total === null ? null : splitBill(total, state.people, buildMethod(state, digits))),
    [state, total, digits],
  )

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-6">
        <section className="py-8 sm:py-12">
          <h1 className="font-display text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl">
            {t('heroTitle')}{' '}
            <span className="relative isolate whitespace-nowrap text-primary">
              <span className="absolute inset-x-[-0.15em] bottom-[0.08em] -z-10 h-[0.38em] rounded-full bg-accent/70 dark:bg-accent/20" />
              {t('heroTitleAccent')}
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">{t('heroText')}</p>
        </section>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-6">
          <SplitForm state={state} onChange={setState} amountInvalid={amountInvalid} />
          <div className="lg:sticky lg:top-6">
            <ResultPanel
              total={total}
              currency={state.currency}
              people={state.people}
              result={result}
              awaitingValues={awaitingValues}
            />
          </div>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-muted sm:px-6">{t('footer')}</footer>
    </div>
  )
}
