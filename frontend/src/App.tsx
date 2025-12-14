import {
  Routes,
  Route,
  NavLink,
  useNavigate,
} from "react-router-dom";
import "./App.css";

import Login from "./pages/login/Login";
import CreateAccount from "./pages/createaccount/CreateAccount";
import Profiles from "./pages/profiles/Profiles";
import Home from "./pages/home/Home";
import Series from "./series/Series";
import Account from "./pages/account/Account";
import ResetPassword from "./pages/resetpassword/ResetPassword";

function App() {
  const navigate = useNavigate();

  // ✅ session-based login check
  const accountId = sessionStorage.getItem("account_id");

  const handleGoProfiles = () => {
    sessionStorage.removeItem("activeProfile");
    navigate("/profiles");
  };

  return (
    <>
      <header>
        {/* LOGO */}
        <h1
          className="logo"
          style={{ cursor: "pointer" }}
          onClick={handleGoProfiles}
        >
          StreamFlix
        </h1>

        {/* NAV */}
        <nav>
           <NavLink to="/profiles">Home</NavLink>
          {!accountId ? (
            // ❌ NOT LOGGED IN
            <NavLink to="/login">Login</NavLink>
          ) : (
            // ✅ LOGGED IN
            <NavLink
              to="/account"
              
            >
              Account
            </NavLink>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/create" element={<CreateAccount />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/home" element={<Home />} />
          <Route path="/series/:seriesId" element={<Series />} />
          <Route path="/account" element={<Account />}/>
          <Route path="/resetpassword" element={<ResetPassword />}/>
        </Routes>
      </main>
    </>
  );
}

export default App;
