import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [backendMessage, setBackendMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Test backend connection
    fetch('http://localhost:3000/')
      .then(res => res.text())
      .then(data => {
        setBackendMessage(data)
        setError('')
      })
      .catch(err => {
        setError('Failed to connect to backend: ' + err.message)
        console.error('Backend connection error:', err)
      })
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      
      {/* Backend connection status */}
      <div className="card">
        {backendMessage && (
          <p style={{ color: 'green' }}>Backend connected: {backendMessage}</p>
        )}
        {error && (
          <p style={{ color: 'red' }}>Backend connection error: {error}</p>
        )}
      </div>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
