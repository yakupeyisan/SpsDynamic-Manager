import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, QueryList, ContentChildren, AfterContentInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabItemComponent } from './tab-item.component';

@Component({
  selector: 'ui-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent implements AfterContentInit, OnChanges {
  @Input() activeTab: number = 0;
  @Input() variant: 'default' | 'pills' = 'default';
  
  @Output() activeTabChange = new EventEmitter<number>();
  @Output() tabChange = new EventEmitter<number>();

  @ContentChildren(TabItemComponent) tabItems!: QueryList<TabItemComponent>;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterContentInit() {
    if (this.tabItems && this.tabItems.length > 0 && this.activeTab >= 0) {
      this.selectTab(this.activeTab, false);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activeTab'] && !changes['activeTab'].firstChange) {
      if (this.tabItems && this.tabItems.length > 0) {
        this.selectTab(this.activeTab, false);
      }
    }
  }

  selectTab(index: number, emitEvent: boolean = true) {
    const tabs = this.tabItems.toArray();
    if (index < 0 || index >= tabs.length) return;

    tabs.forEach((tab, i) => {
      tab.active = i === index;
    });

    this.activeTab = index;
    if (emitEvent) {
      this.activeTabChange.emit(index);
      this.tabChange.emit(index);
    }
    this.cdr.markForCheck();
  }

  get tabsClasses(): string {
    return [
      'ui-tabs',
      `ui-tabs-${this.variant}`
    ].filter(Boolean).join(' ');
  }
}

