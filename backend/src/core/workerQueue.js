const async = require("async");
const executor = require("./executor");
const store = require("../storage/inMemoryStore");

let io = null; // will be set from main.js

function setSocket(socketInstance) {
  io = socketInstance;
}

const workerQueue = async.queue(async (task) => {
  try {
    store.updateTask(task.id, {
      status: "running",
      startedAt: new Date().toISOString(),
    });
    console.log("Worker picked up task:", task.id);

    // if (io) io.emit("task:added", store.getTask(task.id));

    await executor.executeTask(task);

    //mark completed
    store.updateTask(task.id, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });
    console.log(`Completed task: ${task.id}`);

    if(io) io.emit("task:updated", store.getTask(task.id));

  } catch (err) {
    //mark failed
    store.updateTask(task.id, {
      status: "failed",
      error: err?.message || String(err),
      failedAt: new Date().toISOString(),
    });
    console.error(`Task ${task.id} failed:`, err);

    if(io) io.emit("task:updated", store.getTask(task.id));
  }
}, 5);

function scheduleTask(task, delay = 0) {
  setTimeout(() => {
    console.log("About to push task:", JSON.stringify(task));
    workerQueue.push(task, (err) => {
      if (err) console.error("Queue push error:", err);
    });
  }, delay);
}

module.exports = { workerQueue, scheduleTask, setSocket };
