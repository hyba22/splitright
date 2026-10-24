import { describe, expect, it } from 'vitest'
import { allocate, splitBill, type Person } from './split'

const people: Person[] = [
  { id: 'a', name: 'Amel' },
  { id: 'b', name: 'Bilal' },
  { id: 'c', name: 'Chloé' },
]

const amounts = (r: ReturnType<typeof splitBill>) => (r.ok ? r.lines.map((l) => l.amount) : r.error)
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

describe('allocate', () => {
  it('gives the missing cent to the earliest tie', () => {
    expect(allocate(10000, [1n, 1n, 1n]).map((s) => s.amount)).toEqual([3334, 3333, 3333])
  })

  it('gives leftover cents to the largest remainders, not the first person', () => {
    // 100 split 1:1:2 of 0.01 units → exact 0.25, 0.25, 0.5 of 1 cent
    const shares = allocate(1, [1n, 1n, 2n])
    expect(shares.map((s) => s.amount)).toEqual([0, 0, 1])
  })

  it('always sums to the total', () => {
    for (let total = 0; total < 500; total += 7) {
      const weights = [3n, 7n, 11n, 13n]
      expect(sum(allocate(total, weights).map((s) => s.amount))).toBe(total)
    }
  })
})

describe('splitBill', () => {
  it('splits equally to the cent', () => {
    const r = splitBill(10000, people, { kind: 'equal' })
    expect(amounts(r)).toEqual([3334, 3333, 3333])
    if (r.ok) expect(r.lines.map((l) => l.extra)).toEqual([1, 0, 0])
  })

  it('splits by percentage', () => {
    const r = splitBill(123456, people, { kind: 'percent', values: { a: 50, b: 30, c: 20 } })
    expect(amounts(r)).toEqual([61728, 37037, 24691])
  })

  it('rejects percentages that do not add up to 100', () => {
    const r = splitBill(1000, people, { kind: 'percent', values: { a: 50, b: 30, c: 10 } })
    expect(amounts(r)).toBe('percentNot100')
  })

  it('accepts decimal percentages that add up to 100', () => {
    const r = splitBill(100000, people, { kind: 'percent', values: { a: 33.33, b: 33.33, c: 33.34 } })
    expect(amounts(r)).toEqual([33330, 33330, 33340])
  })

  it('splits by ratio (room size)', () => {
    const r = splitBill(150000, people, { kind: 'ratio', values: { a: 14, b: 11.5, c: 9 } })
    expect(r.ok && sum(r.lines.map((l) => l.amount))).toBe(150000)
    expect(amounts(r)).toEqual([60870, 50000, 39130])
  })

  it('lets someone with a ratio of zero pay nothing', () => {
    expect(amounts(splitBill(1000, people, { kind: 'ratio', values: { a: 1, b: 1 } }))).toEqual([500, 500, 0])
  })

  it('rejects an all-zero ratio', () => {
    expect(amounts(splitBill(1000, people, { kind: 'ratio', values: {} }))).toBe('ratioZero')
  })

  it('splits the remainder after fixed amounts', () => {
    const r = splitBill(10000, people, { kind: 'fixed', values: { a: 2500 } })
    expect(amounts(r)).toEqual([2500, 3750, 3750])
  })

  it('rounds the remainder after fixed amounts', () => {
    expect(amounts(splitBill(10001, people, { kind: 'fixed', values: { c: 0 } }))).toEqual([5001, 5000, 0])
  })

  it('rejects fixed amounts larger than the total', () => {
    expect(amounts(splitBill(1000, people, { kind: 'fixed', values: { a: 800, b: 300 } }))).toBe('fixedExceedsTotal')
  })

  it('requires fixed amounts to match when everyone is fixed', () => {
    expect(amounts(splitBill(1000, people, { kind: 'fixed', values: { a: 300, b: 300, c: 300 } }))).toBe(
      'fixedMismatch',
    )
  })

  it('needs at least one person', () => {
    expect(amounts(splitBill(1000, [], { kind: 'equal' }))).toBe('noPeople')
  })
})
