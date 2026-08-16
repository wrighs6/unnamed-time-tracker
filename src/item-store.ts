import { createEffect } from "solid-js"
import { createStore, unwrap } from "solid-js/store"
import * as z from "zod/mini"

const ItemSchema = z.object({
  start: z.coerce.date(),
  end: z.coerce.date(),
  notes: z.string()
})

export type Item = z.infer<typeof ItemSchema>

export function createItemStore(key: string) {
  const [items, setItems] = createStore<Item[]>(loadStore(key))

  createEffect(() => {
    localStorage.setItem(key, JSON.stringify(items))
  })

  const addItem = (item: Item) => setItems(items.length, item)

  const updateItem = (index: number, item: Item) => setItems(index, item)

  const deleteItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index))

  const download = () => {
    const jsonString = JSON.stringify(unwrap(items), null, 2)
    const url = URL.createObjectURL(new Blob([jsonString], { type: "application/json" }))

    const a = document.createElement("a")
    a.href = url
    a.download = `items${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return [items, addItem, updateItem, deleteItem, download] as const
}

function loadStore(key: string): Item[] {
  const stored = localStorage.getItem(key)

  if (stored === null) {
    return []
  }

  try {
    return z.array(ItemSchema).parse(JSON.parse(stored))
  } catch (error) {
    console.error("failed to load items from localStorage:", error)
    return []
  }
}
