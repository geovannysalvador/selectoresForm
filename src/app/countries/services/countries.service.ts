import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country.interface';
import { Observable, combineLatest, count, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseUrl:string = 'https://restcountries.com/v3.1'

  private _regions:Region[] = [ Region.Africa, Region.Americas, Region.Asia, Region.Europa, Region.Oceania ];

  constructor(
    private http:HttpClient
  ) { }

  get regions():Region[] {
    return [ ...this._regions ];
  }

  getCountriesByRegion(region:Region):Observable<SmallCountry[]> {

    //para regresar algo necesitamos que sea un observable. implementamos of para que se pueda implementar
    if(!region) return of ([]);

    const url: string = `${this.baseUrl}/region/${region}?fields=cca3,name,borders`

    return this.http.get<Country[]>(url)
      .pipe(
        map( countries => countries.map(country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        }))),
        // tap( response => console.log({response})
        // )
      )
  }

  getCountryByCode(alphaCode:string):Observable<SmallCountry>{
    const url:string = `${this.baseUrl}/alpha/${alphaCode}?fields=cca3,name,borders`

    return this.http.get<Country>(url)
      .pipe(
        map( country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        }))
      )
  }

  // Para obtener los nombres, no solo los codigos y pintarlos
  getCountryBordersByCodes(borders:string[]):Observable<SmallCountry[]>{
    if (!borders || borders.length === 0) return of ([]);

    const countriesRequest:Observable<SmallCountry>[] = [];
    borders.forEach(code => {
      const request = this.getCountryByCode(code);

      countriesRequest.push(request);
    })

    // emite hasta que los obseevables emitan un valor
    return combineLatest(countriesRequest)
  }

}
