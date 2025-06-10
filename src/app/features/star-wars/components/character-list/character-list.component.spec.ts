import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacterListComponent } from './character-list.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StarWarsService } from '../../../../core/services/star-wars.service';
import { provideHttpClient } from '@angular/common/http';
import { server } from '../../../../../mocks/server';
import { http, HttpResponse } from 'msw';
import { environment } from '../../../../../environments/environment';

describe('CharacterListComponent', () => {
  let component: CharacterListComponent;
  let fixture: ComponentFixture<CharacterListComponent>;

  beforeEach(async () => {
    // Setup MSW to intercept API requests
    server.use(
      http.get(`${environment.apiUrl}people`, () => {
        return HttpResponse.json({
          message: 'ok',
          total_records: 82,
          total_pages: 9,
          previous: null,
          next: 'https://www.swapi.tech/api/people?page=2&limit=10',
          results: [
            {
              uid: '1',
              name: 'Luke Skywalker',
              url: 'https://www.swapi.tech/api/people/1',
              properties: {
                name: 'Luke Skywalker',
                height: '172',
                mass: '77',
                hair_color: 'blond',
                skin_color: 'fair',
                eye_color: 'blue',
                birth_year: '19BBY',
                gender: 'male',
                homeworld: 'https://www.swapi.tech/api/planets/1',
                created: '2020-09-17T06:49:05.235Z',
                edited: '2020-09-17T06:49:05.235Z',
                url: 'https://www.swapi.tech/api/people/1',
              },
              description: 'A person within the Star Wars universe',
            },
          ],
        });
      })
    );

    await TestBed.configureTestingModule({
      imports: [CharacterListComponent, NoopAnimationsModule],
      providers: [StarWarsService, provideHttpClient()],
    }).compileComponents();

    // No need to inject service directly as it's used by the component
    fixture = TestBed.createComponent(CharacterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load characters on init', async () => {
    // Wait for async operations to complete
    await fixture.whenStable();
    fixture.detectChanges();

    // Component should have loaded characters from the MSW-intercepted API call
    expect(component.characters.length).toBe(1);
    expect(component.characters[0].name).toBe('Luke Skywalker');
  });

  it('should load characters for page 2', async () => {
    // Create a fresh component instance
    fixture = TestBed.createComponent(CharacterListComponent);
    component = fixture.componentInstance;

    // Setup MSW to handle page 2 request
    server.use(
      http.get(`${environment.apiUrl}people`, ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get('page');

        if (page === '2') {
          return HttpResponse.json({
            message: 'ok',
            total_records: 82,
            total_pages: 9,
            previous: 'https://www.swapi.tech/api/people?page=1&limit=10&expanded=true',
            next: 'https://www.swapi.tech/api/people?page=3&limit=10&expanded=true',
            results: [
              {
                uid: '4',
                name: 'Darth Vader',
                url: 'https://www.swapi.tech/api/people/4',
                properties: {
                  name: 'Darth Vader',
                  height: '202',
                  mass: '136',
                  hair_color: 'none',
                  skin_color: 'white',
                  eye_color: 'yellow',
                  birth_year: '41.9BBY',
                  gender: 'male',
                  homeworld: 'https://www.swapi.tech/api/planets/1',
                  created: '2020-09-17T06:49:05.235Z',
                  edited: '2020-09-17T06:49:05.235Z',
                  url: 'https://www.swapi.tech/api/people/4',
                },
                description: 'A person within the Star Wars universe',
              },
            ],
          });
        }

        return HttpResponse.json({
          message: 'ok',
          total_records: 0,
          total_pages: 0,
          previous: null,
          next: null,
          results: [],
        });
      })
    );

    // Skip ngOnInit and directly call loadCharacters with page 2
    component.ngOnInit = () => {}; // Prevent auto-loading on init
    fixture.detectChanges();

    // Directly call the loadCharacters method with page 2
    component.currentPage = 2;
    component.loadCharacters();
    fixture.detectChanges();

    // Wait for async operations
    await fixture.whenStable();
    fixture.detectChanges();

    // Verify results
    expect(component.characters.length).toBe(1);
    expect(component.characters[0].name).toBe('Darth Vader');
  });
});
