import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import '../styles/Form.css';
import LoadingIndicator from "./LoadingIndicator";
import { checkPasswordStrength } from '../utils/passwordUtils';

function Form({ route, method }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(null);
    const navigate = useNavigate();

    const name = method === "login" ? "LOGIN" : "REGISTER";

    // Effect to check password strength when password changes
    useEffect(() => {
        if (password) {
            setPasswordStrength(checkPasswordStrength(password));
        } else {
            setPasswordStrength(null);
        }
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (method === "register") {
            // Check password strength before submission
            if (passwordStrength && passwordStrength.strength <= 2) {
                setError("Password is too weak. Please strengthen your password.");
                return;
            }
            
            if (password !== confirmPassword) {
                setError("Passwords don't match");
                return;
            }
        }
    
        setLoading(true);
        setError('');
    
        try {
            const res = await api.post(route, { username, password });
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate('/');
            } else {
                navigate('/login');
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    // Helper function to determine strength color
    const getStrengthColor = () => {
        if (!passwordStrength) return 'transparent';
        switch (passwordStrength.strengthLevel) {
            case 'Weak': return '#ff4d4d';
            case 'Medium': return '#ffa500';
            case 'Strong': return '#4CAF50';
            default: return 'transparent';
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>
            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            
            {/* Password strength indicator - only shown for register and when typing */}
            {method === "register" && password && (
                <div className="password-strength-container">
                    <div className="password-strength-bar">
                        <div 
                            className="password-strength-fill"
                            style={{
                                width: `${passwordStrength ? (passwordStrength.strength / 5) * 100 : 0}%`,
                                backgroundColor: getStrengthColor()
                            }}
                        ></div>
                    </div>
                    <div className="password-strength-text">
                        Strength: {passwordStrength?.strengthLevel || 'None'}
                    </div>
                    {passwordStrength && passwordStrength.messages.length > 0 && (
                        <ul className="password-strength-messages">
                            {passwordStrength.messages.map((msg, index) => (
                                <li key={index}>{msg}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            
            {method === "register" && (
                <input
                    className="form-input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                />
            )}
            {loading && <LoadingIndicator />}
            <button className="form-button" type="submit">
                {name}
            </button>
            {error && <div className="form-error">{error}</div>}
            <div className="form-footer">
                {method === "login" ? (
                    <p>
                        Don't have an account? <Link to="/register">Register here</Link>.
                    </p>
                ) : (
                    <p>
                        Already have an account? <Link to="/login">Sign In</Link>.
                    </p>
                )}
            </div>
        </form>
    );
}

export default Form;