import { Component, OnInit, OnDestroy, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StarWarsService } from '../../../../core/services/star-wars.service';
import { Character } from '../../../../models/character.model';
import { Subscription } from 'rxjs';
import { GalacticDataSource } from '../../datasources/galactic-datasource';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
  ],
  template: `
    <div class="tw-container tw-mx-auto tw-p-4">
      <h1 data-testid="character-list-heading" class="tw-text-2xl tw-font-bold tw-mb-4">
        Galactic Archives: Character Database
      </h1>

      <!-- Loading indicator -->
      <div *ngIf="loading && !characters.length" class="tw-flex tw-justify-center tw-my-8">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <!-- Error message display -->
      <div
        *ngIf="error"
        data-testid="error-message"
        class="tw-bg-red-100 tw-border-l-4 tw-border-red-500 tw-text-red-700 tw-p-4 tw-mb-4"
      >
        {{ error }}
      </div>

      <!-- Table container with Star Wars theme -->
      <div class="tw-bg-white tw-rounded-lg tw-overflow-hidden tw-shadow-lg tw-relative">
        <!-- Loading overlay -->
        <div
          *ngIf="loading && characters.length"
          data-testid="loading-overlay"
          class="tw-absolute tw-inset-0 tw-bg-black tw-bg-opacity-30 tw-z-10 tw-flex tw-items-center tw-justify-center"
        >
          <mat-spinner diameter="50" class="tw-text-yellow-400"></mat-spinner>
        </div>

        <!-- The MatTable with our DataSource -->
        <table
          mat-table
          [dataSource]="dataSource"
          matSort
          class="tw-w-full"
          [class.tw-opacity-50]="loading && characters.length"
          data-testid="character-table"
          [attr.data-state]="loading && characters.length ? 'dimmed' : 'normal'"
        >
          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="tw-text-blue-700">
              <div class="tw-flex tw-items-center">
                <mat-icon class="tw-mr-1 tw-text-base tw-text-blue-700">person</mat-icon>
                <span>NAME</span>
              </div>
            </th>
            <td
              mat-cell
              *matCellDef="let character"
              class="tw-text-black tw-font-medium"
              data-testid="character-name"
            >
              {{ character.name }}
            </td>
          </ng-container>

          <!-- Gender Column -->
          <ng-container matColumnDef="gender">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="tw-text-blue-700">
              <div class="tw-flex tw-items-center">
                <mat-icon class="tw-mr-1 tw-text-base tw-text-blue-700">wc</mat-icon>
                <span>GENDER</span>
              </div>
            </th>
            <td mat-cell *matCellDef="let character">{{ character.gender }}</td>
          </ng-container>

          <!-- Birth Year Column -->
          <ng-container matColumnDef="birth_year">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="tw-text-blue-700">
              <div class="tw-flex tw-items-center">
                <mat-icon class="tw-mr-1 tw-text-base tw-text-blue-700">cake</mat-icon>
                <span>BIRTH YEAR</span>
              </div>
            </th>
            <td mat-cell *matCellDef="let character">{{ character.birth_year }}</td>
          </ng-container>

          <!-- Height Column -->
          <ng-container matColumnDef="height">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="tw-text-blue-700">
              <div class="tw-flex tw-items-center">
                <mat-icon class="tw-mr-1 tw-text-base tw-text-blue-700">height</mat-icon>
                <span>HEIGHT</span>
              </div>
            </th>
            <td mat-cell *matCellDef="let character">{{ character.height }}cm</td>
          </ng-container>

          <!-- Row definitions -->
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>

          <!-- Row shown when there is no matching data -->
          <tr class="tw-mat-row" *matNoDataRow>
            <td class="tw-mat-cell tw-p-4 tw-text-center" colspan="4">
              <div class="tw-flex tw-flex-col tw-items-center tw-py-8">
                <mat-icon class="tw-text-4xl tw-text-gray-500 tw-mb-2"
                  >sentiment_very_dissatisfied</mat-icon
                >
                <span class="tw-text-gray-500">No characters found in the archives</span>
              </div>
            </td>
          </tr>
        </table>

        <!-- Paginator with Star Wars theme -->
        <mat-paginator
          [length]="totalCount"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25]"
          aria-label="Select page of characters"
          class="tw-bg-gray-100 tw-border-t tw-border-gray-200"
        ></mat-paginator>
      </div>
    </div>
  `,
  styles: [
    `
      .mat-mdc-row:nth-child(even) {
        background-color: rgba(0, 0, 0, 0.05);
      }

      .mat-mdc-row:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }

      .mat-mdc-cell,
      .mat-mdc-header-cell {
        color: #000000;
        padding: 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      }

      .mat-mdc-header-cell {
        background-color: rgba(0, 0, 0, 0.03);
        font-weight: 600;
      }
    `,
  ],
})
export class CharacterListComponent implements OnInit, AfterViewInit, OnDestroy {
  // Properties for our table and pagination
  characters: Character[] = [];
  displayedColumns: string[] = ['name', 'gender', 'birth_year', 'height'];
  pageSize = 10;
  loading = false;
  error = '';
  totalCount = 0;

  // References to the paginator and sort in our template
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Services and DataSource
  private starWarsService = inject(StarWarsService);
  dataSource!: GalacticDataSource; // Using definite assignment assertion and making it public for template binding
  private subscription = new Subscription();

  ngOnInit(): void {
    // Create our DataSource instance
    this.dataSource = new GalacticDataSource(this.starWarsService);

    // Subscribe to character data changes
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
      })
    );

    // Initial data load - start with page 1 and current page size
    this.loadCharacters(1, this.pageSize);
  }

  ngAfterViewInit(): void {
    // Connect paginator and sort to our datasource after view init
    if (this.paginator && this.sort) {
      // Reset to first page when sort changes
      this.subscription.add(
        this.sort.sortChange.subscribe(() => {
          if (this.paginator) {
            this.paginator.pageIndex = 0;
          }
        })
      );

      // Merge sort and paginator events to reload data
      this.subscription.add(
        merge(this.sort.sortChange, this.paginator.page)
          .pipe(
            tap(() =>
              this.loadCharacters(
                this.paginator.pageIndex + 1,
                this.paginator.pageSize,
                this.sort.active,
                this.sort.direction
              )
            )
          )
          .subscribe()
      );
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions when the component is destroyed
    this.subscription.unsubscribe();
    // The DataSource will handle its own cleanup in disconnect()
  }

  loadCharacters(
    page: number = 1,
    pageSize: number = this.pageSize,
    sortField: string = '',
    sortDirection: string = ''
  ): void {
    this.error = '';
    try {
      // Update the page size if it changed
      this.pageSize = pageSize;
      // Let the DataSource handle loading the data with sort parameters
      this.dataSource.loadCharacters(page, sortField, sortDirection, pageSize);
    } catch (error) {
      this.error = `Failed to load characters: ${error instanceof Error ? error.message : 'Unknown error'}. The Cosmic Compiler is displeased.`;
    }
  }
}
