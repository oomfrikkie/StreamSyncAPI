import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import './App.css'
import Login from './pages/login/Login'
import CreateAccount from './pages/createaccount/CreateAccount'
import Profiles from './pages/profiles/Profiles'
import Home from './pages/home/Home'

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
          <Route path="/profiles" element={<Profiles />} />
          <Route path='/home' element={<Home />}/>
        </Routes>
      </main>
    </>
  )
}

export default App
