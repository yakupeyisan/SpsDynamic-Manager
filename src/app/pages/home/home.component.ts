import { Component, OnInit } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AppYearlyFinancialSummaryComponent } from './yearly-financial-summary/yearly-financial-summary.component';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { CardsService } from 'src/app/services/cards.service';
import { CafeteriaAccountsService, CafeteriaAccount } from 'src/app/services/cafeteria-accounts.service';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { handleHttpErrorSilent } from 'src/app/utils/http-error-handler.util';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TablerIconsModule,
    MaterialModule,
    CommonModule,
    AppYearlyFinancialSummaryComponent,
    FormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  cardCount: number = 0;
  totalBalance: number = 0;
  monthlyExpense: number = 0;
  monthlyLoad: number = 0;
  isLoading: boolean = false;
  accounts: CafeteriaAccount[] = [];
  selectedAccountId: number = 0; // 0 = Tümü

  constructor(
    private cardsService: CardsService,
    private accountsService: CafeteriaAccountsService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadSummaryData();
  }

  loadSummaryData(): void {
    this.isLoading = true;

    // Kart sayısını al (selectedAccountId varsa filtrele)
    const cards$ = this.cardsService.getMyCards(
      this.selectedAccountId !== 0 ? this.selectedAccountId : undefined
    ).pipe(
      handleHttpErrorSilent(this.toastr, 'Error loading cards', { status: 'error', total: 0, records: [] })
    );

    // Hesapları al
    const accounts$ = this.accountsService.getMyAccounts().pipe(
      handleHttpErrorSilent(this.toastr, 'Error loading accounts', { status: 'error', records: [] })
    );

    forkJoin([cards$, accounts$]).subscribe({
      next: ([cardsResponse, accountsResponse]) => {
        // Kart sayısı
        if (cardsResponse && cardsResponse.status === 'success' && cardsResponse.records) {
          this.cardCount = cardsResponse.records.length;
        } else if (cardsResponse && Array.isArray(cardsResponse)) {
          // Eğer direkt array dönüyorsa (fallback)
          this.cardCount = cardsResponse.length;
        }

        // Hesaplar ve işlemleri işle
        if (accountsResponse.status === 'success' && accountsResponse.records) {
          this.accounts = accountsResponse.records;
          this.loadAccountData();
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onAccountChange(): void {
    this.loadAccountData();
    this.loadCardCount();
  }

  loadCardCount(): void {
    // Kart sayısını seçilen account'a göre güncelle
    this.cardsService.getMyCards(
      this.selectedAccountId !== 0 ? this.selectedAccountId : undefined
    ).pipe(
      handleHttpErrorSilent(this.toastr, 'Error loading cards', { status: 'error', total: 0, records: [] })
    ).subscribe({
      next: (cardsResponse) => {
        if (cardsResponse && cardsResponse.status === 'success' && cardsResponse.records) {
          this.cardCount = cardsResponse.records.length;
        } else if (cardsResponse && Array.isArray(cardsResponse)) {
          // Eğer direkt array dönüyorsa (fallback)
          this.cardCount = cardsResponse.length;
        }
      }
    });
  }

  loadAccountData(): void {
    if (this.accounts.length === 0) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    // Seçilen accountId'ye göre filtrele
    const accountsToProcess = this.selectedAccountId === 0 
      ? this.accounts 
      : this.accounts.filter(acc => acc.ID === this.selectedAccountId);

    if (accountsToProcess.length === 0) {
      this.totalBalance = 0;
      this.monthlyExpense = 0;
      this.monthlyLoad = 0;
      this.isLoading = false;
      return;
    }

    // Her hesap için bakiye ve aylık verileri al (endpoint artık totalDepositLastMonth ve totalExpenseLastMonth döndürüyor)
    const balanceRequests = accountsToProcess.map(account => 
      this.accountsService.getTotalBalance(account.ID!).pipe(
        handleHttpErrorSilent(this.toastr, 'Error loading balance', { 
          totalBalance: 0, 
          totalDepositLastMonth: 0, 
          totalExpenseLastMonth: 0 
        })
      )
    );

    forkJoin(balanceRequests).subscribe({
      next: (balances) => {
        // Toplam bakiye (TL cinsinden)
        this.totalBalance = balances.reduce((sum, bal) => sum + (bal.totalBalance || 0), 0);

        // Son 1 aylık harcama ve yükleme (TL cinsinden - endpoint'ten direkt geliyor)
        this.monthlyExpense = balances.reduce((sum, bal) => sum + (bal.totalExpenseLastMonth || 0), 0);
        this.monthlyLoad = balances.reduce((sum, bal) => sum + (bal.totalDepositLastMonth || 0), 0);

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  formatPrice(tl: number): string {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(tl);
  }
}

