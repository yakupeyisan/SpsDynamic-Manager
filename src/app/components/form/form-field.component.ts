import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ui-form-field',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldComponent {
  @Input() label?: string;
  @Input() required: boolean = false;
  @Input() error?: string;
  @Input() helperText?: string;
  @Input() span: number = 12; // 1-12 grid span for horizontal layout
  @Input() labelWidth?: string;

  constructor(public translate: TranslateService) {}

  getTranslatedLabel(): string {
    if (!this.label) return '';
    
    // Try to get translation for label
    // First try as direct translation key
    let translated = this.translate.instant(this.label);
    if (translated && translated !== this.label) {
      return translated;
    }
    
    // If label looks like a column field name, try columns.fieldName
    if (this.label && !this.label.includes(' ')) {
      const columnKey = `columns.${this.label}`;
      translated = this.translate.instant(columnKey);
      if (translated && translated !== columnKey) {
        return translated;
      }
    }
    
    // Fallback to original label
    return this.label;
  }
}

