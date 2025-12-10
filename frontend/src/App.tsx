import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import './App.css'
import Login from './pages/login/Login'
import CreateAccount from './pages/createaccount/CreateAccount'

function App() {
  return (
    <>
      <header>
        <h1 className='logo'>StreamFlix</h1>
        <nav>
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/create">Create Account</NavLink>
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
