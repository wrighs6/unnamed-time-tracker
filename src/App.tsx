import { For, JSX, type Component } from "solid-js"

import styles from "./App.module.css"
import { createStore } from "solid-js/store"

type Item = {
  start: Date
  end: Date
  notes: string
}

export const App: Component = () => {
  const [items, setItems] = createStore<Item[]>([])

  return (
    <div class={styles.App}>
      <ItemCreator create={item => setItems(items.length, item)} />
      <ItemDisplay items={items} />
    </div>
  )
}

const ItemCreator: Component<{ create: (item: Item) => void }> = ({ create }) => {
  const handleSubmit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (event) => {
    event.preventDefault()

    const data = new FormData(event.currentTarget)
    const date = data.get("date")
    const start = data.get("start")
    const end = data.get("end")
    const notes = data.get("notes")
    const item: Item = { start: new Date(), end: new Date(), notes: "" }

    if (typeof date === "string") {
      if (typeof start === "string") item.start = new Date(`${date}T${start}`) // TODO: can date creation throw errors?
      if (typeof end === "string") item.end = new Date(`${date}T${end}`) // TODO: do something if end <= start
    }

    if (typeof notes === "string") item.notes = notes // TODO: should notes be processed? maybe at least trim whitespace? 

    create(item)

    event.currentTarget.reset()
  }

  return (
    <form class={styles.ItemCreator} onSubmit={handleSubmit}>
      <label>
        Date
        {/* attr:value needed, otherwise reset() blanks field instead of setting to "today" */}
        <input name="date" type="date" attr:value={toDateInputValue(new Date())} required />
      </label>
      <label>
        Start
        <input name="start" type="time" required />
      </label>
      <label>
        End
        <input name="end" type="time" required />
      </label>
      <label class={styles.notes}>
        Notes
        <input name="notes" type="text" />
      </label>
      <button type="submit">Create</button>
    </form>
  )
}

const ItemDisplay: Component<{ items: Item[] }> = ({ items }) => {
  const formatDate = (date: Date) => date.toLocaleString("en-us", { dateStyle: "short", timeStyle: "short" })

  const durationString = (start: Date, end: Date) => {
    const minutes = Math.floor((end.getTime() - start.getTime()) / 60000)
    const hours = Math.floor(minutes / 60)

    return `${hours}:${minutes % 60}`
  }

  return (
    <table class={styles.ItemDisplay}>
      <thead>
        <tr>
          <th>Start</th>
          <th>End</th>
          <th>Duration</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        <For each={items}>
          {({ start, end, notes }, index) =>
            <tr>
              <td>{formatDate(start)}</td>
              <td>{formatDate(end)}</td>
              <td>{durationString(start, end)}</td>
              <td>{notes}</td>
            </tr>
          }
        </For>
      </tbody>
    </table>
  )
}

function toDateInputValue(dateObject: Date) {
  const local = new Date(dateObject);
  local.setMinutes(dateObject.getMinutes() - dateObject.getTimezoneOffset());
  return local.toJSON().slice(0, 10);
};
