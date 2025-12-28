import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cake } from '../Interfaces/cake.interface';
import { CakesService } from './cakes.service';
import { CustomCakeService } from './custom-cake.service';

@Injectable({ providedIn: 'root' })
export class CakeService {
  constructor(private cakes: CakesService, private custom: CustomCakeService) {}

  getCakes(limit: number = 10): Observable<Cake[]> {
    return this.cakes.getCakes(limit);
  }

  getCustomCakes(limit: number = 12): Observable<Cake[]> {
    return this.custom.getCustomCakes(limit);
  }
}
