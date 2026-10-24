/**
 * Split engine. All money is in integer minor units (cents), and shares are
 * computed with BigInt so no floating-point error can creep in. Leftover units
 * after rounding down are handed out with the largest remainder method, so the
 * shares always add up to the total exactly.
 */

export type Person = { id: string; name: string }

export type Method =
  | { kind: 'equal' }
  | { kind: 'percent'; values: Record<string, number | undefined> }
  | { kind: 'ratio'; values: Record<string, number | undefined> }
  /** Fixed amounts (minor units) for some people; everyone without one splits the rest equally. */
  | { kind: 'fixed'; values: Record<string, number | undefined> }

export type MethodKind = Method['kind']

export type ShareLine = {
  personId: string
  /** Final amount in minor units. */
  amount: number
  /** Exact unrounded share in minor units (for explanations only). */
  exact: number
  /** Leftover minor units this person received from rounding (0 or 1). */
  extra: number
}

export type SplitError =
  | 'noPeople'
  | 'percentNot100'
  | 'ratioZero'
  | 'fixedExceedsTotal'
  | 'fixedMismatch'

export type SplitResult = { ok: true; lines: ShareLine[] } | { ok: false; error: SplitError }

/** Weights keep up to 6 decimals (e.g. 33.333333 % or 12.5 m²). */
const SCALE = 1_000_000

function toScaled(value: number | undefined): bigint {
  if (value === undefined || !Number.isFinite(value) || value <= 0) return 0n
  return BigInt(Math.round(value * SCALE))
}

/**
 * Splits `total` minor units proportionally to `weights`. Everyone first gets
 * their share rounded down; the leftover units go one each to the people with
 * the largest remainders (ties go to whoever is listed first).
 */
export function allocate(total: number, weights: bigint[]): { amount: number; exact: number; extra: number }[] {
  const sum = weights.reduce((a, b) => a + b, 0n)
  if (sum === 0n) throw new Error('allocate: weights sum to zero')
  const t = BigInt(total)

  const parts = weights.map((w, index) => {
    const numerator = t * w
    return { index, base: numerator / sum, remainder: numerator % sum, exact: Number(numerator) / Number(sum) }
  })

  let leftover = t - parts.reduce((a, p) => a + p.base, 0n)
  const order = [...parts].sort((a, b) =>
    a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1,
  )
  const extra = new Array<number>(parts.length).fill(0)
  for (const p of order) {
    if (leftover === 0n) break
    if (p.remainder === 0n) break
    extra[p.index] = 1
    leftover -= 1n
  }

  return parts.map((p) => ({ amount: Number(p.base) + extra[p.index], exact: p.exact, extra: extra[p.index] }))
}

export function splitBill(total: number, people: Person[], method: Method): SplitResult {
  if (people.length === 0) return { ok: false, error: 'noPeople' }
  const ids = people.map((p) => p.id)
  const lines = (shares: { amount: number; exact: number; extra: number }[]): SplitResult => ({
    ok: true,
    lines: shares.map((s, i) => ({ personId: ids[i], ...s })),
  })

  switch (method.kind) {
    case 'equal':
      return lines(allocate(total, ids.map(() => 1n)))

    case 'percent': {
      const weights = ids.map((id) => toScaled(method.values[id]))
      const sum = weights.reduce((a, b) => a + b, 0n)
      if (sum !== BigInt(100 * SCALE)) return { ok: false, error: 'percentNot100' }
      return lines(allocate(total, weights))
    }

    case 'ratio': {
      const weights = ids.map((id) => toScaled(method.values[id]))
      if (weights.every((w) => w === 0n)) return { ok: false, error: 'ratioZero' }
      return lines(allocate(total, weights))
    }

    case 'fixed': {
      const fixed = ids.map((id) => {
        const v = method.values[id]
        return v === undefined ? undefined : Math.max(0, Math.round(v))
      })
      const fixedSum = fixed.reduce<number>((a, v) => a + (v ?? 0), 0)
      if (fixedSum > total) return { ok: false, error: 'fixedExceedsTotal' }
      const restIndexes = fixed.flatMap((v, i) => (v === undefined ? [i] : []))
      if (restIndexes.length === 0) {
        if (fixedSum !== total) return { ok: false, error: 'fixedMismatch' }
        return lines(fixed.map((v) => ({ amount: v ?? 0, exact: v ?? 0, extra: 0 })))
      }
      const restShares = allocate(total - fixedSum, restIndexes.map(() => 1n))
      const result = fixed.map((v) => ({ amount: v ?? 0, exact: v ?? 0, extra: 0 }))
      restIndexes.forEach((personIndex, k) => (result[personIndex] = restShares[k]))
      return lines(result)
    }
  }
}
