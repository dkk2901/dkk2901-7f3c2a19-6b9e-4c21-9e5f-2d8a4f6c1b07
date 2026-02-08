import { Injectable } from '@nestjs/common';

export type AuditEvent = {
  id: string;
  ts: string;
  actor: { sub: string; email: string; role: string; orgId: string };
  action: 'task:create' | 'task:update' | 'task:delete';
  taskId: string;
  orgId: string;
  details?: any;
};

@Injectable()
export class AuditService {
  private events: AuditEvent[] = [];

  record(event: Omit<AuditEvent, 'id' | 'ts'>) {
    this.events.unshift({
      id: `a_${Math.random().toString(16).slice(2)}`,
      ts: new Date().toISOString(),
      ...event,
    });
  }

  list() {
    return this.events.slice(0, 200);
  }
}
