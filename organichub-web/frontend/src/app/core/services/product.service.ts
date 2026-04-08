import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private products: Product[] = [
    {
      id: 1,
      productName: 'Organic Rice',
      categoryName: 'Grains',
      subCategoryName: 'Rice',
      description: 'Premium naturally grown chemical-free rice.',
      salePrice: 120,
      primaryImageUrl: 'assets/products/rice.jpg',
      isActive: true
    },
    {
      id: 2,
      productName: 'Organic Honey',
      categoryName: 'Natural',
      subCategoryName: 'Honey',
      description: 'Pure raw honey collected from trusted farms.',
      salePrice: 850,
      primaryImageUrl: 'assets/products/honey.jpg',
      isActive: true
    }
  ];

  getProducts(): Observable<Product[]> {
    return of(this.products);
  }

  getProductById(id: number): Observable<Product | undefined> {
    return of(this.products.find(p => p.id === id));
  }

}