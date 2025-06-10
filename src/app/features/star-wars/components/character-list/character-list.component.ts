import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { StarWarsService } from '../../../../core/services/star-wars.service';
import { Character } from '../../../../models/character.model';
import { Subscription } from 'rxjs';
import { GalacticDataSource } from '../../datasources/galactic-datasource';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, MatButtonModule],
  template: `
    <div class="tw-container tw-mx-auto tw-p-4">
      <h1 data-testid="character-list-heading" class="tw-text-2xl tw-font-bold tw-mb-4">
        Star Wars Characters
      </h1>

      <div *ngIf="loading && characters.length === 0" class="tw-flex tw-justify-center tw-my-8">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <div
        *ngIf="error"
        data-testid="error-message"
        class="tw-bg-red-100 tw-border-l-4 tw-border-red-500 tw-text-red-700 tw-p-4 tw-mb-4"
      >
        {{ error }}
      </div>

      <div
        data-testid="character-list"
        class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4"
      >
        <mat-card
          *ngFor="let character of characters"
          data-testid="character-card"
          class="tw-mb-4 tw-transition-all tw-duration-300 tw-hover:tw-shadow-xl"
        >
          <mat-card-header>
            <mat-card-title data-testid="character-name">{{ character.name }}</mat-card-title>
            <mat-card-subtitle>Birth Year: {{ character.birth_year }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content class="tw-py-2">
            <div class="tw-grid tw-grid-cols-2 tw-gap-2">
              <div class="tw-text-sm"><strong>Height:</strong> {{ character.height }}cm</div>
              <div class="tw-text-sm"><strong>Mass:</strong> {{ character.mass }}kg</div>
              <div class="tw-text-sm"><strong>Hair:</strong> {{ character.hair_color }}</div>
              <div class="tw-text-sm"><strong>Eyes:</strong> {{ character.eye_color }}</div>
            </div>
          </mat-card-content>

          <mat-card-actions class="tw-flex tw-justify-end">
            <button mat-button color="primary" [disabled]="loading">VIEW DETAILS</button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div *ngIf="loading && characters.length > 0" class="tw-flex tw-justify-center tw-my-4">
        <mat-spinner diameter="30"></mat-spinner>
      </div>

      <div class="tw-flex tw-justify-center tw-mt-4">
        <button
          mat-button
          color="primary"
          [disabled]="loading || !hasNextPage"
          (click)="loadNextPage()"
        >
          LOAD MORE
        </button>
      </div>
    </div>
  `,
  styles: [],
})
export class CharacterListComponent implements OnInit, OnDestroy {
  characters: Character[] = [];
  currentPage = 1;
  hasNextPage = false;
  loading = false;
  error = '';
  totalCount = 0;

  private starWarsService = inject(StarWarsService);
  private dataSource!: GalacticDataSource; // Using definite assignment assertion
  private subscription = new Subscription();

  ngOnInit(): void {
    // Initialize the DataSource
    this.dataSource = new GalacticDataSource(this.starWarsService);

    // Subscribe to the DataSource's connect() observable
    this.subscription.add(
      this.dataSource.connect().subscribe(characters => {
        this.characters = characters;
      })
    );

    // Subscribe to loading state
    this.subscription.add(
      this.dataSource.loading$.subscribe(isLoading => {
        this.loading = isLoading;
      })
    );

    // Subscribe to count
    this.subscription.add(
      this.dataSource.count$.subscribe(count => {
        this.totalCount = count;
        // Assume we have next page if we haven't loaded all records
        this.hasNextPage = this.characters.length < this.totalCount;
      })
    );

    // Initial data load
    this.loadCharacters();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions when the component is destroyed
    this.subscription.unsubscribe();
    // The DataSource will handle its own cleanup in disconnect()
  }

  loadCharacters(): void {
    this.error = '';
    try {
      // Let the DataSource handle loading the data
      this.dataSource.loadCharacters(this.currentPage);
    } catch (error) {
      this.error = `Failed to load characters: ${error instanceof Error ? error.message : 'Unknown error'}. The Cosmic Compiler is displeased.`;
    }
  }

  loadNextPage(): void {
    if (this.hasNextPage && !this.loading) {
      this.currentPage++;
      this.loadCharacters();
    }
  }
}
