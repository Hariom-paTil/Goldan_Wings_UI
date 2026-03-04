
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Treat {
    itemName: string;
    category: string;
    price: number;
    description: string;
    itemImgUrl: string;
}

@Injectable({
    providedIn: 'root'
})
export class TreatsService {
    private apiUrl = 'https://localhost:7196/api/Treats';

    constructor(private http: HttpClient) { }

    addTreat(treat: Treat): Observable<Treat> {
        return this.http.post<Treat>(this.apiUrl, treat);
    }
}
