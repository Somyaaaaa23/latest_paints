// Audit Logger - Complete transparency and traceability
export class AuditLogger {
  constructor() {
    this.logs = [];
  }
  
  logAgentAction(agentName, action, data, reasoning) {
    const entry = {
      timestamp: new Date().toISOString(),
      agent: agentName,
      action: action,
      data: data,
      reasoning: reasoning,
      id: `LOG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.logs.push(entry);
    console.log(`[AUDIT] ${agentName}: ${action}`, reasoning);
    
    return entry;
  }
  
  getAuditTrail(rfpId) {
    return this.logs.filter(log => log.data?.rfpId === rfpId);
  }
  
  getAllLogs() {
    return this.logs;
  }
  
  getLogsByAgent(agentName) {
    return this.logs.filter(log => log.agent === agentName);
  }
  
  exportAuditReport(rfpId) {
    const trail = this.getAuditTrail(rfpId);
    return {
      rfpId: rfpId,
      totalActions: trail.length,
      timeline: trail,
      summary: this.generateSummary(trail)
    };
  }
  
  generateSummary(trail) {
    const agentActions = {};
    trail.forEach(log => {
      if (!agentActions[log.agent]) {
        agentActions[log.agent] = [];
      }
      agentActions[log.agent].push(log.action);
    });
    
    return {
      totalSteps: trail.length,
      agentBreakdown: agentActions,
      startTime: trail[0]?.timestamp,
      endTime: trail[trail.length - 1]?.timestamp,
      duration: this.calculateDuration(trail[0]?.timestamp, trail[trail.length - 1]?.timestamp)
    };
  }
  
  calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return 'N/A';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const seconds = Math.floor(durationMs / 1000);
    return `${seconds} seconds`;
  }
  
  clearLogs() {
    this.logs = [];
  }
}

// Create singleton instance
export const auditLogger = new AuditLogger();
