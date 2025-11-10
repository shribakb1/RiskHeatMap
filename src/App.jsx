import { useState } from 'react'
import RiskDashboard from './RiskDashboard'
import './App.css'

function App() {
  const [showDashboard, setShowDashboard] = useState(false)

  if (showDashboard) {
    return <RiskDashboard />
  }

  return (
    <>
      <h1>Vite + React</h1>
      <button onClick={() => setShowDashboard(true)}>
        Open Risk Dashboard
      </button>
    </>
  )
}

export default App