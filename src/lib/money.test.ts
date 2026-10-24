import { describe, expect, it } from 'vitest'
import { minorDigits, parseAmount, parseNumber } from './money'

describe('minorDigits', () => {
  it('knows how many decimals each currency uses', () => {
    expect(minorDigits('USD')).toBe(2)
    expect(minorDigits('EUR')).toBe(2)
    expect(minorDigits('JPY')).toBe(0)
    expect(minorDigits('KWD')).toBe(3)
  })
})

describe('parseAmount', () => {
  it('parses dot and comma decimals into minor units', () => {
    expect(parseAmount('1234.56', 2)).toBe(123456)
    expect(parseAmount('1 234,5', 2)).toBe(123450)
    expect(parseAmount('0.1', 2)).toBe(10)
    expect(parseAmount('12', 0)).toBe(12)
  })

  it('rejects invalid or over-precise amounts', () => {
    expect(parseAmount('', 2)).toBeNull()
    expect(parseAmount('abc', 2)).toBeNull()
    expect(parseAmount('1.234', 2)).toBeNull()
    expect(parseAmount('-5', 2)).toBeNull()
  })
})

describe('parseNumber', () => {
  it('parses plain decimals', () => {
    expect(parseNumber('12,5')).toBe(12.5)
    expect(parseNumber('')).toBeNull()
    expect(parseNumber('.')).toBeNull()
  })
})
