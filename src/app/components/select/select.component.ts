import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, HostListener, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// PLACEHOLDERS constant (replacement for @customizer/ui)
const PLACEHOLDERS = {
  SEARCH: 'Search...',
  SELECT_OPTION: 'Select an option...',
  FILTER_OPERATOR: 'Operator',
  FILTER_MIN: 'Min',
  FILTER_MAX: 'Max',
  FILTER_SELECT_VALUE: 'Select value',
  FILTER_SELECT_VALUES: 'Select values',
  FILTER_SELECT_DATE: 'Select date',
  FILTER_VALUE: 'Value',
  FILTER_SELECT_FIELD: 'Select field'
};

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
}

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  templateUrl: './select.component.html',
  styleUrl: './select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SelectComponent implements ControlValueAccessor, OnDestroy {
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = PLACEHOLDERS.SELECT_OPTION;
  @Input() label?: string;
  @Input() helperText?: string;
  @Input() errorText?: string;
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() multiple: boolean = false;
  
  @Output() valueChange = new EventEmitter<any>();
  @Output() openChange = new EventEmitter<boolean>();

  @ViewChild('selectContainer', { static: false }) selectContainer?: ElementRef;
  @ViewChild('dropdown', { static: false }) dropdown?: ElementRef;

  value: any = this.multiple ? [] : null;
  isOpen: boolean = false;
  
  constructor(
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnDestroy() {
    // Cleanup handled by HostListener
  }
  
  private closeDropdown() {
    this.isOpen = false;
    this.openChange.emit(false);
  }

  onSelectClick(event: Event) {
    if (!this.isOpen) return;
    
    const target = event.target as HTMLElement;
    const container = this.selectContainer?.nativeElement;
    
    if (!container) return;
    
    // Check if click is inside the select container or its children
    const isInsideContainer = container.contains(target);
    
    // Check if click is inside dropdown
    let isInsideDropdown = false;
    if (this.dropdown) {
      const dropdownEl = this.dropdown.nativeElement;
      isInsideDropdown = dropdownEl.contains(target);
      
      // Also check bounds for fixed positioned dropdowns
      if (!isInsideDropdown) {
        const rect = dropdownEl.getBoundingClientRect();
        const clickEvent = event as MouseEvent;
        const clickX = clickEvent.clientX;
        const clickY = clickEvent.clientY;
        
        if (clickX >= rect.left && clickX <= rect.right && 
            clickY >= rect.top && clickY <= rect.bottom) {
          isInsideDropdown = true;
        }
      }
    }
    
    // If click is NOT inside container or dropdown (or their children), close dropdown
    if (!isInsideContainer && !isInsideDropdown) {
      this.closeDropdown();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    // Always check isOpen state directly, don't rely on change detection
    if (!this.isOpen) return;
    
    // Check if selectContainer still exists in DOM
    if (!this.selectContainer || !this.selectContainer.nativeElement) return;
    
    const target = event.target as HTMLElement;
    if (!target) return;
    
    const clickEvent = event as MouseEvent;
    if (!clickEvent) return;
    
    // Check if click is inside this select's container
    const container = this.selectContainer.nativeElement;
    if (!container) return;
    
    const isInsideContainer = container.contains(target);
    
    // Check if click is inside this select's dropdown
    let isInsideDropdown = false;
    if (this.dropdown && this.dropdown.nativeElement) {
      const dropdownEl = this.dropdown.nativeElement;
      
      // First check DOM contains
      isInsideDropdown = dropdownEl.contains(target);
      
      // If not found in DOM (might be fixed positioned), check bounds
      if (!isInsideDropdown) {
        try {
          const rect = dropdownEl.getBoundingClientRect();
          const clickX = clickEvent.clientX;
          const clickY = clickEvent.clientY;
          
          if (clickX >= rect.left && clickX <= rect.right && 
              clickY >= rect.top && clickY <= rect.bottom) {
            isInsideDropdown = true;
          }
        } catch (e) {
          // If getBoundingClientRect fails, assume not inside
          isInsideDropdown = false;
        }
      }
    }
    
    // If click is inside this select (container or dropdown), don't close
    if (isInsideContainer || isInsideDropdown) {
      return;
    }
    
    // Click is outside this select - close it
    // Double check isOpen before closing (in case it was closed by another event)
    if (this.isOpen) {
      this.closeDropdown();
    }
  }
  
  private onChange = (value: any) => {};
  private onTouched = () => {};

  /**
   * Normalize values for consistent comparison
   */
  private normalizeForComparison(val: any): string {
    if (this.multiple) {
      if (!Array.isArray(val)) return '[]';
      return JSON.stringify([...val].sort());
    }
    return JSON.stringify(val);
  }

  /**
   * Deep compare two values
   */
  private valuesAreEqual(val1: any, val2: any): boolean {
    const str1 = this.normalizeForComparison(val1);
    const str2 = this.normalizeForComparison(val2);
    return str1 === str2;
  }

  get selectedLabel(): string {
    if (this.multiple) {
      if (!Array.isArray(this.value) || this.value.length === 0) {
        return this.placeholder;
      }
      const selected = this.options.filter(opt => this.value.includes(opt.value));
      return selected.length > 0 ? `${selected.length} selected` : this.placeholder;
    } else {
      const option = this.options.find(opt => opt.value === this.value);
      return option ? option.label : this.placeholder;
    }
  }

  get selectedOptions(): SelectOption[] {
    if (!this.multiple || !Array.isArray(this.value) || this.value.length === 0) {
      return [];
    }
    return this.options.filter(opt => this.value.includes(opt.value));
  }

  removeSelectedOption(event: Event, optionValue: any) {
    event.stopPropagation();
    if (!this.multiple || !Array.isArray(this.value)) return;
    
    const index = this.value.indexOf(optionValue);
    if (index > -1) {
      const newValue = [...this.value];
      newValue.splice(index, 1);
      
      // Check if value actually changed before updating
      if (this.valuesAreEqual(this.value, newValue)) {
        return; // Value hasn't changed, no need to update
      }
      
      
      this.value = newValue;
      this.emitValueChange(newValue);
    }
  }

  toggleOpen() {
    if (!this.disabled) {
      const wasOpen = this.isOpen;
      this.isOpen = !this.isOpen;
      this.openChange.emit(this.isOpen);
      
      if (this.isOpen) {
        setTimeout(() => this.positionDropdown(), 0);
    }
  }
  }
  
  private positionDropdown() {
    if (!this.selectContainer || !this.dropdown) return;
    
    const container = this.selectContainer.nativeElement;
    const dropdown = this.dropdown.nativeElement;
    const rect = container.getBoundingClientRect();
    
    // Check if inside filter overlay or modal
    const isInFilterOverlay = container.closest('.ui-filter-overlay') || container.closest('.ui-filter-panel');
    const isInModal = container.closest('.ui-modal-dialog') || container.closest('.ui-modal-content') || container.closest('.ui-modal-body');
    
    if (isInFilterOverlay) {
      // Use fixed positioning for filter overlay dropdowns
      this.renderer.setStyle(dropdown, 'position', 'fixed');
      this.renderer.setStyle(dropdown, 'top', `${rect.bottom + 4}px`);
      this.renderer.setStyle(dropdown, 'left', `${rect.left}px`);
      this.renderer.setStyle(dropdown, 'width', `${rect.width}px`);
      this.renderer.setStyle(dropdown, 'z-index', '1002');
    } else if (isInModal) {
      // Use fixed positioning for modal dropdowns
      this.renderer.setStyle(dropdown, 'position', 'fixed');
      this.renderer.setStyle(dropdown, 'top', `${rect.bottom + 4}px`);
      this.renderer.setStyle(dropdown, 'left', `${rect.left}px`);
      this.renderer.setStyle(dropdown, 'width', `${rect.width}px`);
      this.renderer.setStyle(dropdown, 'z-index', '1003');
    }
  }

  selectOption(option: SelectOption, event?: Event) {
    if (option.disabled) {
      return;
    }
    if (event) {
      event.stopPropagation();
    }

    // Skip if option value is null or undefined
    if (option.value === null || option.value === undefined) {
      console.warn('SelectOption value is null or undefined:', option);
      return;
    }

    let newValue: any;
    if (this.multiple) {
      const currentValue = Array.isArray(this.value) ? [...this.value] : [];
      // Filter out null/undefined values from current value
      const cleanCurrentValue = currentValue.filter(val => val !== null && val !== undefined);
      
      // Find index using strict equality
      const index = cleanCurrentValue.findIndex(val => val === option.value);
      
      if (index > -1) {
        // Remove if already selected
        cleanCurrentValue.splice(index, 1);
      } else {
        // Add if not selected
        cleanCurrentValue.push(option.value);
      }
      
      newValue = cleanCurrentValue;
    } else {
      newValue = option.value;
      this.closeDropdown();
    }
    
    // Always update value and emit change (don't check if equal to ensure UI updates)
    this.value = newValue;
    this.emitValueChange(newValue);
    // Mark for check to update UI
    this.cdr.markForCheck();
  }

  /**
   * Emit value change to Angular Forms and output event
   */
  private oldValue: string = "";
  private emitValueChange(newValue: any): void {
    const newValueStr = JSON.stringify(newValue);
    if(this.oldValue === newValueStr) {
      return;
    }
    this.oldValue = newValueStr; 
    this.valueChange.emit(newValue);
    this.onChange(newValue);
    // Mark for check to ensure UI updates
    this.cdr.markForCheck();
  }

  isSelected(option: SelectOption): boolean {
    if (this.multiple) {
      if (!Array.isArray(this.value) || this.value.length === 0) {
        return false;
      }
      // Use strict equality comparison - check each value individually
      for (const val of this.value) {
        if (val === option.value) {
          return true;
        }
      }
      return false;
    }
    return this.value === option.value;
  }

  writeValue(value: any): void {
    // For multiple select, ensure value is always an array
    const newValue = this.multiple 
      ? (Array.isArray(value) ? value : (value != null ? [value] : []))
      : (value ?? null);
    
    // Check if value actually changed
    if (this.valuesAreEqual(this.value, newValue)) {
      return; // Value hasn't changed, no need to update
    }
    
    // Simply update the value
    // writeValue is called by Angular Forms, not by user interaction
    // Do NOT call onChange here - it's only for external updates
    this.value = newValue;
    // Mark for check since we're using OnPush change detection
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  get selectClasses(): string {
    return [
      'ui-select',
      `ui-select-${this.size}`,
      this.errorText ? 'ui-select-error' : '',
      this.isOpen ? 'ui-select-open' : ''
    ].filter(Boolean).join(' ');
  }
}

