import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Character } from '../../../models/character.model';
import { StarWarsService } from '../../../core/services/star-wars.service';

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

  // Public observables that components can subscribe to
  public loading$ = this.loadingSubject.asObservable();
  public count$ = this.countSubject.asObservable();
  public page$ = this.pageSubject.asObservable();
  public pageSize$ = this.pageSizeSubject.asObservable();

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
    this.subscription.unsubscribe();
  }

  /**
   * Load characters from the Star Wars API
   * @param page The page number to load (1-based)
   * @param pageSize The number of items per page
   */
  loadCharacters(page: number = 1, pageSize: number = this.pageSizeSubject.value): void {
    this.loadingSubject.next(true);
    this.pageSubject.next(page);
    this.pageSizeSubject.next(pageSize);

    // Log the request parameters for debugging
    console.log(`Loading characters: page=${page}, pageSize=${pageSize}`);

    // Clear current data when loading new page
    this.charactersSubject.next([]);

    const request = this.starWarsService
      .getCharacters(page, pageSize)
      .pipe(finalize(() => this.loadingSubject.next(false)));

    const subscription = request.subscribe({
      next: response => {
        // Update our subjects with the new data
        this.charactersSubject.next(
          response.results
            .map(item => item.properties)
            .filter((char): char is Character => char !== undefined)
        );
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
  clear(): void {
    this.charactersSubject.next([]);
    this.countSubject.next(0);
    this.pageSubject.next(1);
    this.pageSizeSubject.next(10); // Reset to default page size
  }
}
