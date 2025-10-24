// const store = require('../storage/inMemoryStore');

// Only simulate task execution, do NOT update store here

function executeTask(task) {
  return new Promise((resolve) => {
    console.log(`Executing task: ${task.id} at ${new Date().toISOString()}`);

    // Simulate async work
    setTimeout(() => {
      // Randomly simulate a failure for testing retry mechanism
      const fail = Math.random() < (task.failChance || 0); // failChance default 0
      if (fail) {
        reject(new Error(`Simulated failure for task ${task.id}`));
      } else {
        console.log(`Completed task: ${task.id}`);
        resolve();
      }
    }, task.duration || 4000); // task.duration optional for testing
  });
}

module.exports = { executeTask };
