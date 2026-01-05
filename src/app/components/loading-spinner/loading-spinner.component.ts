import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="global-loading-overlay" *ngIf="isLoading">
      <div class="global-loading-spinner">
        <div class="spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    .global-loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001 !important;
      backdrop-filter: blur(2px);
    }

    .global-loading-spinner {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .global-loading-spinner .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--ui-gray-200);
      border-top-color: var(--ui-primary);
      border-radius: 50%;
      animation: spinner-rotate 0.8s linear infinite;
    }

    @keyframes spinner-rotate {
      to {
        transform: rotate(360deg);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinnerComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  private subscription?: Subscription;

  constructor(
    public loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoading = this.loadingService.isLoading;
    this.subscription = this.loadingService.loading$.subscribe(isLoading => {
      this.isLoading = isLoading;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
