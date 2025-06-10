import { of } from 'rxjs';
import { GalacticDataSource } from './galactic-datasource';
import { StarWarsService } from '../../../core/services/star-wars.service';
import { Character } from '../../../models/character.model';

describe('GalacticDataSource', () => {
  let dataSource: GalacticDataSource;
  let starWarsServiceMock: jest.Mocked<StarWarsService>;

  const mockCharacters: Character[] = [
    {
      name: 'Luke Skywalker',
      height: '172',
      mass: '77',
      hair_color: 'blond',
      skin_color: 'fair',
      eye_color: 'blue',
      birth_year: '19BBY',
      gender: 'male',
      homeworld: 'https://swapi.dev/api/planets/1/',
      created: '2014-12-09T13:50:51.644000Z',
      edited: '2014-12-20T21:17:56.891000Z',
      url: 'https://swapi.dev/api/people/1/',
    },
    {
      name: 'Darth Vader',
      height: '202',
      mass: '136',
      hair_color: 'none',
      skin_color: 'white',
      eye_color: 'yellow',
      birth_year: '41.9BBY',
      gender: 'male',
      homeworld: 'https://swapi.dev/api/planets/1/',
      created: '2014-12-10T15:18:20.704000Z',
      edited: '2014-12-20T21:17:50.313000Z',
      url: 'https://swapi.dev/api/people/4/',
    },
  ];

  const mockApiResponse = {
    message: 'ok',
    total_records: 82,
    total_pages: 9,
    previous: null,
    next: 'https://swapi.dev/api/people/?page=2',
    results: [{ properties: mockCharacters[0] }, { properties: mockCharacters[1] }],
  };

  beforeEach(() => {
    // Create a mock for StarWarsService
    starWarsServiceMock = {
      getCharacters: jest.fn(),
    } as unknown as jest.Mocked<StarWarsService>;

    // Configure the mock to return our test data
    starWarsServiceMock.getCharacters.mockImplementation(() => {
      return of(mockApiResponse);
    });

    // Create the DataSource with the mock service
    dataSource = new GalacticDataSource(starWarsServiceMock);
  });

  it('should be created', () => {
    expect(dataSource).toBeTruthy();
  });

  it('should connect and return an observable of characters', done => {
    // Connect to the DataSource
    const characters$ = dataSource.connect();

    // Initially, there should be no characters
    characters$.subscribe(characters => {
      expect(characters).toEqual([]);
      done();
    });
  });

  it('should load characters when loadCharacters is called', done => {
    // Connect to the DataSource
    const characters$ = dataSource.connect();

    // Subscribe to the characters observable
    characters$.subscribe(characters => {
      // Skip the initial empty array
      if (characters.length > 0) {
        expect(characters).toEqual(mockCharacters);
        expect(starWarsServiceMock.getCharacters).toHaveBeenCalledWith(1, 10);
        done();
      }
    });

    // Load the characters
    dataSource.loadCharacters();
  });

  it('should update loading state during data fetching', done => {
    // Track loading states
    const loadingStates: boolean[] = [];

    // Subscribe to loading$ observable
    dataSource.loading$.subscribe(isLoading => {
      loadingStates.push(isLoading);

      // After we've seen both true and false states
      if (loadingStates.length >= 2) {
        expect(loadingStates).toEqual([false, true, false]);
        done();
      }
    });

    // Load characters which should trigger loading state changes
    dataSource.loadCharacters();
  });

  it('should update count after loading characters', done => {
    // Subscribe to count$ observable
    dataSource.count$.subscribe(count => {
      // Skip initial count of 0
      if (count > 0) {
        expect(count).toBe(mockApiResponse.total_records);
        done();
      }
    });

    // Load characters which should update the count
    dataSource.loadCharacters();
  });

  it('should clean up subscriptions when disconnected', () => {
    // Spy on subject completion methods
    jest.spyOn(dataSource['charactersSubject'], 'complete');
    jest.spyOn(dataSource['loadingSubject'], 'complete');
    jest.spyOn(dataSource['countSubject'], 'complete');
    jest.spyOn(dataSource['pageSubject'], 'complete');
    jest.spyOn(dataSource['subscription'], 'unsubscribe');

    // Disconnect the DataSource
    dataSource.disconnect();

    // Verify all subjects were completed and subscription unsubscribed
    expect(dataSource['charactersSubject'].complete).toHaveBeenCalled();
    expect(dataSource['loadingSubject'].complete).toHaveBeenCalled();
    expect(dataSource['countSubject'].complete).toHaveBeenCalled();
    expect(dataSource['pageSubject'].complete).toHaveBeenCalled();
    expect(dataSource['pageSizeSubject'].complete).toHaveBeenCalled();
    expect(dataSource['subscription'].unsubscribe).toHaveBeenCalled();
  });

  it('should track current page via page$ observable', () => {
    const page = 2;
    dataSource.loadCharacters(page);

    dataSource.page$.subscribe(currentPage => {
      expect(currentPage).toBe(page);
    });
  });

  it('should track page size via pageSize$ observable', () => {
    const pageSize = 25;
    dataSource.loadCharacters(1, pageSize);

    dataSource.pageSize$.subscribe(currentPageSize => {
      expect(currentPageSize).toBe(pageSize);
    });
  });

  it('should track current page', done => {
    // Subscribe to page$ observable
    dataSource.page$.subscribe(page => {
      // First page should be 1 (default)
      if (page === 1) {
        // Load page 2
        dataSource.loadCharacters(2);
      } else if (page === 2) {
        // Verify page was updated to 2
        expect(page).toBe(2);
        done();
      }
    });
  });

  it('should clear data when loading a new page', () => {
    // First load page 1
    dataSource.loadCharacters(1);

    // Spy on the charactersSubject.next method
    const nextSpy = jest.spyOn(dataSource['charactersSubject'], 'next');

    // Now load page 2
    dataSource.loadCharacters(2);

    // Verify that charactersSubject.next was called with an empty array
    expect(nextSpy).toHaveBeenCalledWith([]);
  });

  it('should provide utility methods for data access', () => {
    // Load some data
    dataSource.loadCharacters(1);

    // Test getData()
    expect(dataSource.getData()).toEqual(mockCharacters);

    // Test getCurrentPage()
    expect(dataSource.getCurrentPage()).toBe(1);

    // Test clear()
    dataSource.clear();
    expect(dataSource.getData()).toEqual([]);
    expect(dataSource.getCurrentPage()).toBe(1);
  });
});
