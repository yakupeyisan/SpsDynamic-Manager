import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-tab-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-item.component.html',
  styleUrl: './tab-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabItemComponent {
  @Input() label: string = '';
  @Input() disabled: boolean = false;
  @Input() icon?: string;
  
  private _active: boolean = false;
  
  constructor(private cdr: ChangeDetectorRef) {}
  
  get active(): boolean {
    return this._active;
  }
  
  set active(value: boolean) {
    if (this._active !== value) {
      this._active = value;
      this.cdr.markForCheck();
    }
  }
}

