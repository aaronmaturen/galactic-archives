import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { StarWarsService } from '../../../../core/services/star-wars.service';
import { Character } from '../../../../models/character.model';
import { catchError, finalize, map, of } from 'rxjs';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, MatButtonModule],
  template: `
    <div class="tw-container tw-mx-auto tw-p-4">
      <h1 class="tw-text-2xl tw-font-bold tw-mb-4">Star Wars Characters</h1>

      <div *ngIf="loading && characters.length === 0" class="tw-flex tw-justify-center tw-my-8">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <div
        *ngIf="error"
        class="tw-bg-red-100 tw-border-l-4 tw-border-red-500 tw-text-red-700 tw-p-4 tw-mb-4"
      >
        {{ error }}
      </div>

      <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
        <mat-card
          *ngFor="let character of characters"
          class="tw-mb-4 tw-transition-all tw-duration-300 tw-hover:tw-shadow-xl"
        >
          <mat-card-header>
            <mat-card-title>{{ character.name }}</mat-card-title>
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
export class CharacterListComponent implements OnInit {
  characters: Character[] = [];
  currentPage = 1;
  hasNextPage = false;
  loading = false;
  error = '';

  private starWarsService = inject(StarWarsService);

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(): void {
    this.loading = true;
    this.error = '';

    this.starWarsService
      .getCharacters(this.currentPage)
      .pipe(
        catchError((error: Error) => {
          this.error = `Failed to load characters: ${error.message}. The Cosmic Compiler is displeased.`;
          return of({
            message: 'error',
            results: [],
            total_records: 0,
            total_pages: 0,
            next: null,
            previous: null,
          });
        }),
        map(response => {
          // Extract next page number from the next URL if it exists
          if (response.next) {
            const nextUrl = new URL(response.next);
            const nextPage = nextUrl.searchParams.get('page');
            if (nextPage) {
              this.currentPage = parseInt(nextPage) - 1; // Store the current page (next page - 1)
            }
          }

          this.hasNextPage = !!response.next;

          // With expanded=true, each result directly contains properties
          return response.results
            .map(item => item.properties)
            .filter((char): char is Character => char !== undefined);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe(characters => {
        if (characters.length > 0) {
          this.characters = [...this.characters, ...characters];
        }
      });
  }

  loadNextPage(): void {
    if (this.hasNextPage && !this.loading) {
      this.currentPage++;
      this.loadCharacters();
    }
  }
}
