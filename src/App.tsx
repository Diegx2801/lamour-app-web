import { Route, Routes } from "react-router"
import HomePage from "./pages/HomePage"
import ReservePage from "./pages/ReservePage"

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/reservar" element={<ReservePage />} />
    </Routes>
  )
}

export default App