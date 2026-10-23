import { Component, type ReactNode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.css"

class Boundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false }

  static getDerivedStateFromError() {
    return { error: true }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-lg p-8 text-sm leading-relaxed">
          Не удалось открыть игру. Обновите страницу. Прогресс лежит в этом браузере и никуда не отправляется.
        </div>
      )
    }
    return this.props.children
  }
}

const root = document.getElementById("root")
if (root) {
  createRoot(root).render(
    <Boundary>
      <App />
    </Boundary>,
  )
}
