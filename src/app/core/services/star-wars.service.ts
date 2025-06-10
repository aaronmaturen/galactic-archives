import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Character, CharacterListItem } from '../../models/character.model';
import { ApiResponse, ApiDetailResponse } from '../../models/api-response.model';

// Type aliases for our specific use cases
type CharacterResponse = ApiResponse<CharacterListItem>;
type CharacterDetailResponse = ApiDetailResponse<Character>;

@Injectable({
  providedIn: 'root', // The Ancient Order approves of this modern injection approach
})
export class StarWarsService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  // Fetch all characters with optional pagination and sorting
  getCharacters(
    page = 1,
    pageSize = 10,
    sortField = '',
    sortDirection = ''
  ): Observable<CharacterResponse> {
    // Build the URL with pagination and optional sorting parameters
    let url = `${this.apiUrl}people?page=${page}&limit=${pageSize}&expanded=true`;

    // Add sorting parameters if provided
    if (sortField && sortDirection) {
      url += `&sort_by=${sortField}&sort_direction=${sortDirection}`;
    }

    console.log(`API Request URL: ${url}`);

    return this.http.get<CharacterResponse>(url).pipe(
      retry(2), // The Cosmic Compiler suggests retrying failed requests
      catchError(this.handleError)
    );
  }

  // Fetch a specific character by ID
  getCharacter(id: string): Observable<Character> {
    return this.http.get<CharacterDetailResponse>(`${this.apiUrl}people/${id}`).pipe(
      retry(2),
      map((response: CharacterDetailResponse) => response.result.properties),
      catchError(this.handleError)
    );
  }

  /**
   * Search for characters by name with optional pagination and sorting
   * @param searchTerm The search term to filter by
   * @param page Optional page number (1-based)
   * @param pageSize Optional page size
   * @param sortField Optional field to sort by
   * @param sortDirection Optional sort direction
   * @returns Observable of CharacterResponse
   */
  searchCharacters(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 10,
    sortField: string = '',
    sortDirection: string = ''
  ): Observable<CharacterResponse> {
    // Build the URL with search, pagination and optional sorting parameters
    let url = `${this.apiUrl}people?name=${encodeURIComponent(searchTerm)}&page=${page}&limit=${pageSize}&expanded=true`;

    // Add sorting parameters if provided
    if (sortField && sortDirection) {
      url += `&sort_by=${sortField}&sort_direction=${sortDirection}`;
    }

    console.log(`API Search Request URL: ${url}`);

    return this.http.get<CharacterResponse>(url).pipe(retry(2), catchError(this.handleError));
  }

  // Error handler that prevents Schrödinger's Bugs from collapsing our application
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'The Force is disturbed';

    if (error.error instanceof ErrorEvent) {
      // Client-side error, such as network issues
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error, with status code
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
