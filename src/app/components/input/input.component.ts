import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: 'text' | 'number' | 'email' | 'password' | 'tel' | 'url' | 'time' | 'date' = 'text';
  @Input() placeholder: string = '';
  @Input() label?: string;
  @Input() helperText?: string;
  @Input() errorText?: string;
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() readonly: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() icon?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;
  
  @Output() valueChange = new EventEmitter<string | number>();
  @Output() focusEvent = new EventEmitter<FocusEvent>();
  @Output() blurEvent = new EventEmitter<FocusEvent>();
  @Output() keyupEvent = new EventEmitter<KeyboardEvent>();

  value: string | number = '';
  private onChange = (value: string | number) => {};
  private onTouched = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = this.type === 'number' ? parseFloat(target.value) || 0 : target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  onFocus(event: FocusEvent) {
    this.focusEvent.emit(event);
  }

  onBlur(event: FocusEvent) {
    this.onTouched();
    this.blurEvent.emit(event);
  }
  
  onKeyUp(event: KeyboardEvent) {
    this.keyupEvent.emit(event);
  }

  writeValue(value: string | number): void {
    this.value = value ?? '';
    // Trigger change detection for OnPush strategy
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    // Trigger change detection for OnPush strategy
    this.cdr.markForCheck();
  }

  get inputClasses(): string {
    return [
      'ui-input',
      `ui-input-${this.size}`,
      this.errorText ? 'ui-input-error' : '',
      this.icon ? 'ui-input-has-icon' : '',
      this.iconPosition === 'right' ? 'ui-input-icon-right' : ''
    ].filter(Boolean).join(' ');
  }
}

