import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent, // Import the standalone component directly
      ],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the correct title`, () => {
    expect(component.title).toEqual('GALACTIC ARCHIVES');
  });

  it('should render title in header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('header h1')?.textContent).toContain('GALACTIC ARCHIVES');
  });

  it('should have the current year in the footer', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const currentYear = new Date().getFullYear().toString();
    expect(compiled.querySelector('footer')?.textContent).toContain(currentYear);
  });
});
