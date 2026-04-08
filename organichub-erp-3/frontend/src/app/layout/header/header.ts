import {
  Component,
  EventEmitter,
  Output,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../components/organic-toast/toast.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {

  @Output() sidebarToggle = new EventEmitter<void>();

  userMenuOpen = false;

  constructor(
    private router: Router,
    private toast: ToastService
  ) {}

  // ===============================
  // Sidebar Toggle
  // ===============================
  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  // ===============================
  // User Menu Toggle
  // ===============================
  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
  }

  // ===============================
  // Logout With Confirmation Toast
  // ===============================
  logout(): void {

    this.toast.confirm(
      'Are you sure you want to logout?',
      () => {

        // Remove JWT
        localStorage.removeItem('token');

        // Close dropdown
        this.userMenuOpen = false;

        // Redirect to login
        this.router.navigate(['/login'], { replaceUrl: true });

        // Show success toast
        setTimeout(() => {
          this.toast.success('Logged out successfully');
        }, 100);

      }
    );

  }

  // ===============================
  // Close Menu When Clicking Outside
  // ===============================
  @HostListener('document:click')
  closeUserMenu(): void {
    this.userMenuOpen = false;
  }
}