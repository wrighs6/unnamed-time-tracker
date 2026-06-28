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
        Start
        <input type="datetime-local" required />
      </label>
      <label>
        End
        <input type="datetime-local" required />
      </label>
      <label>
        Task
        <input type="url" />
      </label>
      <label class={styles.description}>
        Description
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
          <th>Task</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>6/28/2026 11:00 AM</td>
          <td>6/28/2026 1:00 PM</td>
          <td>2:00</td>
          <td>google.com/search?q=test</td>
          <td>for:Me,Test</td>
        </tr>
      </tbody>
    </table>
  )
}

export default App
