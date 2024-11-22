---

# SpendSmart

SpendSmart is a simple yet effective expense tracker application designed to help users manage their income and expenses efficiently. This project is developed as a mini-project for a college internship review, with plans for future enhancements and deployment.

## Features

- **User Profile**: Displays user details including name, profile picture, email, and account balance.
- **Income and Expense Tracking**: Add, filter, and view recent income and expense transactions.
- **Dashboard**: Overview of income and expenses displayed in a full-page format.
- **Sidebar Navigation**: Easy access to sections like Profile, Dashboard, Income, Expenses, Logout, and Categories.
- **Future-Ready Design**: Basic settings and reports features planned for future implementation.

## Project Structure

The repository is divided into the following sections:

- **Frontend**: Developed using React for dynamic and user-friendly UI.
- **Backend**: Powered by Flask-SQLAlchemy with MySQL for database integration.
- **Virtual Environment**: Located in `~/Documents/Projects/spendsmart/expense_tracker_backend/venv`.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js and npm
- Python 3.x
- MySQL
- Virtual Environment (optional)

### Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/sivakumar6678/SpendSmart.git
   cd SpendSmart
   ```

2. **Setup Backend**:
   - Navigate to the backend directory:
     ```bash
     cd expense_tracker_backend
     ```
   - Activate the virtual environment:
     ```bash
     source venv/bin/activate
     ```
   - Install Python dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Configure the MySQL database connection in the `config.py` file.
   - Run the Flask server:
     ```bash
     flask run
     ```

3. **Setup Frontend**:
   - Navigate to the frontend directory:
     ```bash
     cd ../expense_tracker_frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the React development server:
     ```bash
     npm start
     ```

4. **Access the Application**:
   Open the app in your browser at `http://localhost:3000`.

## Future Enhancements

- Deployment on a cloud platform.
- Advanced analytics and reports.
- Enhanced security features.
- Offline mode for attendance marking.

## Project Screenshots

Include screenshots of key features, such as:

- **Signup Screen**  
![Signup Screen](link-to-signup-screen-image)

- **Dashboard View**  
![Dashboard](link-to-dashboard-image)

## Technologies Used

### Frontend:
- React.js
- CSS

### Backend:
- Flask
- Flask-SQLAlchemy
- MySQL

## Contribution Guidelines

Contributions are welcome! Follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

Developed by **Chandragari Sivakumar**.  
Feel free to reach out at [chandragarisivakumar@gmail.com](mailto:chandragarisivakumar@gmail.com) for queries or feedback.

---

