import type { Component } from "solid-js"

import styles from "./App.module.css"

const App: Component = () => {
  return (
    <div class={styles.App}>
      <ItemCreator />
      <ItemDisplay />
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

const ItemDisplay: Component = () => {
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
        <tr>
          <td>6/28/2026 11:00 AM</td>
          <td>6/28/2026 1:00 PM</td>
          <td>2:00</td>
          <td>for:Me,Test</td>
        </tr>
      </tbody>
    </table>
  )
}

function toDateInputValue(dateObject: Date){
    const local = new Date(dateObject);
    local.setMinutes(dateObject.getMinutes() - dateObject.getTimezoneOffset());
    return local.toJSON().slice(0,10);
};

export default App
