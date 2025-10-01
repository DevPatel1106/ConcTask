
const tasks = {};

function addTask(task) {
  tasks[task.id] = task;
}   

function getTask(id) {
  return tasks[id] || null;
}

function getAllTasks() {
    return Object.values(tasks);
}

function updateTask(id, updates) {
    if (!tasks[id]) return null;
    tasks[id] = { ...tasks[id], ...updates };
    return tasks[id];
}

function deleteTask(id) {
    if (!tasks[id]) return false;
    delete tasks[id];
    return true;
}   

module.exports = {
    addTask,
    getTask,  
    getAllTasks,
    updateTask,
    deleteTask
};

