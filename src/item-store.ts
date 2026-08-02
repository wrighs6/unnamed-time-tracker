import { createEffect } from "solid-js"
import { createStore } from "solid-js/store"
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

  return [items, addItem] as const
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
