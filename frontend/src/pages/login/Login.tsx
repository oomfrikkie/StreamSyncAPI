import { useState } from 'react'
import axios from 'axios'
import './login.css'

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:3000/account/login", {
        email,
        password
      });

      alert("Logged in!");

    } catch (error) {
      console.error(error);

      // get real backend message if available
      const msg = error.response?.data?.message || "Login failed";

      alert(msg);
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
    </section>
  );
}
