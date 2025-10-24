const sqlite3 = require("sqlite3").verbose();
const path = require("path");

//Database file path
const dbPath = path.resolve(__dirname, "tasks.db");

//Open Db (will create if not exists)
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

//Create tasks table if not exists
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        name TEXT,
        status TEXT,
        createdAt TEXT,
        scheduledFor TEXT,
        startedAt TEXT,
        completedAt TEXT,
        error TEXT,
        retryCount INTEGER DEFAULT 0,
        maxRetries INTEGER DEFAULT 3,
        retryDelay INTEGER DEFAULT 1000,
        priority INTEGER DEFAULT 5,
        recurringInterval INTEGER DEFAULT NULL,
        recurringId TEXT DEFAULT NULL
    )
  `
  );
});

function addTask(task) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO tasks (
        id, name, status, createdAt, scheduledFor,
        startedAt, completedAt, error,
        retryCount, maxRetries, retryDelay, priority, recurringInterval, recurringId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

     stmt.run(
      task.id,
      task.name,
      task.status,
      task.createdAt,
      task.scheduledFor,
      task.startedAt || null,
      task.completedAt || null,
      task.error || null,
      task.retryCount ?? 0,
      task.maxRetries ?? 3,
      task.retryDelay ?? 1000,
      task.priority ?? 5,
      task.recurringInterval ?? null,
      task.recurringId ?? null,
      function (err) {
        if (err) reject(err);
        else resolve(task);
      }
    );

    stmt.finalize();
  });
}

function getTask(id) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM tasks WHERE id = ?`, [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function getAllTasks() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM tasks ORDER BY createdAt ASC`, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function updateTask(id, updates) {
  const keys = Object.keys(updates);
  const values = Object.values(updates);

  const setString = keys.map((k) => `${k} = ?`).join(", ");

  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE tasks SET ${setString} WHERE id = ?`,
      [...values, id],
      function (err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

function deleteTask(id) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM tasks WHERE id = ?`, [id], function (err) {
      if (err) reject(err);
      else resolve(this.changes > 0);
    });
  });
}

function deleteTasksByRecurringId(recurringId) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM tasks WHERE recurringId = ? OR id = ?`,
      [recurringId, recurringId],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      }
    );
  });
}


// Export functions
module.exports = {
  addTask,
  getTask,
  getAllTasks,
  updateTask,
  deleteTask,
  deleteTasksByRecurringId
};
