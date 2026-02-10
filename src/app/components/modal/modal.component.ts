import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() title?: string;
  @Input() show: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  @Input() closable: boolean = true;
  @Input() backdrop: boolean = true;
  @Input() backdropClose: boolean = true;
  @Input() showFooter: boolean = true;
  @Input() allowFullscreen: boolean = true; // Allow fullscreen toggle
  /** false ise body'e modal-open eklenmez, sidebar görünür kalır */
  @Input() hideSidebarWhenOpen: boolean = true;

  @Output() showChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();
  @Output() onResize = new EventEmitter<{width: number, height: number}>();
  @Output() onSave = new EventEmitter<void>(); // Emit when Enter is pressed
  
  @ViewChild('modalBody', { static: false }) modalBodyRef!: ElementRef<HTMLDivElement>;
  
  isFullscreen: boolean = false;
  private resizeObserver?: ResizeObserver;

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    
    // Only handle keyboard shortcuts when modal is open
    if (!this.show) {
      return;
    }

    // ESC: Close modal
    if (keyboardEvent.key === 'Escape' && this.closable) {
      keyboardEvent.preventDefault();
      keyboardEvent.stopPropagation();
      this.close();
      return;
    }

    // Ctrl+Shift+F: Toggle fullscreen
    if (keyboardEvent.ctrlKey && keyboardEvent.shiftKey && keyboardEvent.key === 'F') {
      keyboardEvent.preventDefault();
      keyboardEvent.stopPropagation();
      if (this.allowFullscreen) {
        this.toggleFullscreen();
      }
      return;
    }

    // Ctrl+M: Exit fullscreen (only when in fullscreen)
    if (keyboardEvent.ctrlKey && !keyboardEvent.shiftKey && !keyboardEvent.altKey && keyboardEvent.key === 'm') {
      if (this.isFullscreen && this.allowFullscreen) {
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
        this.toggleFullscreen();
      }
      return;
    }

    // Enter: Save (only if not typing in input/textarea/select/button)
    if (keyboardEvent.key === 'Enter' && !keyboardEvent.ctrlKey && !keyboardEvent.shiftKey && !keyboardEvent.altKey) {
      const target = keyboardEvent.target as HTMLElement;
      const isEditableElement = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT' ||
        target.tagName === 'BUTTON' ||
        target.isContentEditable ||
        target.closest('button') !== null ||
        target.closest('input') !== null ||
        target.closest('textarea') !== null ||
        target.closest('select') !== null;
      
      // Only trigger save if not in an editable element
      if (!isEditableElement) {
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
        this.onSave.emit();
      }
    }
  }

  ngOnInit() {
    if (this.show) {
      this.preventBodyScroll();
      if (this.hideSidebarWhenOpen) {
        document.body.classList.add('modal-open');
      }
    }
  }

  ngAfterViewInit() {
    this.setupResizeObserver();
  }

  ngOnDestroy() {
    this.cleanupResizeObserver();
    this.restoreBodyScroll();
    if (this.hideSidebarWhenOpen) {
      document.body.classList.remove('modal-open');
    }
  }

  private setupResizeObserver() {
    if (typeof ResizeObserver !== 'undefined' && this.modalBodyRef?.nativeElement) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          this.onResize.emit({ width, height });
        }
      });
      
      this.resizeObserver.observe(this.modalBodyRef.nativeElement);
    }
  }

  private cleanupResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
  }

  open() {
    this.show = true;
    this.isFullscreen = false; // Reset fullscreen state when opening
    this.showChange.emit(true);
    this.opened.emit();
    this.preventBodyScroll();
    if (this.hideSidebarWhenOpen) {
      document.body.classList.add('modal-open');
    }
    // Setup resize observer after modal is shown
    setTimeout(() => {
      this.setupResizeObserver();
    }, 0);
  }

  close() {
    if (this.closable) {
      this.show = false;
      this.isFullscreen = false; // Reset fullscreen state when closing
      this.showChange.emit(false);
      this.closed.emit();
      this.cleanupResizeObserver();
      this.restoreBodyScroll();
      if (this.hideSidebarWhenOpen) {
        document.body.classList.remove('modal-open');
      }
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

  toggleFullscreen() {
    if (this.allowFullscreen) {
      this.isFullscreen = !this.isFullscreen;
      if (this.isFullscreen) {
        document.body.style.overflow = 'hidden';
        // Fullscreen = pageWrapper alanı; sidebar görünsün, modal content alanında kalsın
        if (this.hideSidebarWhenOpen) {
          document.body.classList.remove('modal-open');
        }
      } else {
        if (this.hideSidebarWhenOpen && this.show) {
          document.body.classList.add('modal-open');
        }
        this.preventBodyScroll();
      }
      setTimeout(() => {
        if (this.modalBodyRef?.nativeElement) {
          const rect = this.modalBodyRef.nativeElement.getBoundingClientRect();
          this.onResize.emit({ width: rect.width, height: rect.height });
        }
      }, 0);
    }
  }

  get modalClasses(): string {
    return [
      'ui-modal-dialog',
      `ui-modal-${this.size}`,
      this.isFullscreen ? 'ui-modal-fullscreen' : ''
    ].filter(Boolean).join(' ');
  }

  get backdropClasses(): string {
    return [
      'ui-modal-backdrop',
      this.isFullscreen ? 'ui-modal-backdrop-fullscreen' : ''
    ].filter(Boolean).join(' ');
  }
}

