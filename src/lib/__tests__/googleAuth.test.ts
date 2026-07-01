import { describe, expect, it } from 'vitest'
import { decodeIdToken } from '../googleAuth'

function makeIdToken(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

describe('decodeIdToken', () => {
  it('extracts name, email, and picture from the JWT payload', () => {
    const token = makeIdToken({
      name: 'Nikhil',
      email: 'nikhil@example.com',
      picture: 'https://example.com/pic.jpg',
    })

    expect(decodeIdToken(token)).toEqual({
      name: 'Nikhil',
      email: 'nikhil@example.com',
      picture: 'https://example.com/pic.jpg',
    })
  })

  it('handles tokens without a picture claim', () => {
    const token = makeIdToken({ name: 'Nikhil', email: 'nikhil@example.com' })
    expect(decodeIdToken(token)).toEqual({
      name: 'Nikhil',
      email: 'nikhil@example.com',
      picture: undefined,
    })
  })
})
