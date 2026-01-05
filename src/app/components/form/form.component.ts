import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormFieldComponent } from './form-field.component';
import { FormGroup, AbstractControl } from '@angular/forms';

@Component({
  selector: 'ui-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormComponent implements OnInit {
  @Input() title?: string;
  @Input() layout: 'vertical' | 'horizontal' | 'inline' = 'vertical';
  @Input() labelWidth?: string;
  @Input() formGroup?: FormGroup; // Optional FormGroup reference
  @Input() showJsonOutput: boolean = true; // Show JSON output
  @Input() jsonOutputTitle: string = 'Form JSON Output'; // JSON output section title
  
  @Output() formSubmit = new EventEmitter<any>(); // Emit form values as JSON
  @Output() formChange = new EventEmitter<any>(); // Emit form values on change as JSON
  
  formJson: string = '{}';
  isJsonExpanded: boolean = false;

  ngOnInit() {
    // Subscribe to form changes if FormGroup is provided
    if (this.formGroup) {
      this.formGroup.valueChanges.subscribe(() => {
        this.updateJsonOutput();
      });
      
      // Initial JSON output
      this.updateJsonOutput();
    }
  }

  updateJsonOutput() {
    if (this.formGroup) {
      const formValue = this.getFormValue(this.formGroup);
      this.formJson = JSON.stringify(formValue, null, 2);
      this.formChange.emit(formValue);
    }
  }

  private getFormValue(formGroup: FormGroup): any {
    const value: any = {};
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        if (control instanceof FormGroup) {
          value[key] = this.getFormValue(control);
        } else {
          value[key] = control.value;
        }
      }
    });
    return value;
  }

  onSubmit() {
    if (this.formGroup && this.formGroup.valid) {
      const formValue = this.getFormValue(this.formGroup);
      this.formJson = JSON.stringify(formValue, null, 2);
      this.formSubmit.emit(formValue);
    }
  }

  toggleJsonOutput() {
    this.isJsonExpanded = !this.isJsonExpanded;
  }

  copyJsonToClipboard() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.formJson).then(() => {
        // Could show a toast notification here
      });
    }
  }
}

