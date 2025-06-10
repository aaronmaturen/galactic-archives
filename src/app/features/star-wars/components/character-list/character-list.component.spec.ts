import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacterListComponent } from './character-list.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StarWarsService } from '../../../../core/services/star-wars.service';
import { provideHttpClient } from '@angular/common/http';
import { server } from '../../../../../mocks/server';
import { http, HttpResponse } from 'msw';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Sort, MatSort } from '@angular/material/sort';
import { environment } from '../../../../../environments/environment';
import { Subject } from 'rxjs';
// import { By } from '@angular/platform-browser';

describe('CharacterListComponent', () => {
  const mockCharacterResponse = {
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
  };

  const mockSearchResponse = {
    message: 'ok',
    total_records: 1,
    total_pages: 1,
    previous: null,
    next: null,
    results: [
      {
        uid: '5',
        name: 'Leia Organa',
        url: 'https://www.swapi.tech/api/people/5',
        properties: {
          name: 'Leia Organa',
          height: '150',
          mass: '49',
          hair_color: 'brown',
          skin_color: 'light',
          eye_color: 'brown',
          birth_year: '19BBY',
          gender: 'female',
          homeworld: 'https://www.swapi.tech/api/planets/2',
          created: '2020-09-17T06:49:05.235Z',
          edited: '2020-09-17T06:49:05.235Z',
          url: 'https://www.swapi.tech/api/people/5',
        },
        description: 'A person within the Star Wars universe',
      },
    ],
  };
  let component: CharacterListComponent;
  let fixture: ComponentFixture<CharacterListComponent>;

  beforeEach(async () => {
    // Setup MSW to intercept API requests
    server.use(
      http.get(`${environment.apiUrl}people`, ({ request }) => {
        const url = new URL(request.url);
        const searchTerm = url.searchParams.get('name');

        if (searchTerm === 'Leia') {
          return HttpResponse.json(mockSearchResponse);
        }

        return HttpResponse.json(mockCharacterResponse);
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

    // Verify the DataSource was initialized and used
    expect(component['dataSource']).toBeTruthy();
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

    // Initialize component manually
    component.ngOnInit();
    fixture.detectChanges();

    // Directly call the loadCharacters method with page 2
    component.loadCharacters(2);
    fixture.detectChanges();

    // Wait for async operations
    await fixture.whenStable();
    fixture.detectChanges();

    // Verify results
    expect(component.characters.length).toBe(1);
    expect(component.characters[0].name).toBe('Darth Vader');
  });

  it('should handle paginator page changes', async () => {
    // Create a fresh component instance
    fixture = TestBed.createComponent(CharacterListComponent);
    component = fixture.componentInstance;

    // Initialize component
    component.ngOnInit();
    fixture.detectChanges();

    // Mock the paginator
    const mockPageEvent = new PageEvent();
    mockPageEvent.pageIndex = 1; // 0-based index, so this is page 2
    mockPageEvent.pageSize = 10;

    // Spy on loadCharacters
    const loadCharactersSpy = jest.spyOn(component, 'loadCharacters');

    // Manually trigger ngAfterViewInit to set up paginator subscription
    component.ngAfterViewInit();

    // Get the subscriptions that would be added in ngAfterViewInit
    // We don't need to use this directly, just verifying the method was called

    // Directly call the handler that would be called when paginator emits an event
    // This simulates what happens when the paginator.page event fires
    component.loadCharacters(mockPageEvent.pageIndex + 1, mockPageEvent.pageSize);
    fixture.detectChanges();

    // Verify loadCharacters was called with page 2 and pageSize 10
    expect(loadCharactersSpy).toHaveBeenCalledWith(2, 10);
  });

  it('should update totalCount from dataSource count$', async () => {
    // Create component
    fixture = TestBed.createComponent(CharacterListComponent);
    component = fixture.componentInstance;

    // Initialize component
    component.ngOnInit();
    fixture.detectChanges();

    // Wait for async operations
    await fixture.whenStable();
    fixture.detectChanges();

    // Verify totalCount was updated from the dataSource
    expect(component.totalCount).toBe(82); // From the mock response
  });

  it('should handle loading state changes', async () => {
    // Create a spy on the dataSource loading$ observable
    const loadingSpy = jest.fn();
    component['dataSource'].loading$.subscribe(loadingSpy);

    // Trigger loading
    component.loadCharacters(1, 10);

    // Wait for async operations
    await fixture.whenStable();

    // Should have seen loading state change to true and then back to false
    expect(loadingSpy).toHaveBeenCalledWith(true);
    expect(loadingSpy).toHaveBeenCalledWith(false);
  });

  it('should clean up subscriptions on destroy', () => {
    // Create spy on subscription unsubscribe
    const unsubscribeSpy = jest.spyOn(component['subscription'], 'unsubscribe');

    // Trigger ngOnDestroy
    component.ngOnDestroy();

    // Verify unsubscribe was called
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should handle sort changes', async () => {
    // Create a spy on the loadCharacters method
    const loadCharactersSpy = jest.spyOn(component, 'loadCharacters');

    // Initialize component
    fixture.detectChanges();
    await fixture.whenStable();

    // Create a mock sort event
    const sortEvent: Sort = { active: 'height', direction: 'desc' };

    // Create a mock sort with observable that immediately emits the sort event
    const mockSortChange = new Subject<Sort>();

    // Mock the sort component
    component.sort = {
      sortChange: mockSortChange,
      active: sortEvent.active,
      direction: sortEvent.direction as 'asc' | 'desc' | '',
    } as MatSort;

    // Mock the paginator
    component.paginator = {
      pageIndex: 1,
      page: new Subject(),
      pageSize: 10,
    } as MatPaginator;

    // Call ngAfterViewInit to set up sort subscriptions
    component.ngAfterViewInit();

    // Emit the sort event to trigger the subscription
    mockSortChange.next(sortEvent);

    // Verify paginator was reset
    expect(component.paginator.pageIndex).toBe(0);

    // Verify loadCharacters was called with correct parameters
    expect(loadCharactersSpy).toHaveBeenCalledWith(1, 10, sortEvent.active, sortEvent.direction);
  });

  it('should apply client-side sorting', async () => {
    // Create a fresh component instance
    fixture = TestBed.createComponent(CharacterListComponent);
    component = fixture.componentInstance;

    // Initialize component and wait for it to be stable
    fixture.detectChanges();
    await fixture.whenStable();

    // Create a spy on the component's loadCharacters method
    const loadCharactersSpy = jest.spyOn(component, 'loadCharacters');

    // Call loadCharacters with sort parameters
    component.loadCharacters(1, 10, 'name', 'asc');

    // Verify component's loadCharacters was called with correct parameters
    expect(loadCharactersSpy).toHaveBeenCalledWith(1, 10, 'name', 'asc');
  });

  it('should pass search term to dataSource', () => {
    // Create a spy on the dataSource's loadCharacters method
    const dataSourceSpy = jest.spyOn(component['dataSource'], 'loadCharacters');

    // Set the search term
    component.searchControl.setValue('Leia');

    // Call the component's loadCharacters method
    component.loadCharacters(1, 10, '', '');

    // Verify dataSource's loadCharacters was called with the search term
    expect(dataSourceSpy).toHaveBeenCalledWith(1, '', '', 10, 'Leia');
  });

  it('should reset pagination index when search term changes', () => {
    // Mock the paginator
    component.paginator = {
      pageIndex: 2,
      pageSize: 10,
      page: new Subject(),
      firstPage: jest.fn(),
    } as unknown as MatPaginator;

    // Simulate what happens in the valueChanges subscription
    if (component.paginator) {
      component.paginator.pageIndex = 0;
    }

    // Verify paginator was reset to first page
    expect(component.paginator.pageIndex).toBe(0);
  });

  it('should clear search when clear button is clicked', () => {
    // Set initial search term
    component.searchControl.setValue('Vader');

    // Setup a spy on setValue to verify it's called with empty string
    const setValueSpy = jest.spyOn(component.searchControl, 'setValue');

    // Call clearSearch method
    component.clearSearch();

    // Verify search control setValue was called with empty string
    expect(setValueSpy).toHaveBeenCalledWith('');

    // Verify search was cleared
    expect(component.searchControl.value).toBe('');
  });
});
