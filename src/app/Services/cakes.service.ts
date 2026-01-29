import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Cake } from '../Interfaces/cake.interface';

@Injectable({
  providedIn: 'root',
})
export class CakesService {
  private base = 'http://localhost:5003/api/Cakes';
  private createBase = 'http://localhost:5003/api/Cakes';
  private placeholder = '/assets/Img/img-1.jpg';
  private uploadUrl = 'http://localhost:3000/upload';

  constructor(private http: HttpClient) { }

  getCakes(limit: number = 50): Observable<Cake[]> {
    return this.http.get<any[]>(this.base).pipe(
      map((items: any[]) => {
        const mapped = (items || []).map((it: any, i: number) => ({
          id: this.parseId(it.id, i + 1),
          name: it.name ?? it.title ?? `Cake ${i + 1}`,
          flavor: it.flavor ?? it.flavour ?? undefined,
          imageUrl: this.normalizeImage(it.imageUrl ?? it.image ?? '', i + 1),
          price: this.parsePrice(it.price) ?? Math.round(10 + Math.random() * 40),
        }));

        const sorted = mapped.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        return sorted.slice(0, limit);
      }),
      catchError(() => of(this.fallbackCakes(limit)))
    );
  }

  private parseId(id: any, fallback: number): number {
    const num = Number(id);
    return isNaN(num) ? fallback : num;
  }

  uploadImage(file: File): Observable<{ path: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ path: string }>(this.uploadUrl, formData);
  }

  addCake(payload: { flavor: string; name: string; price: number; imageUrl: string }): Observable<any> {
    return this.http.post(this.createBase, payload);
  }

  private normalizeImage(src: string, index: number): string {
    let clean = (src || '').trim();
    clean = clean.replace(/assest/gi, 'assets');
    clean = clean.replace(/\\/g, '/');

    const imageLimit = 10; // number of images present in assets/Img

    // Ensure leading slash and normalized folder case
    const ensurePath = (path: string) => {
      const normalized = path.replace(/\/assets\/img\//i, '/assets/Img/').replace(/assets\/img\//i, 'assets/Img/');
      return normalized.startsWith('/') ? normalized : `/${normalized}`;
    };

    const mapToExistingImage = (path: string): string => {
      const match = path.match(/(img-)(\d+)(\.(jpg|jpeg|png|webp|gif))/i);
      if (!match) return path;
      const num = Number(match[2]);
      if (isNaN(num) || num <= imageLimit) return path;
      const mapped = ((num - 1) % imageLimit) + 1; // cycle through available images
      return path.replace(/img-\d+/i, `img-${mapped}`);
    };

    if (!clean) return this.placeholder;

    if (/^https?:\/\//i.test(clean)) {
      const assetsIndex = clean.toLowerCase().indexOf('/assets/');
      if (assetsIndex >= 0) {
        let sub = clean.substring(assetsIndex);
        sub = ensurePath(sub);
        sub = mapToExistingImage(sub);
        return sub;
      }
      return clean;
    }

    if (clean.startsWith('/assets/')) {
      const path = mapToExistingImage(ensurePath(clean));
      return path;
    }
    if (clean.startsWith('assets/')) {
      const path = mapToExistingImage(ensurePath(clean));
      return path;
    }

    if (clean.startsWith('/')) return mapToExistingImage(clean);

    if (/^(uploads|images|files)\//i.test(clean)) {
      return mapToExistingImage(clean);
    }

    const assetPath = mapToExistingImage(`/assets/Img/${clean}`);
    return assetPath;
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
