import React, { useState } from "react";
import axios from "axios";
import { addTask } from "../api";

export default function TaskForm({ onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    // command: "",
    delaySeconds: 5,
    priority: 5,
    recurringInterval: 0,
    maxRetries: 3,
    retryDelay: 3000,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "name" ? value : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Task name is required");
      return;
    }
    try {
      // Send to backend
      await addTask(form);
      if (onSubmit) onSubmit(form);

      // Reset form
      setForm({
        name: "",
        delaySeconds: 5,
        priority: 5,
        recurringInterval: 0,
        maxRetries: 3,
        retryDelay: 3000,
      });
    } catch (err) {
      console.error("Failed to add task:", err);
      alert("Error creating task");
    }
  };

  return (
    <form
      className="flex flex-col gap-3 bg-white shadow p-4 rounded-xl max-w-md"
      onSubmit={handleSubmit}
    >
      <h2 className="text-xl font-semibold">Add New Task</h2>

      <input
        type="text"
        name="name"
        placeholder="Task Name"
        value={form.name}
        onChange={handleChange}
        className="border p-2 rounded"
        required
      />

      <label>Delay (seconds)</label>
      <input
        type="number"
        name="delaySeconds"
        min="0"
        value={form.delaySeconds}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      {/* <input
        type="text"
        name="command"
        placeholder="Command / Script"
        value={form.command}
        onChange={handleChange}
        className="border p-2 rounded"
        required
      /> */}

      <button
        type="button"
        className="text-blue-600 underline text-sm self-start"
        onClick={() => setShowAdvanced((prev) => !prev)}
      >
        {showAdvanced ? "Hide Advanced Options ▲" : "Show Advanced Options ▼"}
      </button>

      {showAdvanced && (
        <div className="flex flex-col gap-2 mt-2">
          <label>Priority (1 = High, 10 = Low)</label>
          <input
            type="number"
            name="priority"
            min="1"
            max="10"
            value={form.priority}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <label>Recurring Interval (seconds)</label>
          <input
            type="number"
            name="recurringInterval"
            min="0"
            value={form.recurringInterval}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <label>Max Retries</label>
          <input
            type="number"
            name="maxRetries"
            min="0"
            value={form.maxRetries}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <label>Retry Delay (ms)</label>
          <input
            type="number"
            name="retryDelay"
            min="0"
            value={form.retryDelay}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>
      )}

      <button
        type="submit"
        className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
      >
        Create Task
      </button>
    </form>
  );
}

// export default function AddTaskForm() {
//   const [name, setName] = useState("");
//   const [delay, setDelay] = useState(0);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     // if (!name) return;

//     await addTask({ name, delay: parseInt(delay) || 0 });

//     setName("");
//     setDelay(0);
//   };

//   return (
//     <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
//       <input
//         type="text"
//         placeholder="Task Name"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//       />
//       <input
//         type="number"
//         placeholder="Delay (ms)"
//         value={delay}
//         onChange={(e) => setDelay(e.target.value)}
//         style={{ marginLeft: "10px" }}
//       />
//       <button type="submit" style={{ marginLeft: "10px" }}>
//         Add Task
//       </button>
//     </form>
//   );
// }

// const TaskForm = ({ onTaskAdded }) => {
//   const [name, setName] = useState('');
//   const [delay, setDelay] = useState(5); // default 5 seconds
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!name.trim()) {
//       setError('Task name is required');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const response = await axios.post('http://localhost:5000/api/tasks', {
//         name,
//         delay: delay * 1000 // convert seconds to ms
//       });

//       // Call parent callback to refresh tasks list
//       if (onTaskAdded) onTaskAdded(response.data);

//       // Reset form
//       setName('');
//       setDelay(5);
//     } catch (err) {
//       console.error(err);
//       setError('Failed to add task');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
//       <div>
//         <label>Task Name:</label>
//         <input
//           type="text"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           required
//           placeholder="Enter task name"
//           style={{ marginLeft: '10px' }}
//         />
//       </div>
//       <div style={{ marginTop: '10px' }}>
//         <label>Delay (seconds):</label>
//         <input
//           type="number"
//           value={delay}
//           min="0"
//           onChange={(e) => setDelay(Number(e.target.value))}
//           style={{ marginLeft: '10px' }}
//         />
//       </div>
//       {error && <div style={{ color: 'red', marginTop: '5px' }}>{error}</div>}
//       <button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
//         {loading ? 'Adding...' : 'Add Task'}
//       </button>
//     </form>
//   );
// };

// export default TaskForm;
