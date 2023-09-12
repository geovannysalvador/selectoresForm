import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interface';
import { count, filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styleUrls: ['./selector-page.component.css']
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegion:SmallCountry[] = [];
  public borders:SmallCountry[]= [];

  public myForm:FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required],
  })



  constructor(
    private fb:FormBuilder,
    private countriesService:CountriesService,
    ){}

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }

  get regions(): Region[]{
    return this.countriesService.regions;
  }

  onRegionChanged():void{
    this.myForm.get('region')!.valueChanges
    .pipe(
      //Para el reinicio del segundo formulario
      // Tap es para efectos secundarios
      tap( () => this.myForm.get('country')!.setValue('') ),
      tap( () => this.borders = [] ),
      // es para tomar el valor anterior y suscribbirse al nuevo.
      switchMap(region => this.countriesService.getCountriesByRegion(region))
    )
    .subscribe(region =>{
      this.countriesByRegion = region;
    });
  }

  onCountryChanged():void{
    this.myForm.get('country')!.valueChanges
    .pipe(
      //Para el reinicio del segundo formulario
      tap( () => this.myForm.get('border')!.setValue('') ),
      // condicional sino no sale de ahi
      filter( (value:string) => value.length >0 ),
      switchMap(alphaCode => this.countriesService.getCountryByCode(alphaCode)),
      switchMap( country =>  this.countriesService.getCountryBordersByCodes( country.borders )),
    )
    .subscribe(countries =>{
      this.borders = countries ;
    });
  }

}
