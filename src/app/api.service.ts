import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseUrl: string = "https://covid-19-coronavirus-statistics.p.rapidapi.com/v1/";
  covidBaseUrl = "https://covid-193.p.rapidapi.com/"
  constructor(private http: HttpClient) { }

  getCovid19Data() {
    return this.http.get(this.baseUrl + 'stats', {
      headers: {
        "x-rapidapi-host": "covid-19-coronavirus-statistics.p.rapidapi.com",
        "x-rapidapi-key": "16c4042140mshf206cd74ee2903dp1622efjsnd448d87eb2c8"
      }
    });
  }

  getCovid19CountryList() {
    return this.http.get(this.covidBaseUrl + "countries", {
      headers: {
        "x-rapidapi-host": "covid-193.p.rapidapi.com",
        "x-rapidapi-key": "16c4042140mshf206cd74ee2903dp1622efjsnd448d87eb2c8"
      }
    });
  }

  getCovid19Stats() {
    return this.http.get(this.covidBaseUrl + "statistics", {
      headers: {
        "x-rapidapi-host": "covid-193.p.rapidapi.com",
        "x-rapidapi-key": "16c4042140mshf206cd74ee2903dp1622efjsnd448d87eb2c8"
      }
    });
  }

}
