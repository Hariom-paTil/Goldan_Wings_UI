import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Cake } from '../Interfaces/cake.interface';
import { CustomCakeData } from '../Interfaces/custom-cake-data.interface';

@Injectable({
  providedIn: 'root',
})
export class CustomCakeService {
  private customizeBase = 'https://localhost:7196/api/CakeCustomize';

  constructor(private http: HttpClient) { }

  getCustomCakeList(): Observable<CustomCakeData[]> {
    return this.http.get<CustomCakeData[]>('https://localhost:7196/api/CustomCake');
  }

  addCustomCake(payload: Partial<CustomCakeData>): Observable<CustomCakeData> {
    return this.http.post<CustomCakeData>('https://localhost:7196/api/CustomCake/AddCakes', payload);
  }

  getCustomCakes(limit: number = 12): Observable<Cake[]> {
    return this.getCustomCakeList().pipe(
      map((items) => {
        return items.slice(0, limit).map((it) => ({
          id: it.customCakePK,
          name: it.cakeName,
          flavor: it.flower ? `Flower: ${it.flower}` : undefined,
          imageUrl: this.normalizeImage(it.imageUrl || '', it.cakeId === 101 ? 10 : 1),
          price: 25, // Default price
        }));
      }),
      catchError(() => of(this.fallbackCakes(limit)))
    );
  }

  getSeparatedCakes(): Observable<{ imageCakes: Cake[]; normalCakes: Cake[] }> {
    return this.getCustomCakeList().pipe(
      map((items) => {
        const imageCakesRaw = items.filter((x) => x.cakeId === 101);
        const normalCakesRaw = items.filter((x) => x.cakeId !== 101);

        const mapToCake = (list: CustomCakeData[]) =>
          list.map((it) => ({
            id: it.customCakePK,
            name: it.cakeName,
            flavor: it.flower ? `Flower: ${it.flower}` : undefined,
            imageUrl: this.normalizeImage(it.imageUrl || '', it.cakeId === 101 ? 10 : 1),
            price: 25,
          }));

        return {
          imageCakes: mapToCake(imageCakesRaw),
          normalCakes: mapToCake(normalCakesRaw),
        };
      }),
      catchError(() =>
        of({
          imageCakes: [],
          normalCakes: this.fallbackCakes(12),
        })
      )
    );
  }

  private normalizeImage(src: string, index: number): string {
    let clean = (src || '').trim();
    clean = clean.replace(/assest/gi, 'assets');
    clean = clean.replace(/\\/g, '/');

    if (!clean) return `/assets/Img/img-${index}.jpg`;

    if (/^https?:\/\//i.test(clean)) {
      const assetsIndex = clean.toLowerCase().indexOf('/assets/');
      if (assetsIndex >= 0) {
        let sub = clean.substring(assetsIndex);
        sub = sub.replace(/\/assets\/img\//i, '/assets/Img/');
        return sub;
      }
      return clean;
    }

    if (clean.startsWith('/assets/')) {
      return clean.replace(/\/assets\/img\//i, '/assets/Img/');
    }
    if (clean.startsWith('assets/')) return `/${clean.replace(/assets\/img\//i, 'assets/Img/')}`;

    if (clean.startsWith('/')) return `https://localhost:7196${clean}`;

    if (/^(uploads|images|files)\//i.test(clean)) {
      return `https://localhost:7196/${clean}`;
    }

    return `/assets/Img/${clean}`;
  }

  private parsePrice(val: any): number | null {
    if (val === null || val === undefined) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  }

  private fallbackCakes(limit: number): Cake[] {
    return Array.from({ length: limit }, (_, i) => ({
      id: i + 1,
      name: `Cake ${i + 1}`,
      flavor: i % 2 === 0 ? 'Chocolate' : 'Vanilla',
      imageUrl: `/assets/Img/img-${i + 1}.jpg`,
      price: Math.round(10 + Math.random() * 40),
    }));
  }
}
