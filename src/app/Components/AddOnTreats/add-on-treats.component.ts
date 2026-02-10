

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../Services/cart.service';
import { Cake } from '../../Interfaces/cake.interface';
import { Subscription } from 'rxjs';

interface AddOnItem {
    id: number;
    name: string;
    category: string;
    price: number;
    image: string;
    description: string;
    isPopular?: boolean;
}

interface ComboItem {
    id: number;
    name: string;
    items: string[];
    originalPrice: number;
    discountPrice: number;
    image: string;
    saveAmount: number;
}

@Component({
    selector: 'app-add-on-treats',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './add-on-treats.component.html',
    styleUrls: ['./add-on-treats.component.scss']
})
export class AddOnTreatsComponent implements OnInit, OnDestroy {

    categories: string[] = ['All', 'Chocolates', 'Decorations', 'Snacks', 'Soft Drinks', 'Party Wear', 'Extras'];
    selectedCategory: string = 'All';

    // Sample Data
    items: AddOnItem[] = [
        { id: 1, name: 'Dairy Milk Silk', category: 'Chocolates', price: 180, image: 'assets/header_img.jpg', description: 'Smooth and creamy Cadbury Dairy Milk Silk chocolate.', isPopular: true },
        { id: 2, name: 'Ferrero Rocher (4pcs)', category: 'Chocolates', price: 149, image: 'assets/header_img.jpg', description: 'Crispy hazelnut and milk chocolate-covered wafer.', isPopular: true },
        { id: 3, name: 'KitKat Dessert', category: 'Chocolates', price: 60, image: 'assets/header_img.jpg', description: 'Classic KitKat wafer bar with a rich dessert twist.' },
        { id: 4, name: 'Birthday Spray', category: 'Decorations', price: 150, image: 'assets/header_img.jpg', description: 'Fun snow spray for birthday celebrations.' },
        { id: 5, name: 'Magic Candles', category: 'Decorations', price: 50, image: 'assets/header_img.jpg', description: 'Relighting magic candles that spark joy.', isPopular: true },
        { id: 6, name: 'Lays Chips (Salted)', category: 'Snacks', price: 20, image: 'assets/header_img.jpg', description: 'Classic salted potato chips, perfect for munching.' },
        { id: 7, name: 'Coca Cola (750ml)', category: 'Soft Drinks', price: 45, image: 'assets/header_img.jpg', description: 'Refreshing Coca Cola soft drink.' },
        { id: 8, name: 'Party Hats (Set of 5)', category: 'Party Wear', price: 120, image: 'assets/header_img.jpg', description: 'Colorful cone hats for the birthday squad.' },
        { id: 9, name: 'Cake Knife', category: 'Extras', price: 30, image: 'assets/header_img.jpg', description: 'Premium plastic cake cutting knife.' },
        { id: 10, name: 'Greeting Card', category: 'Extras', price: 50, image: 'assets/header_img.jpg', description: 'Beautiful greeting card with blank space for your message.' }
    ];

    combos: ComboItem[] = [
        { id: 101, name: 'Sweet Celebration', items: ['Cake (Selected)', 'Dairy Milk Silk', 'Snow Spray'], originalPrice: 830, discountPrice: 750, image: 'assets/header_img.jpg', saveAmount: 80 },
        { id: 102, name: 'Party Starter', items: ['Cake (Selected)', 'Coca Cola', 'Lays Chips'], originalPrice: 600, discountPrice: 550, image: 'assets/header_img.jpg', saveAmount: 50 }
    ];

    filteredItems: AddOnItem[] = [];

    // Modal State
    selectedItem: AddOnItem | ComboItem | null = null;
    isModalOpen: boolean = false;
    modalQuantity: number = 1;

    cartItems: CartItem[] = [];
    cartSub: Subscription | undefined;

    // ID Offset for mapped items to avoid conflict with cakes
    private readonly ID_OFFSET = 5000;

    constructor(private cartService: CartService) { }

    ngOnInit(): void {
        this.filterItems();
        this.cartSub = this.cartService.items$.subscribe(items => {
            this.cartItems = items;
        });
    }

    ngOnDestroy(): void {
        if (this.cartSub) this.cartSub.unsubscribe();
    }

    setCategory(category: string): void {
        this.selectedCategory = category;
        this.filterItems();
    }

    filterItems(): void {
        if (this.selectedCategory === 'All') {
            this.filteredItems = this.items;
        } else {
            this.filteredItems = this.items.filter(item => item.category === this.selectedCategory);
        }
    }

    private getMappedId(originalId: number): number {
        return this.ID_OFFSET + originalId;
    }

    getQuantity(originalId: number): number {
        const mappedId = this.getMappedId(originalId);
        const item = this.cartItems.find(i => i.cake.id === mappedId);
        return item ? item.quantity : 0;
    }

    addToCart(originalId: number, qtyChange: number = 1): void {
        const item = this.items.find(i => i.id === originalId) || this.combos.find(c => c.id === originalId);
        if (!item) return;

        const mappedId = this.getMappedId(originalId);
        const currentQty = this.getQuantity(originalId);
        const newQty = currentQty + qtyChange;

        // Check if we need to remove
        if (newQty <= 0) {
            if (currentQty > 0) this.cartService.remove(mappedId);
            return;
        }

        // Logic: 
        // If adding: use cartService.add() (which increments by 1) or loop if needed.
        // If removing: use cartService.decreaseQuantity().

        // Since cartService.add() increments by 1, and we might add custom qty via modal, 
        // it's slightly tricky. But for +/- buttons on card, qtyChange is usually 1 or -1.

        if (qtyChange > 0) {
            // If it's a new item or incrementing
            const cakeItem: Cake = {
                id: mappedId,
                name: item.name,
                price: this.isCombo(item) ? item.discountPrice : (item as AddOnItem).price,
                imageUrl: item.image,
                flavor: this.isCombo(item) ? 'Combo Bundle' : (item as AddOnItem).category,
                customData: { isAddOn: true, originalId: item.id }
            };
            // Add as many times as needed if qtyChange > 1 (e.g. from modal)
            for (let i = 0; i < qtyChange; i++) {
                this.cartService.add(cakeItem);
            }
        } else {
            // Decrement
            for (let i = 0; i < Math.abs(qtyChange); i++) {
                this.cartService.decreaseQuantity(mappedId);
            }
        }
    }

    // Modal Methods
    openModal(item: AddOnItem | ComboItem): void {
        this.selectedItem = item;
        // Get current cart quantity or default to 1
        const currentQty = this.getQuantity(item.id);
        this.modalQuantity = currentQty > 0 ? currentQty : 1;
        this.isModalOpen = true;
        document.body.style.overflow = 'hidden';
    }

    closeModal(): void {
        this.isModalOpen = false;
        this.selectedItem = null;
        document.body.style.overflow = '';
    }

    updateModalQuantity(change: number): void {
        const newQty = this.modalQuantity + change;
        if (newQty >= 1) {
            this.modalQuantity = newQty;
        }
    }

    isCombo(item: any): item is ComboItem {
        return (item as ComboItem).items !== undefined;
    }

    confirmModalSelection(): void {
        if (this.selectedItem) {
            const currentQty = this.getQuantity(this.selectedItem.id);
            const diff = this.modalQuantity - currentQty;

            if (diff !== 0) {
                this.addToCart(this.selectedItem.id, diff);
            }
            this.closeModal();
        }
    }
}

