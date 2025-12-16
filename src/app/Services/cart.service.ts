import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cake } from '../Interfaces/cake.interface';

export interface CartItem {
  cake: Cake;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private items = new Map<number, CartItem>();
  private _items$ = new BehaviorSubject<CartItem[]>([]);
  readonly items$ = this._items$.asObservable();

  private _count$ = new BehaviorSubject<number>(0);
  readonly count$ = this._count$.asObservable();

  add(cake: Cake) {
    const id = cake.id ?? Math.floor(Math.random() * 1000000);
    const existing = this.items.get(id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.set(id, { cake, quantity: 1 });
    }
    this.sync();
  }

  remove(cakeId: number) {
    this.items.delete(cakeId);
    this.sync();
  }

  clear() {
    this.items.clear();
    this.sync();
  }

  private sync() {
    const arr = Array.from(this.items.values());
    this._items$.next(arr);
    const count = arr.reduce((s, it) => s + it.quantity, 0);
    this._count$.next(count);
  }
}
