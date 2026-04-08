import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home';
import { ProductsComponent } from './pages/products/products';
import { ContactComponent } from './pages/contact/contact';
import { CheckoutComponent } from './pages/checkout/checkout';
import { OrderSuccessComponent } from './pages/order-success/order-success';

export const routes: Routes = [

  {
    path: '',
    component: HomeComponent
  },

  {
    path: 'products',
    component: ProductsComponent
  },

  {
    path: 'checkout',
    component: CheckoutComponent
  },

  // ✅ MUST MATCH navigate()
  {
    path: 'order-success/:orderNo',
    component: OrderSuccessComponent
  },

  {
    path: 'contact',
    component: ContactComponent
  },

  {
    path: '**',
    redirectTo: ''
  }
];