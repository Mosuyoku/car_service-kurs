import { CsValidators } from './../../shared-module/validators/cs-validators';
import { CarTableRowComponent } from './../car-table-row/car-table-row.component';
import { CostSharedService } from './../cost-shared.service';
import { Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { Car } from '../models/car';
import { TotalCostComponent } from '../total-cost/total-cost.component';
import { CarsService } from '../cars.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'cs-cars-list',
  templateUrl: './cars-list.component.html',
  styleUrls: ['./cars-list.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class CarsListComponent implements OnInit, AfterViewInit {
  @ViewChild('totalCostRef') totalCostRef: TotalCostComponent;
  @ViewChildren(CarTableRowComponent) carRows: QueryList<CarTableRowComponent>;
  totalCost: number;
  grossCost: number;
  cars: Car[];
  carForm: FormGroup;

  constructor(private carsService: CarsService,
              private router: Router,
              private formBuilder: FormBuilder,
              private costSharedService: CostSharedService){  }


  ngOnInit(): void {
    this.loadCars();
    this.carForm = this.buildCarForm();
  }

  ngAfterViewInit(): void {
    this.totalCostRef.showGross();
    this.carRows.changes.subscribe(() => {
      if (this.carRows.first.car.clientSurname === 'Kowalski') {
        console.log('Warning, Client Kowalski is next queue, better go to holidays');
      }
    });
  }

  buildCarForm(): FormGroup {
    return this.formBuilder.group({
      model: ['', Validators.required],
      type: '',
      year: '',
      color: '',
      cost: '',
      isFullyDamaged: '',
      clientFirstName: '',
      clientSurname: '',
      power: ['', CsValidators.power],
      plate: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(7)]],
      deliveryDate: '',
      deadline: ''
    });
  }

  togglePlateValidity(): void {
    const damageControl = this.carForm.get('isFullyDamaged');
    const plateControl = this.carForm.get('plate');

    if (damageControl.value) {
      plateControl.clearValidators();
    } else {
      plateControl.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(7)]);
    }

    plateControl.updateValueAndValidity();
  }

  loadCars(): void {
      this.carsService.getCars().subscribe((cars) => {
        this.cars = cars;
        this.countTotalCost();
        this.costSharedService.shareCost(this.totalCost);
      });
  }

  goToCarDetails(car: Car): void{
    this.router.navigate(['/cars', car.id]);
  }

  showGross(): void {
    this.totalCostRef.showGross();
  }

  countTotalCost(): void {
    this.totalCost = this.cars
      .map((car) => car.cost)
      .reduce((prev, next) => prev + next);
  }

  onShownGross(grossCost: number): void{
    this.grossCost = grossCost;
  }

  addCar(): void {
    this.carsService.addCar(this.carForm.value).subscribe(() => {
      this.loadCars();
    });
  }

  onRemovedCar(car: Car): void{
    this.carsService.removeCar(car.id).subscribe(() => {
      this.loadCars();
    });
  }
}
