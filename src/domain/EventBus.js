// 極簡 EventEmitter — domain → UI 通知
// 事件清單：
//   'moral:updated'      { studentId, score, change }
//   'progress:updated'    { studentId, scenarioId, topicId }
//   'scenario:completed'  { studentId, scenarioId, result }

class EventBus {
  constructor() {
    this._handlers = new Map();
  }

  on(event, handler) {
    if (!this._handlers.has(event)) {
      this._handlers.set(event, new Set());
    }
    this._handlers.get(event).add(handler);
    return () => this.off(event, handler); // 返回卸載函數
  }

  off(event, handler) {
    if (this._handlers.has(event)) {
      this._handlers.get(event).delete(handler);
    }
  }

  emit(event, data) {
    if (this._handlers.has(event)) {
      this._handlers.get(event).forEach(h => {
        try { h(data); } catch (e) { console.error(`[EventBus] handler error on "${event}":`, e); }
      });
    }
  }
}

export const bus = new EventBus();