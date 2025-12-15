import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Cake } from '../Interfaces/cake.interface';

@Injectable({ providedIn: 'root' })
export class CakeService {
  // Prefer backend API if available; fallback to local assets.
  private base = 'https://localhost:7196/api/Cakes';

  constructor(private http: HttpClient) {}

  getCakes(limit = 10): Observable<Cake[]> {
    return this.http
      .get<any[]>(`${this.base}?limit=${limit}`)
      .pipe(
        map((items) =>
          (items || [])
            .slice(0, limit)
            .map((it: any, i: number) => ({
              id: it.id ?? i + 1,
              name: it.name ?? it.title ?? `Cake ${i + 1}`,
              flavor: it.flavor ?? it.flavour ?? undefined,
              imageUrl: this.normalizeImage(it.imageUrl ?? it.image ?? '', i + 1),
              price: it.price ?? Math.round(10 + Math.random() * 40),
            }))
        ),
        catchError(() => of(this.fallbackCakes(limit)))
      );
  }

  private normalizeImage(src: string, index: number) {
    // Default to the existing assets (folder 'Img' contains img-1.jpg ... img-10.jpg)
    if (!src) return `/assets/Img/img-${index}.jpg`;
    const file = src.split('/').pop() || src;
    // If API returned a filename like 'img-1.jpg' or 'cake1.jpg', prefer assets/Img
    if (!/^https?:\/\//i.test(src) && !src.startsWith('/')) {
      return `/assets/Img/${file}`;
    }
    // normalize lowercase folder to actual 'Img'
    if (src.startsWith('/assets/img/')) return src.replace('/assets/img/', '/assets/Img/');
    return src;
  }

  // Fallback local data when API is not available
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
