const DB_NAME = "ochre-editor"
const STORE = "draft"

export type EditorDraft = {
  blob: Blob
  width: number
  height: number
  name: string
  note?: string
}

function database() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveEditorDraft(draft: EditorDraft) {
  const db = await database()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite")
    tx.objectStore(STORE).put(draft, "current")
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export async function loadEditorDraft(): Promise<EditorDraft | null> {
  const db = await database()
  const draft = await new Promise<EditorDraft | null>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly")
    const request = tx.objectStore(STORE).get("current")
    request.onsuccess = () => resolve((request.result as EditorDraft | undefined) ?? null)
    request.onerror = () => reject(request.error)
  })
  db.close()
  return draft
}
