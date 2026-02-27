import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private loadingMessageSubject = new BehaviorSubject<string | null>(null);
  public loadingMessage$: Observable<string | null> = this.loadingMessageSubject.asObservable();

  private requestCount = 0;

  /**
   * Show loading spinner
   */
  show(): void {
    this.requestCount++;
    if (this.requestCount > 0) {
      this.loadingSubject.next(true);
    }
  }

  /**
   * Hide loading spinner
   */
  hide(): void {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.loadingSubject.next(false);
    }
  }

  /**
   * Set optional message to display under the loading spinner (e.g. for export).
   * Pass null to clear.
   */
  setMessage(message: string | null): void {
    this.loadingMessageSubject.next(message);
  }

  /**
   * Get current loading state
   */
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }
}
