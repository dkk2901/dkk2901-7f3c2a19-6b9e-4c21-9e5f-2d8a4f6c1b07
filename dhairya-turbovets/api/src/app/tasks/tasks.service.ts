import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuditService } from '../audit/audit.service';


export type Role = 'Owner' | 'Admin' | 'Viewer';

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  category: 'general' | 'bug' | 'feature';
  order: number;
  orgId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class TasksService {
  constructor(private audit: AuditService) {}

  // Minimal org hierarchy (hardcoded for now)
  // org1 -> org1a
  private orgChildren: Record<string, string[]> = {
    org1: ['org1a'],
    org1a: [],
  };

  private accessibleOrgIds(user: { orgId: string; role: Role }) {
    if (user.role === 'Owner') {
      return [user.orgId, ...(this.orgChildren[user.orgId] ?? [])];
    }
    return [user.orgId];
  }

  private tasks: Task[] = [
    {
      id: 't1',
      title: 'Seed task 1',
      description: 'First task',
      status: 'todo',
      category: 'general',
      order: 0,
      orgId: 'org1',
      createdBy: 'u1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 't_child',
      title: 'Child org task',
      description: 'Visible to Owner only',
      status: 'todo',
      category: 'feature',
      order: 0,
      orgId: 'org1a',
      createdBy: 'u1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Owner: org + child orgs; Admin/Viewer: org only
  list(user: { orgId: string; role: Role }) {
    const allowed = new Set(this.accessibleOrgIds(user));
    return this.tasks
      .filter((t) => allowed.has(t.orgId))
      .sort((a, b) => a.order - b.order);
  }

  create(
    dto: CreateTaskDto,
    user: { sub: string; email: string; orgId: string; role: Role }
  ) {
    if (user.role === 'Viewer') throw new ForbiddenException('Viewer is read-only');

    const now = new Date().toISOString();
    const id = `t${Math.random().toString(16).slice(2)}`;

    const order =
      typeof dto.order === 'number'
        ? dto.order
        : this.list(user).length;

    const task: Task = {
      id,
      title: dto.title,
      description: dto.description,
      status: dto.status,
      category: dto.category,
      order,
      orgId: user.orgId,
      createdBy: user.sub,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.push(task);

    // Step 4: audit event (create)
    this.audit.record({
      actor: { sub: user.sub, email: user.email, role: user.role, orgId: user.orgId },
      action: 'task:create',
      taskId: task.id,
      orgId: task.orgId,
      details: { title: task.title, status: task.status, category: task.category },
    });

    return task;
  }

  update(
    id: string,
    dto: UpdateTaskDto,
    user: { sub: string; email: string; orgId: string; role: Role }
  ) {
    if (user.role === 'Viewer') throw new ForbiddenException('Viewer is read-only');

    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new NotFoundException('Task not found');

    const task = this.tasks[idx];

    const allowed = new Set(this.accessibleOrgIds(user));
    if (!allowed.has(task.orgId)) throw new ForbiddenException('Cross-org access denied');

    const updated: Task = {
      ...task,
      ...dto,
      order: typeof dto.order === 'number' ? dto.order : task.order,
      updatedAt: new Date().toISOString(),
    };

    this.tasks[idx] = updated;

    // Step 4: audit event (update)
    this.audit.record({
      actor: { sub: user.sub, email: user.email, role: user.role, orgId: user.orgId },
      action: 'task:update',
      taskId: updated.id,
      orgId: updated.orgId,
      details: dto,
    });

    return updated;
  }

  remove(
    id: string,
    user: { sub: string; email: string; orgId: string; role: Role }
  ) {
    if (user.role === 'Viewer') throw new ForbiddenException('Viewer is read-only');

    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new NotFoundException('Task not found');

    const task = this.tasks[idx];

    const allowed = new Set(this.accessibleOrgIds(user));
    if (!allowed.has(task.orgId)) throw new ForbiddenException('Cross-org access denied');

    this.tasks.splice(idx, 1);

    // Step 4: audit event (delete)
    this.audit.record({
      actor: { sub: user.sub, email: user.email, role: user.role, orgId: user.orgId },
      action: 'task:delete',
      taskId: task.id,
      orgId: task.orgId,
      details: { title: task.title },
    });

    return { deleted: true };
  }
}
