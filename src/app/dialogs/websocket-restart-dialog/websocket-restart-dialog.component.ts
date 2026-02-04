import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-websocket-restart-dialog',
  standalone: true,
  imports: [MaterialModule, CommonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>WebSocket Bağlantısı</h2>
    <mat-dialog-content>
      <p class="m-b-0">Websocket bağlantısı kurulamıyor. Yeniden başlatmak ister misiniz?</p>
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
export class WebSocketRestartDialogComponent {
  constructor(public dialogRef: MatDialogRef<WebSocketRestartDialogComponent>) {}

  yes(): void {
    this.dialogRef.close(true);
  }

  no(): void {
    this.dialogRef.close(false);
  }
}
