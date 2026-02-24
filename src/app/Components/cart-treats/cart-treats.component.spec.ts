import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartTreatsComponent } from './cart-treats.component';

describe('CartTreatsComponent', () => {
  let component: CartTreatsComponent;
  let fixture: ComponentFixture<CartTreatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartTreatsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CartTreatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
