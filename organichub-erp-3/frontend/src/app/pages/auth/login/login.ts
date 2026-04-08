import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../components/organic-toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  username = '';
  password = '';
  loading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService
  ) {}

  onSubmit(): void {

    if (!this.username || !this.password) {
      this.toast.error('Please enter username and password');
      return;
    }

    this.loading = true;

    this.http.post<any>('http://localhost:5150/api/auth/login', {
      username: this.username,
      password: this.password
    })
    .subscribe({
      next: (response) => {

        // Save JWT
        localStorage.setItem('token', response.token);

        this.toast.success('Login successful');

        setTimeout(() => {
          this.router.navigate(['/dashboard'], { replaceUrl: true });
        }, 500);
      },
      error: () => {
        this.toast.error('Invalid username or password');
        this.loading = false;
      }
    });
  }
}