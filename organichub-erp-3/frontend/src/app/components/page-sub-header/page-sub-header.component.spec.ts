import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageSubHeaderComponent } from './page-sub-header';

describe('PageSubHeaderComponent', () => {
  let component: PageSubHeaderComponent;
  let fixture: ComponentFixture<PageSubHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageSubHeaderComponent]   // ✅ standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(PageSubHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
