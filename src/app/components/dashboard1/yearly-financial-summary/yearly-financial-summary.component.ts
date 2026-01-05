import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
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
import { CafeteriaAccountsService } from 'src/app/services/cafeteria-accounts.service';
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
export class AppYearlyFinancialSummaryComponent implements OnInit {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);
  public yearlyFinancialSummaryChart!: Partial<yearlyFinancialSummaryChart> | any;
  isLoading: boolean = false;

  constructor(private accountsService: CafeteriaAccountsService) {
    this.initializeChart();
  }

  ngOnInit(): void {
    this.loadYearlyData();
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
            }).format(val / 100) + ' ₺';
          }
        }
      },
      yaxis: {
        labels: {
          formatter: (val: number) => {
            return new Intl.NumberFormat('tr-TR', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(val / 100) + ' ₺';
          }
        }
      }
    };
  }

  loadYearlyData(): void {
    this.isLoading = true;

    this.accountsService.getMyAccounts().pipe(
      catchError(() => of({ status: 'error', records: [] }))
    ).subscribe({
      next: (accountsResponse) => {
        if (accountsResponse.status === 'success' && accountsResponse.records && accountsResponse.records.length > 0) {
          const accounts = accountsResponse.records;
          
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
          const monthlyData = new Map<string, { successfulLoad: number; failedLoad: number; expense: number }>();
          months.forEach(m => {
            const key = `${m.year}-${m.month}`;
            monthlyData.set(key, { successfulLoad: 0, failedLoad: 0, expense: 0 });
          });

          // Her hesap için işlemleri al
          const transactionRequests = accounts.map(account =>
            forkJoin({
              payments: this.accountsService.getAccountPaymentransactions(account.ID!).pipe(
                catchError(() => of([]))
              ),
              events: this.accountsService.getAccountCafeteriaEventTransactions(account.ID!).pipe(
                catchError(() => of([]))
              )
            })
          );

          forkJoin(transactionRequests).subscribe({
            next: (transactions) => {
              transactions.forEach((transactionData) => {
                // Yüklemeler (Payments - başarılı ve başarısız ödemeler)
                if (transactionData.payments && Array.isArray(transactionData.payments)) {
                  transactionData.payments.forEach((payment: any) => {
                    if (payment.Amount) {
                      let paymentDate: Date | null = null;

                      if (payment.PaymentOfVirtualPos?.ProcessTime) {
                        paymentDate = new Date(payment.PaymentOfVirtualPos.ProcessTime);
                      } else if (payment.Provision) {
                        const provisionDate = new Date(payment.Provision);
                        if (!isNaN(provisionDate.getTime())) {
                          paymentDate = provisionDate;
                        }
                      }

                      if (paymentDate) {
                        const year = paymentDate.getFullYear();
                        const month = paymentDate.getMonth();
                        const key = `${year}-${month}`;
                        
                        if (monthlyData.has(key)) {
                          const data = monthlyData.get(key)!;
                          // Başarılı ödemeler (ResultStatus === '1')
                          if (payment.ResultStatus === '1') {
                            data.successfulLoad += payment.Amount || 0;
                          } else {
                            // Başarısız ödemeler (ResultStatus !== '1')
                            data.failedLoad += payment.Amount || 0;
                          }
                        }
                      }
                    }
                  });
                }

                // Harcamalar (CafeteriaEvents - TotalPrice)
                if (transactionData.events && Array.isArray(transactionData.events)) {
                  transactionData.events.forEach((event: any) => {
                    if (event.EventTime && event.TotalPrice) {
                      const eventDate = new Date(event.EventTime);
                      const year = eventDate.getFullYear();
                      const month = eventDate.getMonth();
                      const key = `${year}-${month}`;
                      
                      if (monthlyData.has(key)) {
                        const data = monthlyData.get(key)!;
                        data.expense += event.TotalPrice || 0;
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
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}

