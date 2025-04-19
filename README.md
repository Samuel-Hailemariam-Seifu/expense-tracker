

```markdown
# 💸 Expense Tracker App

A modern, responsive, and feature-rich expense tracking application built with **React**, **Chart.js**, and **Tailwind CSS**. Track your daily expenses, analyze spending habits with interactive charts, and even convert currencies in real time.

---

## ✨ Features

- 📊 **Data Visualization** – Track expenses over time and by category with **line** and **doughnut** charts.
- 🌍 **Currency Conversion** – Instantly switch between popular currencies like USD, EUR, GBP, JPY, and INR using real-time exchange rates.
- 💾 **LocalStorage Support** – Persist expenses and settings across sessions.
- 🧾 **Expense Management** – Add, edit, and delete expense entries with ease.
- 📆 **Time Filters** – Filter data by week, month, or year.
- 📱 **Responsive Design** – Optimized for mobile and desktop views.

---

## 🚀 Tech Stack

- **Frontend**: React, Tailwind CSS
- **Charts**: Chart.js, react-chartjs-2
- **Currency API**: [exchangerate.host](https://exchangerate.host)

---

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Samuel-Hailemariam-Seifu/expense-tracker.git
   cd expense-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

The app will be available at `http://localhost:3000`.

---

## 🛠 Project Structure

```
src/
│
├── components/
│   ├── EditExpenseModal.js
│   ├── ExpenseCharts.js
│   ├── CurrencySelector.js
│   └── TabView.js
│
├── hooks/
│   └── useCurrencyConverter.js
│
├── App.js
├── App.css
└── index.js
```

---

## 📷 Screenshots

<!-- Add your screenshots here -->
![Dashboard Screenshot: Analytics](./src/assets/screenshot-1.png)
![Dashboard Screenshot: Expense List](./src/assets/screenshot-2.png)
![Dashboard Screenshot: Expense Summary](./src/assets/screenshot-3.png)
![Dashboard Screenshot: Add Expense](./src/assets/screenshot-4.png)
![Dashboard Screenshot: Update Expense](./src/assets/screenshot-5.png)


---


## 🙌 Contributing

Pull requests are welcome!  
For major changes, please open an issue first to discuss what you'd like to change.
