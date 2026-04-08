import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartUiService {

  private readonly openSubject = new BehaviorSubject<boolean>(false);
  readonly isOpen$ = this.openSubject.asObservable();

  open(): void {
    if (!this.openSubject.value) {
      this.openSubject.next(true);
    }
  }

  close(): void {
    if (this.openSubject.value) {
      this.openSubject.next(false);
    }
  }

  toggle(): void {
    this.openSubject.next(!this.openSubject.value);
  }
}
