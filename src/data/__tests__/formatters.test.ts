import { describe, expect, it } from 'vitest'
import { formatRupee, formatRupeeCompact, paiToRupee, rupeeToPaise } from '../formatters'

describe('formatRupee', () => {
  it('formats 0 paise', () => {
    expect(formatRupee(0)).toBe('₹0')
  })

  it('formats 100 paise as ₹1', () => {
    expect(formatRupee(100)).toBe('₹1')
  })

  it('formats 100000 paise as ₹1,000', () => {
    expect(formatRupee(100000)).toBe('₹1,000')
  })

  it('formats 10000000 paise as ₹1,00,000', () => {
    expect(formatRupee(10000000)).toBe('₹1,00,000')
  })
})

describe('formatRupeeCompact', () => {
  it('formats lakhs', () => {
    expect(formatRupeeCompact(12000000)).toBe('₹1.2L')
  })

  it('formats thousands', () => {
    expect(formatRupeeCompact(4500000)).toBe('₹45K')
  })
})

describe('paiToRupee / rupeeToPaise', () => {
  it('converts paise to rupees', () => {
    expect(paiToRupee(12345)).toBeCloseTo(123.45)
  })

  it('rounds float rupee inputs to the nearest paise', () => {
    expect(rupeeToPaise(123.456)).toBe(12346)
    expect(rupeeToPaise(99.994)).toBe(9999)
    expect(rupeeToPaise(0.005)).toBe(1)
  })
})
