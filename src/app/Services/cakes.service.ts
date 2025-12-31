import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Cake } from '../Interfaces/cake.interface';

@Injectable({
  providedIn: 'root',
})
export class CakesService {
  private base = 'https://localhost:7196/api/Cakes';
  private createBase = 'http://localhost:5003/api/Cakes';

  constructor(private http: HttpClient) {}

  getCakes(limit: number = 10): Observable<Cake[]> {
    return this.http.get<any[]>(`${this.base}?limit=${limit}`).pipe(
      map((items: any[]) =>
        (items || []).slice(0, limit).map((it: any, i: number) => ({
          id: it.id ?? i + 1,
          name: it.name ?? it.title ?? `Cake ${i + 1}`,
          flavor: it.flavor ?? it.flavour ?? undefined,
          imageUrl: this.normalizeImage(it.imageUrl ?? it.image ?? '', i + 1),
          price: this.parsePrice(it.price) ?? Math.round(10 + Math.random() * 40),
        }))
      ),
      catchError(() => of(this.fallbackCakes(limit)))
    );
  }

  addCake(payload: { flavor: string; name: string; price: number; imageUrl: string }): Observable<any> {
    return this.http.post(this.createBase, payload);
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
