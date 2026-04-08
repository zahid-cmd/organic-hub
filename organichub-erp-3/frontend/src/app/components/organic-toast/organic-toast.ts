import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastState } from './toast.service';

@Component({
  selector: 'app-organic-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './organic-toast.html',
  styleUrls: ['./organic-toast.css']
})
export class OrganicToast implements OnInit {

  state: ToastState = {
    visible: false,
    message: '',
    type: 'success',
    confirmMode: false
  };

  constructor(private toast: ToastService) {}

  ngOnInit(): void {

    this.toast.toast$.subscribe(state => {

      this.state = state;

      // Auto-hide normal toast
      if (state.visible && !state.confirmMode) {
        setTimeout(() => {
          this.toast.hide();
        }, 2500);
      }

    });
  }

  onConfirm(): void {
    if (this.state.onConfirm) {
      this.state.onConfirm();
    }
    this.toast.hide();
  }

  onCancel(): void {
    this.toast.hide();
  }
}
