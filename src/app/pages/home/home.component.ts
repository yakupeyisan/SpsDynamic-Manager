import { Component, OnInit } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TablerIconsModule,
    MaterialModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // Statistics
  totalPersonCount: number = 0;
  bannedPersonCount: number = 0;
  notBannedPersonCount: number = 0;
  activeCafeteriaStatusCount: number = 0;
  inactiveCafeteriaStatusCount: number = 0;
  totalCardCount: number = 0;
  todayPassageCount: number = 0;
  onlineTerminalCount: number = 0;
  offlineTerminalCount: number = 0;
  cardsWaitingForPrinting: number = 0;
  currentVisitorCount: number = 0;
  todayTotalVisitorCount: number = 0;
  pendingMailCount: number = 0;
  pendingSmsCount: number = 0;
  last7DaysSuccessfulLoad: number = 0;
  last7DaysFailedLoad: number = 0;
  subscriptionPersonCount: number = 0;
  totalFirstMealCount: number = 0;
  totalSecondMealCount: number = 0;
  
  isLoading: boolean = false;

  private apiUrl: string;

  constructor(
    private toastr: ToastrService,
    private http: HttpClient
  ) {
    this.apiUrl = environment.settings[environment.setting as keyof typeof environment.settings].apiUrl;
  }

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.isLoading = true;

    // Single endpoint call for all statistics
    this.http.post<any>(`${this.apiUrl}/api/Home/Statistics`, {
      page: 1,
      limit: 1,
      offset: 0
    }).pipe(
      map(response => {
        if (response.status === 'success' && response.data) {
          return response.data;
        }
        throw new Error('Invalid response format');
      }),
      catchError((error) => {
        console.error('Error loading statistics:', error);
        this.toastr.error('İstatistikler yüklenirken bir hata oluştu', 'Hata');
        return of({
          totalPersonCount: 0,
          bannedPersonCount: 0,
          notBannedPersonCount: 0,
          activeCafeteriaStatusCount: 0,
          inactiveCafeteriaStatusCount: 0,
          totalCardCount: 0,
          todayPassageCount: 0,
          onlineTerminalCount: 0,
          offlineTerminalCount: 0,
          cardsWaitingForPrinting: 0,
          currentVisitorCount: 0,
          todayTotalVisitorCount: 0,
          subscriptionPersonCount: 0,
          totalFirstMealCount: 0,
          totalSecondMealCount: 0,
          pendingMailCount: 0,
          pendingSmsCount: 0,
          last7DaysSuccessfulLoad: 0,
          last7DaysFailedLoad: 0
        });
      })
    ).subscribe({
      next: (data) => {
        this.totalPersonCount = data.totalPersonCount || 0;
        this.bannedPersonCount = data.bannedPersonCount || 0;
        this.notBannedPersonCount = data.notBannedPersonCount || 0;
        this.activeCafeteriaStatusCount = data.activeCafeteriaStatusCount || 0;
        this.inactiveCafeteriaStatusCount = data.inactiveCafeteriaStatusCount || 0;
        this.totalCardCount = data.totalCardCount || 0;
        this.todayPassageCount = data.todayPassageCount || 0;
        this.onlineTerminalCount = data.onlineTerminalCount || 0;
        this.offlineTerminalCount = data.offlineTerminalCount || 0;
        this.cardsWaitingForPrinting = data.cardsWaitingForPrinting || 0;
        this.currentVisitorCount = data.currentVisitorCount || 0;
        this.todayTotalVisitorCount = data.todayTotalVisitorCount || 0;
        this.subscriptionPersonCount = data.subscriptionPersonCount || 0;
        this.totalFirstMealCount = data.totalFirstMealCount || 0;
        this.totalSecondMealCount = data.totalSecondMealCount || 0;
        this.pendingMailCount = data.pendingMailCount || 0;
        this.pendingSmsCount = data.pendingSmsCount || 0;
        this.last7DaysSuccessfulLoad = (data.last7DaysSuccessfulLoad || 0) / 100; // Convert from kuruş to TL
        this.last7DaysFailedLoad = (data.last7DaysFailedLoad || 0) / 100; // Convert from kuruş to TL
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.toastr.error('İstatistikler yüklenirken bir hata oluştu', 'Hata');
        this.isLoading = false;
      }
    });

  }
}

