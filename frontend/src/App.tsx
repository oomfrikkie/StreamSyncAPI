import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Login from './pages/login/Login'
import CreateAccount from './pages/createaccount/CreateAccount'

function App() {
  return (
    <>
      <header>
        <nav>
          <Link to="/login">Login</Link>
          <Link to="/create">Create Account</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/create" element={<CreateAccount />} />
        </Routes>
      </main>
    </>
  )
}

export default App
