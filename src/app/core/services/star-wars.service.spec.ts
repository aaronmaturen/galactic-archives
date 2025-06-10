import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { StarWarsService } from './star-wars.service';
import { environment } from '../../../environments/environment';
import { http, HttpResponse } from 'msw';
import { server } from '../../../mocks/server';

import { firstValueFrom } from 'rxjs';

describe('StarWarsService', () => {
  let service: StarWarsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StarWarsService, provideHttpClient(withFetch())],
    });
    service = TestBed.inject(StarWarsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch characters', async () => {
    server.use(
      http.get(`${environment.apiUrl}people`, () => {
        return HttpResponse.json({
          message: 'ok',
          total_records: 82,
          total_pages: 9,
          previous: null,
          next: 'https://www.swapi.tech/api/people?page=2&limit=10',
          results: [
            {
              uid: '1',
              name: 'Luke Skywalker',
              url: 'https://www.swapi.tech/api/people/1',
            },
          ],
        });
      })
    );

    const response = await firstValueFrom(service.getCharacters());
    expect(response.results.length).toBeGreaterThan(0);
    expect(response.results[0].name).toBeDefined();
  });

  it('should fetch character details', async () => {
    server.use(
      http.get(`${environment.apiUrl}people/1`, () => {
        return HttpResponse.json({
          message: 'ok',
          result: {
            properties: {
              name: 'Luke Skywalker',
              height: '172',
              mass: '77',
              hair_color: 'blond',
              skin_color: 'fair',
              eye_color: 'blue',
              birth_year: '19BBY',
              gender: 'male',
            },
          },
        });
      })
    );

    const character = await firstValueFrom(service.getCharacter('1'));
    expect(character.name).toBe('Luke Skywalker');
    expect(character.height).toBe('172');
  });

  it('should search characters', async () => {
    server.use(
      http.get(`${environment.apiUrl}people`, ({ request }) => {
        // Verify the search parameter is present
        const url = new URL(request.url);
        const searchTerm = url.searchParams.get('name');
        expect(searchTerm).toBe('Luke');

        return HttpResponse.json({
          message: 'ok',
          total_records: 1,
          total_pages: 1,
          previous: null,
          next: null,
          results: [
            {
              uid: '1',
              name: 'Luke Skywalker',
              url: 'https://www.swapi.tech/api/people/1',
            },
          ],
        });
      })
    );

    const response = await firstValueFrom(service.searchCharacters('Luke'));
    expect(response.results.length).toBeGreaterThan(0);
    expect(response.results[0].name).toContain('Luke');
  });

  it('should handle errors', async () => {
    server.use(
      http.get(`${environment.apiUrl}people`, () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    try {
      await firstValueFrom(service.getCharacters());
      // This line should not be reached
      fail('Expected error but got success');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});
