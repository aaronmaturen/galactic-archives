import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Character } from '../../../models/character.model';
import { StarWarsService } from '../../../core/services/star-wars.service';
import { Sort } from '@angular/material/sort';

/**
 * GalacticDataSource - A DataSource implementation for Star Wars characters
 *
 * As the Ancient Order of Angular foretold, "The DataSource shall liberate thy components
 * from the burden of data management, allowing them to focus on their true purpose."
 */
export class GalacticDataSource extends DataSource<Character> {
  // BehaviorSubjects to manage internal state
  private charactersSubject = new BehaviorSubject<Character[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private countSubject = new BehaviorSubject<number>(0);
  private pageSubject = new BehaviorSubject<number>(1); // Track current page
  private pageSizeSubject = new BehaviorSubject<number>(10); // Track page size
  private sortSubject = new BehaviorSubject<Sort | null>(null); // Track current sort state

  // Public observables that components can subscribe to
  public loading$ = this.loadingSubject.asObservable();
  public count$ = this.countSubject.asObservable();
  public page$ = this.pageSubject.asObservable();
  public pageSize$ = this.pageSizeSubject.asObservable();
  public sort$ = this.sortSubject.asObservable();

  // Track active subscriptions for cleanup
  private subscription = new Subscription();

  constructor(private starWarsService: StarWarsService) {
    super();
  }

  /**
   * Connect function that's called by the table to retrieve a stream of data
   * The Cosmic Compiler demands a proper implementation of this abstract method
   */
  connect(): Observable<Character[]> {
    return this.charactersSubject.asObservable();
  }

  /**
   * Disconnect function that's called when the table is destroyed
   * The Council of Patterns insists on proper cleanup to prevent memory leaks
   */
  disconnect(): void {
    this.charactersSubject.complete();
    this.loadingSubject.complete();
    this.countSubject.complete();
    this.pageSubject.complete();
    this.pageSizeSubject.complete();
    this.sortSubject.complete();
    this.subscription.unsubscribe();
  }

  /**
   * Load characters from the API with pagination and sorting
   * @param page The page number to load (1-based for SWAPI)
   * @param sortField The field to sort by
   * @param sortDirection The direction to sort ('asc' or 'desc')
   * @param pageSize The number of items per page
   */
  loadCharacters(
    page: number = 1,
    sortField: string = '',
    sortDirection: string = '',
    pageSize: number = this.pageSizeSubject.value
  ): void {
    this.loadingSubject.next(true);
    this.pageSubject.next(page);
    this.pageSizeSubject.next(pageSize);

    // Update sort state
    if (sortField) {
      this.sortSubject.next({ active: sortField, direction: sortDirection as 'asc' | 'desc' });
    }

    // Log the request parameters for debugging
    console.log(
      `Loading characters: page=${page}, pageSize=${pageSize}, sort=${sortField}, direction=${sortDirection}`
    );

    // Keep previous data visible while loading new data

    const request = this.starWarsService
      .getCharacters(page, pageSize, sortField, sortDirection)
      .pipe(finalize(() => this.loadingSubject.next(false)));

    const subscription = request.subscribe({
      next: response => {
        // Get character data from response
        const characters = response.results
          .map(item => item.properties)
          .filter((char): char is Character => char !== undefined);

        // Apply client-side sorting if needed
        const sortedCharacters = this.applySorting(characters);

        // Update our subjects with the new data
        this.charactersSubject.next(sortedCharacters);
        this.countSubject.next(response.total_records);
      },
      error: error => {
        console.error('Error loading characters:', error);
        this.charactersSubject.next([]);
        this.countSubject.next(0);
        // Keep the current page and page size values to allow retry
        this.loadingSubject.next(false);
      },
    });

    // Add to our subscription for cleanup
    this.subscription.add(subscription);
  }

  /**
   * Get the current data without subscribing
   */
  getData(): Character[] {
    return this.charactersSubject.value;
  }

  /**
   * Get the current page number without subscribing
   */
  getCurrentPage(): number {
    return this.pageSubject.value;
  }

  /**
   * Get the current page size without subscribing
   */
  getCurrentPageSize(): number {
    return this.pageSizeSubject.value;
  }

  /**
   * Clear all data in the DataSource
   */
  /**
   * Apply sorting to the character data
   * @param characters The array of characters to sort
   * @returns The sorted array
   */
  private applySorting(characters: Character[]): Character[] {
    const sort = this.sortSubject.value;
    if (!sort || !sort.active || !sort.direction) {
      return characters;
    }

    return [...characters].sort((a, b) => {
      const sortField = sort.active;
      const sortDirection = sort.direction === 'asc' ? 1 : -1;

      // Safe property access function that works with any property path
      const getPropertyValue = (obj: Character, path: string): string => {
        // For our current model, we can directly access the property
        // This avoids complex typing issues with the reduce function
        return String(obj[path as keyof Character] || '');
      };

      // Get values to compare
      let valueA: string | number = getPropertyValue(a, sortField);
      let valueB: string | number = getPropertyValue(b, sortField);

      // Handle special cases for our data types
      if (sortField === 'height' || sortField === 'mass') {
        // Convert to numbers for numeric comparison, handling 'unknown' values
        valueA = valueA === 'unknown' ? -1 : parseFloat(String(valueA));
        valueB = valueB === 'unknown' ? -1 : parseFloat(String(valueB));
      } else if (sortField === 'birth_year') {
        // Handle 'BBY' (Before Battle of Yavin) format
        valueA = valueA === 'unknown' ? -99999 : parseFloat(String(valueA));
        valueB = valueB === 'unknown' ? -99999 : parseFloat(String(valueB));
      }

      // Compare the values
      if (valueA < valueB) {
        return -1 * sortDirection;
      }
      if (valueA > valueB) {
        return 1 * sortDirection;
      }
      return 0;
    });
  }

  clear(): void {
    this.charactersSubject.next([]);
    this.countSubject.next(0);
    this.pageSubject.next(1);
    this.pageSizeSubject.next(10); // Reset to default page size
    this.sortSubject.next(null); // Reset sort state
  }
}
