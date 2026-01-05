import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-form-group',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-group.component.html',
  styleUrl: './form-group.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormGroupComponent implements OnInit {
  @Input() title?: string;
  @Input() collapsible: boolean = false;
  @Input() collapsed: boolean = false;
  
  isCollapsed: boolean = false;

  ngOnInit() {
    this.isCollapsed = this.collapsed;
  }

  toggle() {
    if (this.collapsible) {
      this.isCollapsed = !this.isCollapsed;
    }
  }
}

