import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import axios from 'axios'
import './login.css'

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [backendResponse, setBackendResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

 const handleLogin = async () => {
  setErrorMessage("");
  setBackendResponse(null);

  try {
    const res = await axios.post("http://localhost:3000/account/login", {
      email,
      password
    });

    setBackendResponse(res.data);

    // SAVE ACCOUNT ID
    localStorage.setItem("account_id", res.data.account_id);

    // REDIRECT
    window.location.href = "/profiles";

  } catch (error) {
    const msg = error.response?.data?.message || "Login failed";
    setErrorMessage(msg);
  }
};


  return (
    <section className='login-form'>

      <label htmlFor="email">Email:</label>
      <input 
        type="text" 
        id="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="password">Password</label>
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Log in</button>
      <NavLink to="/create" >need an account?</NavLink>

      {errorMessage && (
        <p className="error-box">{errorMessage}</p>
      )}

      {backendResponse && (
        <div className="console-box">
          <h3>Backend Response</h3>
          <pre>{JSON.stringify(backendResponse, null, 2)}</pre>
        </div>
      )}

    </section>
  );
}
