import type { ReactNode } from 'react';
import { Wallet, LogOut } from 'lucide-react';

interface MainLayoutProps {
    children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-content">
                    <div className="logo-section">
                        <Wallet className="logo-icon" size={28} />
                        <h1>Expense Tracker</h1>
                    </div>
                    <nav className="nav-actions">
                        <button className="icon-button" title="Logout">
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

        .logo-section h1 {
          font-size: 1.25rem;
          font-weight: 700;
          color: hsl(var(--text-main));
        }

        .nav-actions {
          display: flex;
          gap: 1rem;
        }

        .icon-button {
          padding: 0.5rem;
          border-radius: var(--radius);
          color: hsl(var(--text-muted));
          transition: all 0.2s;
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
          .main-content {
            padding: 1rem;
          }
        }
      `}</style>
        </div>
    );
};
