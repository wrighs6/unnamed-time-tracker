import { createStore } from "solid-js/store"

export type Item = {
  start: Date
  end: Date
  notes: string
}

export function createItemStore() {
  const [items, setItems] = createStore<Item[]>([])

  const addItem = (item: Item) => setItems(items.length, item)

  return [items, addItem] as const
}
