import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import * as Highcharts from 'highcharts';
import Highcharts3d from 'highcharts/highcharts-3d'

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  flags: any = {};
  updateFlag: boolean;
  selectedCountry: string;
  pieChartOptions: any;
  columnChartOptions: any;
  data: any = {
    countryList: [],
    stats: [],
    total: 0,
    active: 0,
    recovered: 0,
    deaths: 0,
    new: ''
  };

  Highcharts = Highcharts;

  constructor(private apiService: ApiService) {
    Highcharts3d(Highcharts);
  }

  ngOnInit() {
    this.selectedCountry = "All";
    this.initializePieChart();
    this.initializeColumnChart();
    this.getCovidCountryList();
    this.getCovidStats();
  }


  initializeColumnChart() {
    this.columnChartOptions = {
      chart: {
        type: 'column',
        options3d: {
          enabled: true,
          alpha: 15,
          beta: 15,
          depth: 50,
          viewDistance: 25
        }
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: [
        ],
        crosshair: true
      },
      yAxis: {
        type: 'logarithmic',
        title: {
          text: 'Cases'
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b>{point.y}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
      },
      plotOptions: {
        column: {
          depth: 35,
          pointPadding: 0.2,
          borderWidth: 0
        }
      },
      series: []
    }
  }

  initializePieChart() {
    this.pieChartOptions = {
      chart: {
        type: 'pie',
        options3d: {
          enabled: true,
          alpha: 45,
          beta: 0
        }
      },
      title: {
        text: ""
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.y} cases</b>'
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      plotOptions: {
        pie: {
          cursor: 'pointer',
          animation: false,
          depth: 35,
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %'
          },
          showInLegend: true,
        }
      },
      series: [],
      responsive: {
        rules: [{
          condition: {
            maxWidth: 768
          },
          chartOptions: {
            legend: {
              enabled: true
            },
            plotOptions: {
              pie: {
                cursor: 'pointer',
                animation: false,
                depth: 35,
                dataLabels: {
                  alignTo: 'connectors',
                  enabled: true,
                  format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                },
                showInLegend: true,
              }
            },
          }
        }]
      }
    }
  }

  getCovidCountryList() {
    this.flags.isCountryListLoaded = false;
    this.apiService.getCovid19CountryList().subscribe((response: any) => {
      this.data.countryList = response && response.response && response.response.length ? response.response : [];
      this.flags.isCountryListLoaded = true;
    })
  }

  getCovidStats() {
    this.flags.isStatsLoaded = false;
    this.flags.isError = false;
    this.apiService.getCovid19Stats().subscribe((response: any) => {
      this.data.stats = response && response.response && response.response.length ? response.response : [];
      this.getStatsByCountry('all');
      this.updateCaseTrendsChart();
      this.flags.isStatsLoaded = true;
    }, (error) => {
      this.flags.isError = true;
    });
  }

  getStatsByCountry(country: string) {
    if (this.data.stats && this.data.stats.length) {
      this.data.stats.map((item, index) => {
        if (item.country.toLowerCase() == country.toLowerCase()) {
          console.log(item);
          this.data.total = item.cases.total;
          this.data.active = item.cases.active;
          this.data.recovered = item.cases.recovered;
          this.data.deaths = item.deaths.total;
          this.data.new = item.cases.new ? item.cases.new : 0;
          this.data.critical = item.cases.critical ? item.cases.critical : 0;
          this.data.newDeaths = item.deaths.new ? item.deaths.new : 0;
        }
      })
    }
    this.updateOverviewChart();
  }

  updateOverviewChart() {
    this.pieChartOptions.series = [{
      name: 'COVID-19',
      colorByPoint: true,
      data: [{
        name: 'Active Cases',
        y: this.data.active,
        color: 'rgba(0, 123, 255, .8)'
      }, {
        name: 'Deaths',
        y: this.data.deaths,
        color: 'rgba(255, 7, 58, .8)'
      }, {
        name: 'Recovered',
        y: this.data.recovered,
        color: 'rgba(136, 213, 156, .8)'
      }]
    }];
    this.flags.updateFlag = true;
  }

  updateCaseTrendsChart() {
    let topCountries = [ ... this.data.stats ];
    topCountries = topCountries.splice(0,5);
    let cases = {
      active: [],
      recovered: [],
      deaths: []
    }
    topCountries.map(country => {
      this.columnChartOptions.xAxis.categories.push(country.country);
      cases.active.push(country.cases.active);
      cases.recovered.push(country.cases.recovered);
      cases.deaths.push(country.deaths.total);
    });
    this.columnChartOptions.series = [{
      name: 'Active Cases',
      data: cases.active,
      color: 'rgba(0, 123, 255, 1)'
    }, {
      name: 'Deaths',
      data: cases.deaths,
      color: 'rgba(255, 7, 58, 1)'
    },
    {
      name: 'Recovered',
      data: cases.recovered,
      color: 'rgba(136, 213, 156, 1)'

    },]

  }

  onChangeCountry() {
    this.getStatsByCountry(this.selectedCountry);
  }

}
