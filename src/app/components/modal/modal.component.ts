import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() title?: string;
  @Input() show: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  @Input() closable: boolean = true;
  @Input() backdrop: boolean = true;
  @Input() backdropClose: boolean = true;
  @Input() showFooter: boolean = true;
  
  @Output() showChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: Event) {
    if (this.show && this.closable) {
      this.close();
    }
  }

  ngOnInit() {
    if (this.show) {
      this.preventBodyScroll();
      document.body.classList.add('modal-open');
    }
  }

  ngOnDestroy() {
    this.restoreBodyScroll();
    document.body.classList.remove('modal-open');
  }

  open() {
    this.show = true;
    this.showChange.emit(true);
    this.opened.emit();
    this.preventBodyScroll();
    // Add class to body to hide sidebar when modal is open
    document.body.classList.add('modal-open');
  }

  close() {
    if (this.closable) {
      this.show = false;
      this.showChange.emit(false);
      this.closed.emit();
      this.restoreBodyScroll();
      // Remove class from body when modal is closed
      document.body.classList.remove('modal-open');
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (this.backdropClose && event.target === event.currentTarget) {
      this.close();
    }
  }

  private preventBodyScroll() {
    document.body.style.overflow = 'hidden';
  }

  private restoreBodyScroll() {
    document.body.style.overflow = '';
  }

  get modalClasses(): string {
    return [
      'ui-modal-dialog',
      `ui-modal-${this.size}`
    ].filter(Boolean).join(' ');
  }
}

