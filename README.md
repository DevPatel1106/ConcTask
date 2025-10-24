# 🕒 Task Scheduler Dashboard

A robust **Task Scheduling System** built with **Node.js (Express)**, **React**, and **SQLite**, demonstrating modern concepts in **asynchronous programming, concurrency control, and real-time task monitoring**.  

Users can create tasks with delays, track their execution in real time, and view lifecycle transitions (`pending → running → completed → failed`) through an intuitive Material UI dashboard.

---

## ✨ Features
- ✅ Create and schedule tasks with configurable delays.
- ✅ Real-time dashboard updates for task status.
- ✅ Task lifecycle tracking: **pending**, **running**, **completed**, **failed**.
- ✅ Persistent storage using **SQLite**.
- ✅ Concurrency handled efficiently via worker queues.
- ✅ Modern and responsive UI built with **Material UI**.

---

## 🛠 Tech Stack
- **Backend:** Node.js, Express, Async.js, SQLite  
- **Frontend:** React (Hooks, Fetch API, Material UI)  
- **Architecture:** RESTful API + Dynamic Task Queue  

---


## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/task-dashboard.git
cd task-dashboard
```

### 2️⃣ Install Dependencies
For backend and frontend:

```bash
Copy code
npm install
```

### 3️⃣ Run Backend Server
```bash
node server.js
```

### 4️⃣ Start React Frontend
```bash
npm start
```

Then open http://localhost:3000
 in your browser.

---

## 📂 Folder Structure

```pgsql
taskschedular/
│
├── backend/
│    │
│    ├── src/
│    │    ├── api/
│    │    │    └── routes.js
│    │    ├── core/
│    │    │    ├── executor.js
│    │    │    └── workerQueue.js
│    │    ├── storage/
│    │    │    ├── inMemoryStore.js
│    │    │    ├── insqliteStore.js
│    │    │    └── tasks.db
│    │    └── main.js
│    └── package.json
│
├── task-dashboard/
│   ├── src/
│   │   ├── components/
│   │   ├── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🧠 Concepts Demonstrated

Asynchronous Task Execution

Concurrent Processing with Worker Queues

RESTful API Design

Real-Time UI State Updates

Persistent Task Storage (SQLite)

---

## 💡 Future Enhancements

Add task prioritization and filtering.

Integrate user authentication and roles.

Add analytics dashboard (task success rate, avg delay, etc.).

Enable distributed task queue via Redis.

---

## 🧰 Developer Notes

This project was bootstrapped with Create React App.

Available scripts:
```bash
npm start      # Start frontend
npm run build  # Build for production
npm test       # Run tests
```

For more advanced configuration, refer to the CRA Documentation.