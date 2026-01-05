import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-toggle',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleComponent),
      multi: true
    }
  ],
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() disabled: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() color: 'primary' | 'success' = 'primary';
  
  @Output() valueChange = new EventEmitter<boolean>();

  checked: boolean = false;
  private onChange = (value: boolean) => {};
  private onTouched = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  toggle(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!this.disabled) {
      this.checked = !this.checked;
      this.onChange(this.checked);
      this.onTouched();
      this.valueChange.emit(this.checked);
      this.cdr.markForCheck();
    }
  }

  writeValue(value: boolean): void {
    const boolValue = value ?? false;
    if (this.checked !== boolValue) {
      this.checked = boolValue;
      this.cdr.markForCheck();
    }
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  get toggleClasses(): string {
    return [
      'ui-toggle',
      `ui-toggle-${this.size}`,
      this.checked ? 'ui-toggle-checked' : '',
      this.disabled ? 'ui-toggle-disabled' : '',
      `ui-toggle-${this.color}`
    ].filter(Boolean).join(' ');
  }
}

