import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  category: 'general' | 'bug' | 'feature';
  order: number;
  createdAt: string;
  updatedAt: string;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private http = inject(HttpClient);

  email = 'owner@test.com';
  password = 'Password123!';
  token: string | null = localStorage.getItem('token');
  me: any = null;

  tasks: Task[] = [];
  newTitle = '';
  newCategory: Task['category'] = 'general';
  newStatus: Task['status'] = 'todo';

  error: any = null;

  private authHeaders(): HttpHeaders {
    const t = this.token ?? '';
    return new HttpHeaders(t ? { Authorization: `Bearer ${t}` } : {});
  }

  login() {
    this.error = null;
    this.http
      .post<any>('http://localhost:3000/api/auth/login', {
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (res) => {
          this.token = res.access_token;
          localStorage.setItem('token', this.token!);
          this.fetchMe();
          this.fetchTasks();
        },
        error: (err) => (this.error = err),
      });
  }

  fetchMe() {
    if (!this.token) return;
    this.http
      .get('http://localhost:3000/api/auth/me', {
        headers: this.authHeaders(),
        responseType: 'json',
      })
      .subscribe({
        next: (res) => (this.me = res),
        error: (err) => (this.error = err),
      });
  }

  logout() {
    this.token = null;
    this.me = null;
    this.tasks = [];
    localStorage.removeItem('token');
  }

  fetchTasks() {
    if (!this.token) return;
    this.error = null;

    this.http
      .get<Task[]>('http://localhost:3000/api/tasks', {
        headers: this.authHeaders(),
        responseType: 'json',
      })
      .subscribe({
        next: (res) => (this.tasks = res),
        error: (err) => (this.error = err),
      });
  }

  createTask() {
    if (!this.token) return;
    if (!this.newTitle.trim()) return;

    this.error = null;

    this.http
      .post<Task>(
        'http://localhost:3000/api/tasks',
        {
          title: this.newTitle.trim(),
          status: this.newStatus,
          category: this.newCategory,
        },
        {
          headers: this.authHeaders(),
          responseType: 'json',
        }
      )
      .subscribe({
        next: () => {
          this.newTitle = '';
          this.fetchTasks();
        },
        error: (err) => (this.error = err),
      });
  }

    updateTask(t: Task, patch: Partial<Task>) {
    if (!this.token) return;

    this.error = null;

    this.http
      .put<Task>(
        `http://localhost:3000/api/tasks/${t.id}`,
        patch,
        {
          headers: this.authHeaders(),
          responseType: 'json',
        }
      )
      .subscribe({
        next: () => this.fetchTasks(),
        error: (err) => (this.error = err),
      });
  }

  deleteTask(t: Task) {
    if (!this.token) return;

    this.error = null;

    this.http
      .delete(
        `http://localhost:3000/api/tasks/${t.id}`,
        {
          headers: this.authHeaders(),
          responseType: 'json',
        }
      )
      .subscribe({
        next: () => this.fetchTasks(),
        error: (err) => (this.error = err),
      });
  }


  ngOnInit() {
    if (this.token) {
      this.fetchMe();
      this.fetchTasks();
    }
  }
}
