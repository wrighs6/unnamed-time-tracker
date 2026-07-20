import { For, type Component } from "solid-js"

import styles from "./App.module.css"
import { createStore } from "solid-js/store"

type Item = {
  start: Date
  end: Date
  notes: string
}

export const App: Component = () => {
  const [items, setItems] = createStore<Item[]>([{
    start: new Date(2026, 7, 20, 10, 0, 0),
    end: new Date(2026, 7, 20, 11, 30, 0),
    notes: "Hello, world!"
  }])

  return (
    <div class={styles.App}>
      <ItemCreator />
      <ItemDisplay items={items} />
    </div>
  )
}

const ItemCreator: Component = () => {
  return (
    <form class={styles.ItemCreator}>
      <label>
        Date
        <input type="date" value={toDateInputValue(new Date())} required />
      </label>
      <label>
        Start
        <input type="time" required />
      </label>
      <label>
        End
        <input type="time" required />
      </label>
      <label class={styles.notes}>
        Notes
        <input type="text" />
      </label>
      <button>Create</button>
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
