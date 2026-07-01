import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATEGORIES } from '../../data/categories'
import type { AppState } from '../../data/types'
import { findFile, loadFromDrive, syncAll, uploadFile } from '../driveService'

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response
}

function textResponse(body: string, ok = true): Response {
  return {
    ok,
    text: async () => body,
    json: async () => JSON.parse(body),
  } as Response
}

function makeState(overrides: Partial<AppState> = {}): AppState {
  return {
    transactions: [],
    categories: DEFAULT_CATEGORIES,
    wealth: [],
    user: null,
    driveFileIds: { txn: null, wealth: null },
    ...overrides,
  }
}

describe('driveService', () => {
  beforeEach(() => {
    sessionStorage.setItem('khata_v1_access_token', 'test-token')
  })

  afterEach(() => {
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  describe('findFile', () => {
    it('returns the existing ID if the file is still reachable', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(jsonResponse({ id: 'existing-id' }))

      const id = await findFile('khata-transactions.csv', 'existing-id')

      expect(id).toBe('existing-id')
      expect(fetchSpy).toHaveBeenCalledTimes(1)
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/files/existing-id'),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        }),
      )
    })

    it('searches by name and creates a new file if none exists', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(jsonResponse({ files: [] }))
        .mockResolvedValueOnce(jsonResponse({ id: 'new-id' }))

      const id = await findFile('khata-transactions.csv', null)

      expect(id).toBe('new-id')
      expect(fetchSpy).toHaveBeenCalledTimes(2)
      expect(fetchSpy.mock.calls[1][1]).toMatchObject({ method: 'POST' })
    })
  })

  describe('uploadFile', () => {
    it('PATCHes the file content with the correct URL and content-type', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(jsonResponse({}))

      await uploadFile('file-1', 'a,b,c', 'text/csv')

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/upload/drive/v3/files/file-1?uploadType=media'),
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({ 'Content-Type': 'text/csv' }),
          body: 'a,b,c',
        }),
      )
    })
  })

  describe('loadFromDrive', () => {
    it('downloads and parses the transactions CSV into Transaction[]', async () => {
      const csv =
        'ID,Date,Type,Category,Subcategory,Method,Amount,Note\n' +
        'txn-1,2025-06-12,expense,Groceries,Milk & Dairy,Cash,10000,'

      const state = makeState({ driveFileIds: { txn: 'txn-file', wealth: 'wealth-file' } })

      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(jsonResponse({ id: 'txn-file' })) // findFile txn: existing-id check
        .mockResolvedValueOnce(jsonResponse({ id: 'wealth-file' })) // findFile wealth: existing-id check
        .mockResolvedValueOnce(textResponse(csv)) // download txn
        .mockResolvedValueOnce(textResponse('[]')) // download wealth

      const result = await loadFromDrive(state)

      expect(result.transactions).toHaveLength(1)
      expect(result.transactions?.[0]).toMatchObject({
        id: 'txn-1',
        categoryId: 'groceries',
        subcategory: 'Milk & Dairy',
        amountPaise: 10000,
      })
      expect(result.wealth).toEqual([])
    })
  })

  describe('syncAll with a missing access token', () => {
    it('rejects gracefully without making any network calls', async () => {
      sessionStorage.clear()
      const fetchSpy = vi.spyOn(globalThis, 'fetch')

      await expect(syncAll(makeState())).rejects.toThrow('Not signed in to Google Drive')
      expect(fetchSpy).not.toHaveBeenCalled()
    })
  })
})
