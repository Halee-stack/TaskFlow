import { useState } from "react";

function Login({ onLogin, onCreateAccount }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const response = await fetch("https://taskflow-backend-jkxj.onrender.com/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                onLogin(data.token);

            } else {
                alert(data.message || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Unable to connect to the backend");
        }
    };
    return (
        <div className="login">
            <h2>Welcome Back</h2>
            <p>Log in to your TaskFlow account</p>

            <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleLogin}>Log In</button>
            <p>
                Don't have an account?
                <button type="button" onClick={onCreateAccount}>
                    Create Account
                </button>
            </p>
        </div>
    );
}

export default Login;