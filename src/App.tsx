import { Show, createEffect, createSignal, For, JSX, Setter, type Component } from "solid-js"
import { DownloadIcon } from "lucide-solid"
import { createItemStore, Item } from "./item-store"
import styles from "./App.module.css"

export const App: Component = () => {
  const [items, addItem, updateItem, deleteItem, download] = createItemStore("utt")
  const [selected, setSelected] = createSignal<number | undefined>(undefined)
  let selectedDialog!: HTMLDialogElement;

  createEffect(() => {
    if (selected() !== undefined) {
      selectedDialog.showModal()
    }
  })

  // A modal <dialog> surfaces clicks on its ::backdrop as clicks on the dialog
  // element itself, while clicks on the content target a descendant. Hit-test
  // against the dialog's box so we only close when the user clicked the
  // backdrop (outside the content) — never when a click lands on content.
  const closeOnBackdropClick: JSX.EventHandler<HTMLDialogElement, MouseEvent> = (event) => {
    const rect = selectedDialog.getBoundingClientRect()
    const clickedOutside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom

    if (clickedOutside) {
      selectedDialog.close() // onClose then clears `selected`
    }
  }

  return (
    <div class={styles.app}>
      <ItemCreator create={addItem} />
      <ItemDisplay items={items} setSelected={setSelected} />
      <button class={styles.downloadButton} onClick={download}><DownloadIcon /></button>
      <dialog
        ref={selectedDialog}
        onClose={() => setSelected(undefined)}
        onClick={closeOnBackdropClick}
      >
        {/* Show remounts ItemDetails per open, so edit/confirm state resets between visits */}
        <Show when={selected() !== undefined}>
          <ItemDetails
            item={items[selected() || 0]}
            update={item => updateItem(selected() || 0, item)}
            remove={() => {
              deleteItem(selected() || 0)
              selectedDialog.close() // onClose then clears `selected`
            }}
          />
        </Show>
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
            {(item, index) =>
              <tr onClick={() => setSelected(index)}>
                {/* read through the store proxy, NOT destructured locals, so cells re-render on update */}
                <td>{formatDate(item.start)}</td>
                <td>{formatDate(item.end)}</td>
                <td>{durationString(item.start, item.end)}</td>
                <td>{item.notes}</td>
              </tr>
            }
          </For>
        </tbody>
      </table>
    </div>
  )
}

const ItemDetails: Component<{ item: Item, update: (item: Item) => void, remove: () => void }> = ({ item, update, remove }) => {
  const [editing, setEditing] = createSignal(false)
  const [confirming, setConfirming] = createSignal(false)

  const handleSubmit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (event) => {
    event.preventDefault()

    // first press of the button enters edit mode; second press saves.
    if (!editing()) {
      setEditing(true)
      return
    }

    const data = new FormData(event.currentTarget)
    const start = data.get("start")
    const end = data.get("end")
    const notes = data.get("notes")

    const updated: Item = { start: item.start, end: item.end, notes: item.notes }

    // TODO: same date-parsing robustness questions as ItemCreator (can new Date throw?)
    if (typeof start === "string") updated.start = new Date(start)
    if (typeof end === "string") updated.end = new Date(end)
    if (typeof notes === "string") updated.notes = notes

    update(updated)
    setEditing(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div class={styles.idRow}>
        <label class={styles.myLabel}>
          Start
          <input name="start" type="datetime-local" required disabled={!editing()} value={toDateTimeInputValue(item.start)} />
        </label>
        <label class={styles.myLabel}>
          End
          <input name="end" type="datetime-local" required disabled={!editing()} value={toDateTimeInputValue(item.end)} />
        </label>
      </div>
      <label class={styles.myLabel}>
        Notes
        <textarea name="notes" disabled={!editing()}>
          {item.notes}
        </textarea>
      </label>
      <div class={styles.dialogActions}>
        <div>
          {confirming() ? (
            <>
              <button class={styles.confirmButton} type="button" onClick={() => { remove(); setConfirming(false) }}>Confirm delete</button>
              <button class={styles.cancelButton} type="button" onClick={() => setConfirming(false)}>Cancel</button>
            </>
          ) : (
            <button class={styles.deleteButton} type="button" onClick={() => setConfirming(true)}>Delete</button>
          )}
        </div>
        <div>
          {editing() && (
            <button class={styles.cancelButton} type="button" onClick={() => setEditing(false)}>Cancel</button>
          )}
          <button class={styles.createButton} type="submit">{editing() ? "Save" : "Edit"}</button>
        </div>
      </div>
    </form>
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
