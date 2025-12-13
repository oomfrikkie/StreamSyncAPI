import { BrowserRouter, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/login/Login";
import CreateAccount from "./pages/createaccount/CreateAccount";
import Profiles from "./pages/profiles/Profiles";
import Home from "./pages/home/Home";
import Series from "./series/Series";

function App() {
  const navigate = useNavigate();
  return (
    <>
      <header>
        
<NavLink
  to="/profiles"
  className="logo-link"
  onClick={() => {
    localStorage.removeItem("activeProfile");
  }}
>
  <h1 className="logo">StreamFlix</h1>
</NavLink>


 
        <nav>
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/profiles" onClick={() => { localStorage.removeItem("activeProfile");}}>
  Home
</NavLink>

        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/create" element={<CreateAccount />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/home" element={<Home />} />
          <Route path="/series/:seriesId" element={<Series />} />

        </Routes>
      </main>
   </>
  );
}

export default App;
