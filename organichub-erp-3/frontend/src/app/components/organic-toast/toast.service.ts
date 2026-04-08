import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
  confirmMode: boolean;
  onConfirm?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private initialState: ToastState = {
    visible: false,
    message: '',
    type: 'success',
    confirmMode: false
  };

  private toastSubject = new BehaviorSubject<ToastState>(this.initialState);
  toast$ = this.toastSubject.asObservable();

  success(message: string) {
    this.toastSubject.next({
      visible: true,
      message,
      type: 'success',
      confirmMode: false
    });
  }

  error(message: string) {
    this.toastSubject.next({
      visible: true,
      message,
      type: 'error',
      confirmMode: false
    });
  }

  confirm(message: string, onConfirm: () => void) {
    this.toastSubject.next({
      visible: true,
      message,
      type: 'warning',
      confirmMode: true,
      onConfirm
    });
  }

  hide() {
    this.toastSubject.next(this.initialState);
  }
}
