import React, { useState, useEffect } from "react";

import TaskTable from "./components/TaskTable";
import AddTaskForm from "./components/TaskForm";

import { getTasks, addTask, socket } from "./api";
// import socket from "./socket";
import MetricsPanel from "./components/MetricsPanel";

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [delay, setDelay] = useState(5);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    }

    fetchTasks();
    // WebSocket listeners
    socket.on("task:added", (newTask) => {
      setTasks((prev) => [...prev, newTask]);
    });
    socket.on("task:updated", (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
    });

    return () => {
      socket.off("task:added");
      socket.off("task:updated");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskName) return alert("Task name is required");
    try {
      await addTask({ name: taskName, delaySeconds: delay });
      setTaskName("");
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

return (
    <div className="container">
      <h1>Task Scheduler Dashboard</h1>

      {/* Task creation form */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task Name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Delay (seconds)"
          value={delay}
          onChange={(e) => setDelay(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>

      {/* Metrics panel */}
      <MetricsPanel tasks={tasks} />

      {/* Task table */}
      <TaskTable tasks={tasks} />
    </div>
  );
}

export default App;

// function App() {
//   const [tasks, setTasks] = useState([]);
//   const [name, setName] = useState("");
//   const [delay, setDelay] = useState(5);

//   // Fetch tasks from backend
//   const fetchTasks = async () => {
//     const res = await fetch("http://localhost:5000/api/tasks");
//     const data = await res.json();
//     setTasks(data);
//   };

//   useEffect(() => {
//     fetchTasks();
//     const interval = setInterval(fetchTasks, 3000); // auto-refresh every 3s
//     return () => clearInterval(interval);
//   }, []);

//   const addTask = async () => {
//     await fetch("http://localhost:5000/api/tasks", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ name, delay: delay * 1000 })
//     });
//     setName("");
//     setDelay(5);
//     fetchTasks();
//   };

//   return (
//     <div style={{ padding: "20px", fontFamily: "Arial" }}>
//       <h1>Task Scheduler Dashboard</h1>

//       <div style={{ marginBottom: "20px" }}>
//         <input
//           type="text"
//           placeholder="Enter task name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />
//         <input
//           type="number"
//           value={delay}
//           onChange={(e) => setDelay(Number(e.target.value))}
//           style={{ marginLeft: "10px" }}
//         />
//         <button onClick={addTask} style={{ marginLeft: "10px" }}>
//           Add Task
//         </button>
//       </div>

//       <ul>
//         {tasks.map((task) => (
//           <li key={task.id} style={{ marginBottom: "10px" }}>
//             <b>{task.name}</b> —
//             Created At: {new Date(task.createdAt).toLocaleString()} —
//             Scheduled For: {task.scheduledFor ? new Date(task.scheduledFor).toLocaleString() : "N/A"} —
//             <span
//               style={{
//                 fontWeight: "bold",
//                 color:
//                   task.status === "completed"
//                     ? "green"
//                     : task.status === "running"
//                     ? "blue"
//                     : task.status === "failed"
//                     ? "red"
//                     : "orange"
//               }}
//             >
//               {task.status}
//             </span>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default App;
