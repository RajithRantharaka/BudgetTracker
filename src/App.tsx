import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Accounts } from './pages/Accounts';
import { Features } from './pages/Features';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/features" element={<Features />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </HashRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
