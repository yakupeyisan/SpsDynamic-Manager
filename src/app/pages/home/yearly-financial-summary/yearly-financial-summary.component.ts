import { Component, ViewChild, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import {
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexLegend,
  ApexStroke,
  ApexTooltip,
  ApexAxisChartSeries,
  ApexPlotOptions,
  NgApexchartsModule,
  ApexFill,
  ApexYAxis,
} from 'ng-apexcharts';
import { CafeteriaAccountsService, EventsForGraphResponse, CafeteriaAccount } from 'src/app/services/cafeteria-accounts.service';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface yearlyFinancialSummaryChart {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  fill: ApexFill;
  yaxis: ApexYAxis;
}

@Component({
  selector: 'app-yearly-financial-summary',
  standalone: true,
  imports: [CommonModule, MaterialModule, TablerIconsModule, NgApexchartsModule],
  templateUrl: './yearly-financial-summary.component.html',
})
export class AppYearlyFinancialSummaryComponent implements OnInit, OnChanges {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  @Input() accountId: number = 0; // 0 = Tümü
  @Input() accounts: CafeteriaAccount[] = []; // Parent component'ten gelecek
  public yearlyFinancialSummaryChart!: Partial<yearlyFinancialSummaryChart> | any;
  isLoading: boolean = false;

  constructor(private accountsService: CafeteriaAccountsService) {
    this.initializeChart();
  }

  ngOnInit(): void {
    // Accounts parent component'ten gelecek, bu yüzden burada yükleme yapmıyoruz
    // ngOnChanges'de accounts geldiğinde otomatik yüklenecek
  }

  ngOnChanges(changes: SimpleChanges): void {
    // accountId değiştiğinde veya accounts ilk kez yüklendiğinde/yüklendiğinde çağır
    if ((changes['accountId'] && !changes['accountId'].firstChange) || 
        (changes['accounts'] && changes['accounts'].currentValue && changes['accounts'].currentValue.length > 0)) {
      this.loadYearlyData();
    }
  }

  initializeChart(): void {
    this.yearlyFinancialSummaryChart = {
      series: [
        {
          name: 'Başarılı Yükleme',
          data: [],
        },
        {
          name: 'Başarısız Yükleme',
          data: [],
        },
        {
          name: 'Harcama',
          data: [],
        },
      ],

      chart: {
        type: 'area',
        fontFamily: 'inherit',
        foreColor: '#adb0bb',
        toolbar: {
          show: false,
        },
        height: 300,
        width: '100%',
        stacked: false,
        offsetX: -10,
      },
      colors: ['#28a745', '#ffc107', '#dc3545'], // Yeşil: Başarılı Yükleme, Sarı: Başarısız Yükleme, Kırmızı: Harcama
      stroke: {
        width: 2,
        curve: 'monotoneCubic',
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      grid: {
        show: true,
        padding: {
          top: 0,
          bottom: 0,
        },
        borderColor: 'rgba(0,0,0,0.05)',
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 0,
          inverseColors: false,
          opacityFrom: 0.45,
          opacityTo: 0,
          stops: [20, 180],
        },
      },
      xaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        categories: [],
      },
      markers: {
        strokeColor: ['#28a745', '#ffc107', '#dc3545'],
        strokeWidth: 2,
      },
      tooltip: {
        theme: 'dark',
        x: {
          show: false,
        },
        y: {
          formatter: (val: number) => {
            return new Intl.NumberFormat('tr-TR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(val) + ' ₺';
          }
        }
      },
      yaxis: {
        labels: {
          formatter: (val: number) => {
            return new Intl.NumberFormat('tr-TR', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(val) + ' ₺';
          }
        }
      }
    };
  }

  loadYearlyData(): void {
    this.isLoading = true;

    // Accounts listesi parent component'ten geliyor, tekrar çekmeye gerek yok
    if (!this.accounts || this.accounts.length === 0) {
      // Veri yoksa grafiği temizle
      this.yearlyFinancialSummaryChart.series = [
        { name: 'Başarılı Yükleme', data: [] },
        { name: 'Başarısız Yükleme', data: [] },
        { name: 'Harcama', data: [] },
      ];
      this.yearlyFinancialSummaryChart.xaxis.categories = [];
      this.isLoading = false;
      return;
    }

    // AccountId'ye göre filtrele
    const accountsToProcess = this.accountId === 0 
      ? this.accounts 
      : this.accounts.filter(acc => acc.ID === this.accountId);

    if (accountsToProcess.length === 0) {
            // Veri yoksa grafiği temizle
            this.yearlyFinancialSummaryChart.series = [
              { name: 'Başarılı Yükleme', data: [] },
              { name: 'Başarısız Yükleme', data: [] },
              { name: 'Harcama', data: [] },
            ];
            this.yearlyFinancialSummaryChart.xaxis.categories = [];
            this.isLoading = false;
            return;
          }
          
          // Son 12 ay verilerini topla
          const months: { year: number; month: number; label: string }[] = [];
          const currentDate = new Date();
          
          for (let i = 11; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
            months.push({
              year: date.getFullYear(),
              month: date.getMonth(),
              label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`
            });
          }

          // Aylık veriler için Map (key: "YYYY-MM" -> { successfulLoad: 0, failedLoad: 0, expense: 0 })
          // Amount TL cinsinden geldiği için kuruş'a çevirmemize gerek yok
          const monthlyData = new Map<string, { successfulLoad: number; failedLoad: number; expense: number }>();
          months.forEach(m => {
            const key = `${m.year}-${m.month}`;
            monthlyData.set(key, { successfulLoad: 0, failedLoad: 0, expense: 0 });
          });

          // Her hesap için EventsForGraph endpoint'ini çağır
          const graphRequests = accountsToProcess.map(account =>
            this.accountsService.getAccountEventsForGraph(account.ID!).pipe(
              catchError(() => of({ data: [], count: 0 } as EventsForGraphResponse))
            )
          );

          forkJoin(graphRequests).subscribe({
            next: (graphResponses) => {
              graphResponses.forEach((response) => {
                if (response.data && Array.isArray(response.data)) {
                  response.data.forEach((item) => {
                    // TransactionDate formatı: "YYYY-MM-DD"
                    const dateParts = item.TransactionDate.split('-');
                    if (dateParts.length === 3) {
                      const year = parseInt(dateParts[0], 10);
                      const month = parseInt(dateParts[1], 10) - 1; // JavaScript month 0-indexed
                      const key = `${year}-${month}`;
                      
                      if (monthlyData.has(key)) {
                        const data = monthlyData.get(key)!;
                        const amount = Math.abs(item.Amount) * 100; // TL'den kuruş'a çevir (grafik kuruş bekliyor)
                        
                        if (item.PaymentStatus === 'Başarılı') {
                          data.successfulLoad += amount;
                        } else if (item.PaymentStatus === 'Başarısız') {
                          data.failedLoad += amount;
                        } else if (item.PaymentStatus === 'Harcama') {
                          data.expense += amount;
                        }
                      }
                    }
                  });
                }
              });

              // Grafiği güncelle
              const successfulLoadData = months.map(m => {
                const key = `${m.year}-${m.month}`;
                return monthlyData.get(key)!.successfulLoad;
              });
              const failedLoadData = months.map(m => {
                const key = `${m.year}-${m.month}`;
                return monthlyData.get(key)!.failedLoad;
              });
              const expenseData = months.map(m => {
                const key = `${m.year}-${m.month}`;
                return monthlyData.get(key)!.expense;
              });

              this.yearlyFinancialSummaryChart.series = [
                {
                  name: 'Başarılı Yükleme',
                  data: successfulLoadData,
                },
                {
                  name: 'Başarısız Yükleme',
                  data: failedLoadData,
                },
                {
                  name: 'Harcama',
                  data: expenseData,
                },
              ];

              this.yearlyFinancialSummaryChart.xaxis.categories = months.map(m => m.label);

              this.isLoading = false;
            },
            error: () => {
              this.isLoading = false;
            }
          });
  }
}

