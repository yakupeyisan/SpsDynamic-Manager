import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-print-confirm-dialog',
  standalone: true,
  imports: [MaterialModule, CommonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Yazdırma</h2>
    <mat-dialog-content>
      <p class="m-b-0">Yazdırma başlatıldı mı?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="no()">Hayır</button>
      <button mat-flat-button color="primary" (click)="yes()">Evet</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      padding: 0 24px 8px;
      min-width: 320px;
    }
  `]
})
export class PrintConfirmDialogComponent {
  constructor(public dialogRef: MatDialogRef<PrintConfirmDialogComponent>) {}

  yes(): void {
    this.dialogRef.close(true);
  }

  no(): void {
    this.dialogRef.close(false);
  }
}
