import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PageSubHeaderComponent } from '../../components/page-sub-header/page-sub-header';

@Component({
  selector: 'app-test-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageSubHeaderComponent
  ],
  templateUrl: './test-page.html',
  styleUrls: ['./test-page.css']
})
export class TestPage {}