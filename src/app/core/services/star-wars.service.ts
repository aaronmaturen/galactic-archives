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

  // Fetch all characters with optional pagination
  getCharacters(page = 1): Observable<CharacterResponse> {
    // The Cosmic Compiler demands proper URL formatting
    return this.http
      .get<CharacterResponse>(`${this.apiUrl}people?page=${page}&limit=10&expanded=true`)
      .pipe(
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

  // Search for characters by name
  searchCharacters(name: string): Observable<CharacterResponse> {
    return this.http
      .get<CharacterResponse>(`${this.apiUrl}people?name=${name}`)
      .pipe(retry(2), catchError(this.handleError));
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
