
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Treat {
    name: string;
    category: string;
    price: number;
    imageUrl: string;
    description: string;
    isPopular: boolean;
    createdAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class TreatsService {
    private apiUrl = 'https://localhost:7196/api/AddOnItems/AddOnItems';

    constructor(private http: HttpClient) { }

    addTreat(treat: Treat): Observable<Treat> {
        return this.http.post<Treat>(this.apiUrl, treat);
    }
}
