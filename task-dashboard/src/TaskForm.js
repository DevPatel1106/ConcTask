import React, { useState } from 'react';
import axios from 'axios';

const TaskForm = ({ onTaskAdded }) => {
  const [name, setName] = useState('');
  const [delay, setDelay] = useState(5); // default 5 seconds
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Task name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/tasks', {
        name,
        delay: delay * 1000 // convert seconds to ms
      });

      // Call parent callback to refresh tasks list
      if (onTaskAdded) onTaskAdded(response.data);

      // Reset form
      setName('');
      setDelay(5);
    } catch (err) {
      console.error(err);
      setError('Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <div>
        <label>Task Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter task name"
          style={{ marginLeft: '10px' }}
        />
      </div>
      <div style={{ marginTop: '10px' }}>
        <label>Delay (seconds):</label>
        <input
          type="number"
          value={delay}
          min="0"
          onChange={(e) => setDelay(Number(e.target.value))}
          style={{ marginLeft: '10px' }}
        />
      </div>
      {error && <div style={{ color: 'red', marginTop: '5px' }}>{error}</div>}
      <button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
        {loading ? 'Adding...' : 'Add Task'}
      </button>
    </form>
  );
};

export default TaskForm;
