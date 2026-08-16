import { createEffect, createSignal, For, JSX, Setter, type Component } from "solid-js"
import { DownloadIcon } from "lucide-solid"
import { createItemStore, Item } from "./item-store"
import styles from "./App.module.css"

export const App: Component = () => {
  const [items, addItem, download] = createItemStore("utt")
  const [selected, setSelected] = createSignal<number | undefined>(undefined)
  let selectedDialog!: HTMLDialogElement;

  createEffect(() => {
    if (selected() !== undefined) {
      selectedDialog.showModal()
    }
  })

  return (
    <div class={styles.app}>
      <ItemCreator create={addItem} />
      <ItemDisplay items={items} setSelected={setSelected} />
      <button class={styles.downloadButton} onClick={download}><DownloadIcon /></button>
      <dialog
        ref={selectedDialog}
        onClose={() => setSelected(undefined)}
        closedby="any"
      >
        <ItemDetails item={items[selected() || 0]} />
      </dialog>
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
    <form class={styles.itemCreator} onSubmit={handleSubmit}>
      <label class={styles.myLabel}>
        Date
        {/* attr:value needed, otherwise reset() blanks field instead of setting to "today" */}
        <input name="date" type="date" attr:value={toDateInputValue(new Date())} required />
      </label>
      <label class={styles.myLabel}>
        Start
        <input name="start" type="time" required />
      </label>
      <label class={styles.myLabel}>
        End
        <input name="end" type="time" required />
      </label>
      <label class={`${styles.myLabel} ${styles.notes}`}>
        Notes
        <input name="notes" type="text" />
      </label>
      <button class={styles.createButton} type="submit">Create</button>
    </form>
  )
}

const ItemDisplay: Component<{ items: Item[], setSelected: Setter<number | undefined> }> = ({ items, setSelected }) => {
  const formatDate = (date: Date) => date.toLocaleString("en-us", { dateStyle: "short", timeStyle: "short" })

  const durationString = (start: Date, end: Date) => {
    const minutes = Math.floor((end.getTime() - start.getTime()) / 60000)
    const hours = Math.floor(minutes / 60)

    const minStr = (minutes % 60).toString().padStart(2, "0")

    return `${hours}:${minStr}`
  }

  return (
    <div class={styles.tableWrapper}>
      <table class={styles.itemDisplay}>
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
              <tr onClick={() => setSelected(index)}>
                <td>{formatDate(start)}</td>
                <td>{formatDate(end)}</td>
                <td>{durationString(start, end)}</td>
                <td>{notes}</td>
              </tr>
            }
          </For>
        </tbody>
      </table>
    </div>
  )
}

const ItemDetails: Component<{ item: Item }> = ({ item }) => {
  return (
    <div>
      <div class={styles.idRow}>
        <label class={styles.myLabel}>
          Start
          <input name="start" type="datetime-local" required disabled value={toDateTimeInputValue(item.start)} />
        </label>
        <label class={styles.myLabel}>
          End
          <input name="end" type="datetime-local" required disabled value={toDateTimeInputValue(item.end)} />
        </label>
      </div>
      <label class={styles.myLabel}>
        Notes
        <textarea name="notes" required disabled>
          {item.notes}
        </textarea>
      </label>
    </div>
  )
}

function toDateInputValue(dateObject: Date) {
  const local = new Date(dateObject)
  local.setMinutes(dateObject.getMinutes() - dateObject.getTimezoneOffset())
  return local.toJSON().slice(0, 10)
}

function toDateTimeInputValue(dateObject: Date) {
  const pad = (num: number) => String(num).padStart(2, '0')

  const yyyy = dateObject.getFullYear();
  const mm = pad(dateObject.getMonth() + 1); // Months are zero-indexed
  const dd = pad(dateObject.getDate());
  const hh = pad(dateObject.getHours());
  const min = pad(dateObject.getMinutes());

  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}
