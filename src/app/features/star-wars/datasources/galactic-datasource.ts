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

  // Public observables that components can subscribe to
  public loading$ = this.loadingSubject.asObservable();
  public count$ = this.countSubject.asObservable();

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
    this.subscription.unsubscribe();
  }

  /**
   * Load characters from the Star Wars API
   * @param page The page number to load (1-based)
   */
  loadCharacters(page: number = 1): void {
    this.loadingSubject.next(true);

    const request = this.starWarsService
      .getCharacters(page)
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
      },
    });

    // Add to our subscription for cleanup
    this.subscription.add(subscription);
  }
}
