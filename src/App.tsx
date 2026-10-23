import { GameProvider } from "./game"
import { Shell } from "./components/Shell"

export default function App() {
  return (
    <GameProvider>
      <Shell />
    </GameProvider>
  )
}
