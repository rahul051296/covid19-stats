import { Component } from '@angular/core';
import { ApiService } from './api.service';

import { ChartType, ChartOptions, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import * as outlabels from 'chartjs-plugin-piechart-outlabels';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  infectedData: Array<any> = [];
  recoveredData: Array<any> = [];

  public barChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      position: 'bottom',
    },
    plugins: {
      datalabels: {
        color: "#000",
        anchor: "end"
      }
    },
    // We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{}], yAxes: [{}] },
  };
  public barChartLabels: any = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  
  public barChartData: ChartDataSets[] = [];
  topCountries: any = [];

  // Pie
  public pieChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      position: 'bottom',
    },
    animation: {
      duration: 500
    },
    plugins: {
      datalabels: {
        formatter: (value, ctx) => {
          let sum = 0;
          const label = ctx.chart.data.labels[ctx.dataIndex]
          let dataArr: Array<any> = ctx.chart.data.datasets[0].data;
          dataArr.map(data => {
            sum += data;
          });
          let percentage = (value * 100 / sum).toFixed(2) + "%";
          return label + ": " + percentage;
        },
        color: '#000',
        backgroundColor: "#fff",
        borderColor: "#000",
        clamp: true
      },
    }
  };
  public pieChartLabels: Label[] = [['Infected'], ['Deaths'], ['Recovered']];
  public pieChartData: number[] = [300, 500, 100];
  public pieChartType: ChartType = 'pie';
  public pieChartPlugins = [pluginDataLabels];
  public pieChartLegend = true;
  public pieChartColors = [
    {
      backgroundColor: ['#ffc107ab', '#dc3545ab', '#28a745ab'],
    },
  ];

  masterList: Array<any>;
  counts: any = {
    confirmed: 0,
    infected: 0,
    deaths: 0,
    recovered: 0
  };
  countryList: any;
  selectedCountry: string;
  flags: any = {}
  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.getCovidData();
    this.selectedCountry = "All";
  }

  getCovidData() {
    this.flags.isDataLoaded = false;
    this.apiService.getCovid19Data().subscribe(response => {
      this.getTotalCases(response);
      this.getCountryList();
      this.getBarChartData();
      this.flags.isDataLoaded = true;
    })
  }

  getTotalCases(response) {
    this.masterList = response && response.data && response.data.covid19Stats && response.data.covid19Stats.length ? response.data.covid19Stats : [];
    this.masterList.map(covidData => {
      this.counts.confirmed += covidData.confirmed;
      this.counts.deaths += covidData.deaths;
      this.counts.recovered += covidData.recovered;
    });
    this.counts.infected += this.counts.confirmed - (this.counts.recovered + this.counts.deaths);

    this.updatePieChart();
  }

  updatePieChart() {
    this.pieChartData = [];
    this.counts.infected = this.counts.confirmed - (this.counts.recovered + this.counts.deaths);
    this.pieChartData.push(this.counts.infected);
    this.pieChartData.push(this.counts.deaths);
    this.pieChartData.push(this.counts.recovered);
  }
  getCasesByCountry(country) {
    if (country && country.length) {
      this.flags.isDataLoaded = false;
      this.resetCount();
      this.masterList.map(covidData => {
        if (covidData.country == country) {
          this.counts.confirmed += covidData.confirmed;
          this.counts.deaths += covidData.deaths;
          this.counts.recovered += covidData.recovered;
        }
      });
      this.counts.infected += this.counts.confirmed - (this.counts.recovered + this.counts.deaths);

      this.updatePieChart();
      this.flags.isDataLoaded = true;
    }
  }

  getCasesByLocation(location) {
    let countryCount: any = {
      confirmed: 0,
      infected: 0,
      deaths: 0,
      recovered: 0
    }
    if (location && location.length) {
      this.masterList.map(covidData => {
        if (covidData.country == location) {
          countryCount.confirmed += covidData.confirmed;
          countryCount.deaths += covidData.deaths;
          countryCount.recovered += covidData.recovered;
        }
      });
      countryCount.infected += countryCount.confirmed - (countryCount.recovered + countryCount.deaths);

    }
    return countryCount;
  }

  resetCount() {
    this.counts.confirmed = 0;
    this.counts.infected = 0;
    this.counts.deaths = 0;
    this.counts.recovered = 0;

  }
  getCountryList() {
    let country = new Set();
    this.masterList.map(covidData => {
      country.add(covidData.country);
    });
    this.topCountries = [...Array.from(country)].splice(0, 5);
    this.countryList = Array.from(country).sort();
  }

  getBarChartData() {
    this.barChartLabels = this.topCountries;
    this.barChartLabels.map(country => {
      let countryData = this.getCasesByLocation(country);
      countryData.infected = countryData.confirmed - (countryData.recovered + countryData.deaths);
      this.infectedData.push(countryData.infected);
      this.recoveredData.push(countryData.recovered);
    });
    this.barChartData = [
      { data: this.infectedData, label: 'Infected' },
      { data: this.recoveredData, label: 'Recovered' }
    ];
  }

  getAllCases() {
    this.resetCount();
    this.masterList.map(covidData => {
      this.counts.confirmed += covidData.confirmed;
      this.counts.deaths += covidData.deaths;
      this.counts.recovered += covidData.recovered;
    });
    this.counts.infected = this.counts.confirmed - (this.counts.deaths + this.counts.recovered);
    this.updatePieChart();

  }

  onChangeCountry() {
    if (this.selectedCountry.toLowerCase() == "all") {
      this.getAllCases();
    } else {
      this.getCasesByCountry(this.selectedCountry);
    }

  }
}
