# FinanceSync - Mobile-First Finance Dashboard

FinanceSync is a modern, mobile-optimized personal finance dashboard designed to help users track expenses, income, subscriptions, and savings goals. It features a sleek dark mode UI, real-time data persistence with Firebase, and a responsive design that feels like a native app.

![Dashboard Preview](https://via.placeholder.com/800x400?text=FinanceSync+Dashboard+Preview)

## 🚀 Features

*   **Dashboard Overview**: Visualize your net worth, total income, and expenses with interactive charts.
*   **Transaction Management**: Easily add, edit, and delete expenses and income records.
*   **Subscription Tracker**: Keep track of recurring subscriptions and calculate monthly costs.
*   **Savings Goals**: Set and monitor progress towards your financial goals.
*   **User Profiles**: customizable profile with picture upload, bio, and job title.
*   **Multi-Currency Support**: Switch between USD, EUR, GBP, JPY, INR, LKR, AUD, and CAD.
*   **Secure Authentication**: Google Sign-In powered by Firebase Auth.
*   **Cloud Sync**: All data is securely stored in Firestore and syncs across devices.

## 🛠️ Tech Stack

*   **Frontend**: React.js, Vite
*   **Styling**: Tailwind CSS (Dark Mode optimized)
*   **Icons**: Lucide React
*   **Charts**: Recharts
*   **Backend / Serverless**: Google Firebase (Auth, Firestore, Storage)
*   **Deployment**: Vercel

## ⚙️ Setup & Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/SandunPahasara/mobile-finance-dashboard.git
    cd mobile-finance-dashboard
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory and add your Firebase credentials:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
    ```

4.  **Run Local Server**
    ```bash
    npm run dev
    ```

## 📱 Mobile Optimization

This dashboard is built with a "Mobile-First" approach. On desktop, it simulates a mobile view within a centered container, while on actual mobile devices, it spans the full width for a native experience.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
