import { ArrowLeft, Smartphone, LayoutDashboard, CreditCard, PieChart, FileText, Bell, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';

export const Features = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <LayoutDashboard size={32} />,
            title: "Smart Dashboard",
            desc: "Get an instant overview of your finances with real-time balance tracking, income/expense summaries, and recent activity."
        },
        {
            icon: <CreditCard size={32} />,
            title: "Transaction Management",
            desc: "Easily add, edit, and categorize transactions. Support for multiple accounts (Bank, Cash, Wallet) and transfer tracking."
        },
        {
            icon: <PieChart size={32} />,
            title: "Budget Tracking",
            desc: "Set monthly spending limits for specific categories. Visual progress bars turn red when you exceed your budget."
        },
        {
            icon: <Bell size={32} />,
            title: "Smart Notifications",
            desc: "Receive real-time alerts when you're approaching or exceeding your budget limits. Never overspend unknowingly again."
        },
        {
            icon: <FileText size={32} />,
            title: "Reports & Exports",
            desc: "Generate professional monthly PDF reports or export your data to CSV for analysis in Excel or Google Sheets."
        },
        {
            icon: <Moon size={32} />,
            title: "Dark Mode",
            desc: "Easy on the eyes day or night. Switch seamlessly between light and dark themes with a single tap."
        },
        {
            icon: <Smartphone size={32} />,
            title: "Mobile Ready",
            desc: "Fully responsive design that works perfectly on your phone, tablet, or desktop. Manage your money on the go."
        }
    ];

    return (
        <MainLayout>
            <div className="features-container">
                <div className="back-link" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={18} /> Back to Dashboard
                </div>

                <div className="header-section">
                    <h1>Features Overview</h1>
                    <p>Explore what makes Budget Tracker powerful.</p>
                </div>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">
                                {feature.icon}
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="cta-section">
                    <h2>Ready to take control?</h2>
                    <button className="primary-btn" onClick={() => navigate('/dashboard')}>
                        Go to Dashboard
                    </button>
                </div>
            </div>

            <style>{`
        .features-container {
            max-width: 1000px;
            margin: 0 auto;
        }

        .back-link {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 2rem;
            cursor: pointer;
            color: hsl(var(--text-muted));
            font-weight: 500;
        }
        .back-link:hover { color: hsl(var(--primary)); }

        .header-section {
            text-align: center;
            margin-bottom: 3rem;
        }

        .header-section h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary-dark)));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .header-section p {
            font-size: 1.1rem;
            color: hsl(var(--text-muted));
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 4rem;
        }

        .feature-card {
            background: hsl(var(--surface));
            padding: 2rem;
            border-radius: var(--radius);
            border: 1px solid var(--border);
            transition: transform 0.2s, box-shadow 0.2s;
            text-align: center;
        }

        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-md);
            border-color: hsl(var(--primary-light));
        }

        .feature-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: hsl(var(--primary-light));
            color: hsl(var(--primary));
            margin-bottom: 1.5rem;
        }
        
        .feature-card h3 {
            font-size: 1.25rem;
            margin-bottom: 0.75rem;
        }
        
        .feature-card p {
            color: hsl(var(--text-muted));
            font-size: 0.95rem;
            line-height: 1.6;
        }

        .cta-section {
            text-align: center;
            background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-dark)));
            padding: 3rem;
            border-radius: var(--radius);
            color: white;
            box-shadow: var(--shadow-lg);
        }
        
        .cta-section h2 {
            color: white;
            margin-bottom: 1.5rem;
            font-size: 1.75rem;
        }
        
        .primary-btn {
            background: white;
            color: hsl(var(--primary));
            padding: 0.75rem 2rem;
            border-radius: 99px;
            font-weight: 700;
            font-size: 1.1rem;
            transition: opacity 0.2s;
        }
        
        .primary-btn:hover {
            opacity: 0.9;
        }
      `}</style>
        </MainLayout>
    );
};
