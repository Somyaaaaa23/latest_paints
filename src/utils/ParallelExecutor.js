// Parallel Executor - Run multiple agents simultaneously
export class ParallelExecutor {
  constructor() {
    this.executionLog = [];
  }

  // Execute multiple async functions in parallel
  async executeParallel(tasks) {
    const startTime = Date.now();
    console.log(`⚡ Parallel Execution: Starting ${tasks.length} tasks simultaneously...`);
    
    const taskPromises = tasks.map((task, index) => {
      const taskStart = Date.now();
      return task.fn().then(result => {
        const taskEnd = Date.now();
        const duration = taskEnd - taskStart;
        console.log(`  ✓ Task "${task.name}" completed in ${duration}ms`);
        return {
          name: task.name,
          result: result,
          duration: duration,
          success: true
        };
      }).catch(error => {
        const taskEnd = Date.now();
        const duration = taskEnd - taskStart;
        console.error(`  ✗ Task "${task.name}" failed after ${duration}ms:`, error);
        return {
          name: task.name,
          error: error.message,
          duration: duration,
          success: false
        };
      });
    });

    const results = await Promise.all(taskPromises);
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    const successCount = results.filter(r => r.success).length;
    console.log(`⚡ Parallel Execution: Completed ${successCount}/${tasks.length} tasks in ${totalDuration}ms`);
    
    // Calculate time saved vs sequential
    const sequentialTime = results.reduce((sum, r) => sum + r.duration, 0);
    const timeSaved = sequentialTime - totalDuration;
    const speedup = (sequentialTime / totalDuration).toFixed(2);
    
    console.log(`  ⏱️  Sequential would take: ${sequentialTime}ms`);
    console.log(`  ⚡ Parallel took: ${totalDuration}ms`);
    console.log(`  🚀 Time saved: ${timeSaved}ms (${speedup}x speedup)`);
    
    this.executionLog.push({
      timestamp: new Date().toISOString(),
      tasks: tasks.map(t => t.name),
      results: results,
      totalDuration: totalDuration,
      sequentialTime: sequentialTime,
      timeSaved: timeSaved,
      speedup: parseFloat(speedup)
    });
    
    return results;
  }

  // Get execution statistics
  getStatistics() {
    if (this.executionLog.length === 0) {
      return {
        totalExecutions: 0,
        avgSpeedup: 0,
        totalTimeSaved: 0
      };
    }

    const totalTimeSaved = this.executionLog.reduce((sum, log) => sum + log.timeSaved, 0);
    const avgSpeedup = this.executionLog.reduce((sum, log) => sum + log.speedup, 0) / this.executionLog.length;

    return {
      totalExecutions: this.executionLog.length,
      avgSpeedup: avgSpeedup.toFixed(2),
      totalTimeSaved: totalTimeSaved,
      totalTimeSavedSeconds: (totalTimeSaved / 1000).toFixed(1)
    };
  }

  // Clear execution log
  clearLog() {
    this.executionLog = [];
  }
}

// Create singleton instance
export const parallelExecutor = new ParallelExecutor();
