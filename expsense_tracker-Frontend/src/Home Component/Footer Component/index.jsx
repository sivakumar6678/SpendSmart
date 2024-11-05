import React from 'react';
import './Footer.css';

const FooterComponent = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <h3>About This Project</h3>
                <p>
                    The Expense Tracker helps you manage your finances efficiently. 
                    Track your income and expenses, categorize them, and view insightful reports.
                </p>
                <div className="footer-social">
                    <h4>Connect with Me:</h4>
                    <div className="social-links">
                        <a href="https://www.linkedin.com/in/sivakumar-chandragari" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                        <a href="https://github.com/sivakumar6678" target="_blank" rel="noopener noreferrer">GitHub</a>
                        <a href="https://www.instagram.com/sivakumar_csk66/" target="_blank" rel="noopener noreferrer">Instagram</a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} SIVA KUMAR. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default FooterComponent;
