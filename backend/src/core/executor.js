const store = require('../storage/inMemoryStore');

function executeTask(task) {
  return new Promise((resolve) => {
    console.log(`Executing task: ${task.id} at ${new Date().toISOString()}`);

    // Mark as in-progress in store
    store.updateTask(task.id, { status: 'in-progress', startedAt: new Date().toISOString() });

    setTimeout(() => {
      // Mark as completed in store
      store.updateTask(task.id, { status: 'completed', completedAt: new Date().toISOString() });
      console.log(`Completed task: ${task.id}`);
      resolve();
    }, 1000); // simulate task duration
  });
}

module.exports = { executeTask };
