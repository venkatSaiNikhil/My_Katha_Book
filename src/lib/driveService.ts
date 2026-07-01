import { csvToTransactions, transactionsToCSV } from '../data/csv'
import type { AppState } from '../data/types'
import { getAccessToken } from './googleAuth'

const DRIVE_API = 'https://www.googleapis.com/drive/v3/files'
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files'

const TXN_FILE_NAME = 'khata-transactions.csv'
const WEALTH_FILE_NAME = 'khata-wealth.json'

export function getToken(): string {
  const token = getAccessToken()
  if (!token) throw new Error('Not signed in to Google Drive')
  return token
}

export async function findFile(name: string, existingId: string | null): Promise<string> {
  const token = getToken()

  if (existingId) {
    const existingRes = await fetch(`${DRIVE_API}/${existingId}?fields=id`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (existingRes.ok) return existingId
  }

  const query = encodeURIComponent(`name='${name}' and trashed=false`)
  const searchRes = await fetch(`${DRIVE_API}?q=${query}&fields=files(id)`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const searchData = (await searchRes.json()) as { files?: { id: string }[] }
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id
  }

  const createRes = await fetch(DRIVE_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, mimeType: 'text/plain' }),
  })
  const createData = (await createRes.json()) as { id: string }
  return createData.id
}

export async function uploadFile(fileId: string, content: string, mimeType: string): Promise<void> {
  const token = getToken()
  await fetch(`${DRIVE_UPLOAD_API}/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': mimeType,
    },
    body: content,
  })
}

export async function downloadFile(fileId: string): Promise<string> {
  const token = getToken()
  const res = await fetch(`${DRIVE_API}/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.text()
}

export interface SyncResult {
  txnFileId: string
  wealthFileId: string
}

export async function syncAll(state: AppState): Promise<SyncResult> {
  const txnFileId = await findFile(TXN_FILE_NAME, state.driveFileIds.txn)
  await uploadFile(txnFileId, transactionsToCSV(state.transactions, state.categories), 'text/csv')

  const wealthFileId = await findFile(WEALTH_FILE_NAME, state.driveFileIds.wealth)
  await uploadFile(wealthFileId, JSON.stringify(state.wealth), 'application/json')

  return { txnFileId, wealthFileId }
}

export async function loadFromDrive(state: AppState): Promise<Partial<AppState>> {
  const txnFileId = await findFile(TXN_FILE_NAME, state.driveFileIds.txn)
  const wealthFileId = await findFile(WEALTH_FILE_NAME, state.driveFileIds.wealth)

  const [txnCsv, wealthJson] = await Promise.all([downloadFile(txnFileId), downloadFile(wealthFileId)])

  const transactions = txnCsv.trim() ? csvToTransactions(txnCsv, state.categories) : []
  const wealth = wealthJson.trim() ? JSON.parse(wealthJson) : []

  return {
    transactions,
    wealth,
    driveFileIds: { txn: txnFileId, wealth: wealthFileId },
  }
}
