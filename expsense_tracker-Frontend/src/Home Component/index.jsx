import FooterComponent from "./Footer Component";
import HeaderComponent from "./Header Component";
import './Home.css';

function HomeComponent() {



    return ( 
        <div>
            <HeaderComponent />
             
            {/* Home Section */}
            <div className="home">
                <p className="homepara">
                    Welcome to Expense Mate! This platform helps you manage your finances by tracking your expenses and income. 
                    You can categorize spending, set budgets, and view detailed reports to better understand your financial habits.
                    Start managing your money more effectively today!
                </p>
            </div>

            {/* About Section */}
            <div className="about">
                <h2>About the SpendSmart</h2>
                <div className="card-container">
                    <div className="card">
                        <h3>User Management</h3>
                        <p>Register, login, and manage your profile securely. Reset your password anytime.</p>
                    </div>
                    <div className="card">
                        <h3>Manage Income</h3>
                        <p>Add various income types like salary, gifts, and bonuses. Categorize your earnings effortlessly.</p>
                    </div>
                    <div className="card">
                        <h3>Track Expenses</h3>
                        <p>Monitor your spending on categories like food, travel, and entertainment. Stay within your budget.</p>
                    </div>
                    <div className="card">
                        <h3>Detailed Reports</h3>
                        <p>Get insights into your financial habits with easy-to-understand charts and reports.</p>
                    </div>
                </div>
            </div>


            <FooterComponent />
        </div>
    );
}

export default HomeComponent;