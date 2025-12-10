import { useState } from 'react'
import axios from 'axios'
import './create.css'

export default function CreateAccount() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [backendResponse, setBackendResponse] = useState(null);
  const [token, setToken] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [verifiedMessage, setVerifiedMessage] = useState("");

  const handleRegister = async () => {
    setErrorMessage("");
    setBackendResponse(null);
    setVerifiedMessage("");

    try {
      const res = await axios.post("http://localhost:3000/account/register", {
        email,
        password
      });

      setBackendResponse(res.data);
      setToken(res.data.verification_token);

    } catch (err) {
      let msg = "Registration failed";

      if (err.response?.data?.message) {
        // Backend returns clear message
        msg = err.response.data.message;
      }

      setErrorMessage(msg);
    }
  };

  const handleVerify = async () => {
    if (!token) return;

    try {
      const res = await axios.get(`http://localhost:3000/account/verify/${token}`);
      setVerifiedMessage(res.data.message);

    } catch (err) {
      let msg = "Verification failed";

      if (err.response?.data?.message) {
        msg = err.response.data.message;
      }

      setVerifiedMessage(msg);
    }
  };

  return (
    <section className='create-form'>

      {/* Input fields */}
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

      <button onClick={handleRegister}>Create Account</button>

      {/* Error Display */}
      {errorMessage && (
        <p className="error-box">{errorMessage}</p>
      )}

      {/* Backend Response UI */}
      {backendResponse && (
        <div className="console-box">
          <h3>Backend Response</h3>
          <pre>{JSON.stringify(backendResponse, null, 2)}</pre>

          <p><b>Token:</b> {token}</p>

          <button onClick={handleVerify}>Verify Account</button>

          {verifiedMessage && (
            <p className="verified-msg">{verifiedMessage}</p>
          )}
        </div>
      )}
    </section>
  );
}
