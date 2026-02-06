import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, LogOut, User, Sun, Moon, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationCenter } from '../components/NotificationCenter';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <Wallet className="logo-icon" size={28} />
            <h1>Expense Tracker</h1>
          </div>
          <nav className="nav-actions">
            {user && (
              <>
                <div className="user-welcome">
                  <span className="user-name">{user.user_metadata?.full_name || 'User'}</span>
                </div>
                <Link to="/accounts" className="icon-button" title="Accounts">
                  <Wallet size={20} />
                </Link>
                <Link to="/profile" className="icon-button" title="Profile">
                  <User size={20} />
                </Link>
                <Link to="/features" className="icon-button" title="New Features">
                  <HelpCircle size={20} />
                </Link>
              </>
            )}
            {user && <NotificationCenter />}
            <button className="icon-button" title="Toggle Theme" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="icon-button" title="Logout" onClick={signOut}>
              <LogOut size={20} />
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <style>{`
        .app-container {
          min-height: 100vh;
          background-color: hsl(var(--background));
          display: flex;
          flex-direction: column;
        }

        .app-header {
          background-color: hsl(var(--surface));
          border-bottom: 1px solid hsl(var(--border));
          position: sticky;
          top: 0;
          z-index: 10;
          box-shadow: var(--shadow-sm);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: hsl(var(--primary));
        }
        
        .user-welcome {
          display: flex;
          align-items: center;
          font-size: 0.9rem;
          color: hsl(var(--text-muted));
          margin-right: 0.5rem;
        }
        
        .user-name {
          font-weight: 600;
          color: hsl(var(--text-main));
          margin-left: 0.25rem;
        }

        .logo-section h1 {
          font-size: 1.25rem;
          font-weight: 700;
          color: hsl(var(--text-main));
        }

        .nav-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .icon-button {
          padding: 0.5rem;
          border-radius: var(--radius);
          color: hsl(var(--text-muted));
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          cursor: pointer;
        }

        .icon-button:hover {
          background-color: hsl(var(--primary-light));
          color: hsl(var(--primary));
        }

        .main-content {
          flex: 1;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 2rem;
        }

        @media (max-width: 768px) {
          .header-content {
            padding: 1rem;
          }
          
          .main-content {
            padding: 1rem;
            padding-bottom: 5rem; /* Add space for FAB */
          }
          
          .logo-section h1 {
             display: none; /* Hide text on small screens */
          }
          
          .user-name {
              display: none; /* Hide name on mobile */
          }
        }
      `}</style>
    </div>
  );
};
