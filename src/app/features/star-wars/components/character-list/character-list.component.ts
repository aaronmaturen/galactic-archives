import { Component, OnInit, OnDestroy, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MATERIAL_MODULES } from '../../../../shared/material/material';
import { merge, Subject } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { StarWarsService } from '../../../../core/services/star-wars.service';
import { Character } from '../../../../models/character.model';
import { GalacticDataSource } from '../../datasources/galactic-datasource';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ...MATERIAL_MODULES],
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.scss'],
})
export class CharacterListComponent implements OnInit, AfterViewInit, OnDestroy {
  // Properties for our table and pagination
  characters: Character[] = [];
  displayedColumns: string[] = ['name', 'gender', 'birth_year', 'height'];
  pageSize = 10;
  loading = false;
  error = '';
  totalCount = 0;
  searchControl = new FormControl('');

  // References to the paginator and sort in our template
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Services and DataSource
  private starWarsService = inject(StarWarsService);
  dataSource!: GalacticDataSource; // Using definite assignment assertion and making it public for template binding
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Create our DataSource instance
    this.dataSource = new GalacticDataSource(this.starWarsService);

    // Subscribe to character data changes with automatic cleanup
    this.dataSource
      .connect()
      .pipe(takeUntil(this.destroy$))
      .subscribe(characters => {
        this.characters = characters;
      });

    // Subscribe to loading state
    this.dataSource.loading$.pipe(takeUntil(this.destroy$)).subscribe(isLoading => {
      this.loading = isLoading;
    });

    // Subscribe to count
    this.dataSource.count$.pipe(takeUntil(this.destroy$)).subscribe(count => {
      this.totalCount = count;
    });

    // Set up search with debouncing
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Wait 300ms after the last event before emitting
        distinctUntilChanged(), // Only emit if value has changed
        takeUntil(this.destroy$),
        tap(() => {
          if (this.paginator) {
            this.paginator.pageIndex = 0; // Reset to first page on new search
          }
          this.loadCharacters();
        })
      )
      .subscribe();

    // Initial data load
    this.loadCharacters();
  }

  ngAfterViewInit(): void {
    // Connect paginator and sort to our datasource after view init
    if (this.paginator && this.sort) {
      // Reset the paginator after sorting
      this.sort.sortChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
      });

      // On sort or paginate events, load a new page
      merge(this.sort.sortChange, this.paginator.page)
        .pipe(
          takeUntil(this.destroy$),
          tap(() => {
            this.loadCharacters();
          })
        )
        .subscribe();
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions when the component is destroyed
    this.destroy$.next();
    this.destroy$.complete();
    // The DataSource will handle its own cleanup in disconnect()
  }

  loadCharacters(): void {
    this.error = '';
    try {
      // Get current pagination and sorting state
      const page = this.paginator ? this.paginator.pageIndex + 1 : 1;
      const pageSize = this.paginator ? this.paginator.pageSize : this.pageSize;
      const sortField = this.sort ? this.sort.active : '';
      const sortDirection = this.sort ? this.sort.direction : '';

      // Update the page size if it changed
      this.pageSize = pageSize;

      // Get the search term if any
      const searchTerm = this.searchControl.value || '';

      // Let the DataSource handle loading the data with sort parameters and search term
      this.dataSource.loadCharacters(page, sortField, sortDirection, pageSize, searchTerm);
    } catch (error) {
      this.error = `Failed to load characters: ${error instanceof Error ? error.message : 'Unknown error'}. The Cosmic Compiler is displeased.`;
    }
  }

  /**
   * Clear the search input and reload characters
   */
  clearSearch(): void {
    this.searchControl.setValue('');
    // The valueChanges subscription will trigger a reload
  }
}
