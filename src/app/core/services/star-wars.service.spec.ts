import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StarWarsService } from './star-wars.service';
import { environment } from '../../../environments/environment';
import { Character, CharacterListItem } from '../../models/character.model';
import { ApiResponse, ApiDetailResponse } from '../../models/api-response.model';

// Use the same type aliases as the service
type CharacterResponse = ApiResponse<CharacterListItem>;
type CharacterDetailResponse = ApiDetailResponse<Character>;

describe('StarWarsService', () => {
  let service: StarWarsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StarWarsService],
    });
    service = TestBed.inject(StarWarsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get characters', () => {
    const mockResponse: CharacterResponse = {
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
    };

    service.getCharacters().subscribe(response => {
      expect(response.results.length).toBe(1);
      expect(response.results[0].name).toBe('Luke Skywalker');
      expect(response.results[0].uid).toBe('1');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}people?page=1&limit=10&expanded=true`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get a specific character', () => {
    const mockCharacterData: Character = {
      name: 'Luke Skywalker',
      height: '172',
      mass: '77',
      hair_color: 'blond',
      skin_color: 'fair',
      eye_color: 'blue',
      birth_year: '19BBY',
      gender: 'male',
      homeworld: 'https://www.swapi.tech/api/planets/1',
      created: '2020-09-17T06:49:05.235Z',
      edited: '2020-09-17T06:49:05.235Z',
      url: 'https://www.swapi.tech/api/people/1',
    };

    const mockResponse: CharacterDetailResponse = {
      message: 'ok',
      result: {
        properties: mockCharacterData,
        description: 'A person within the Star Wars universe',
        uid: '1',
      },
    };

    service.getCharacter('1').subscribe(character => {
      expect(character).toEqual(mockCharacterData);
      expect(character.name).toBe('Luke Skywalker');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}people/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should search characters', () => {
    const mockResponse: CharacterResponse = {
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
    };

    service.searchCharacters('Luke').subscribe(response => {
      expect(response.results.length).toBe(1);
      expect(response.results[0].name).toBe('Luke Skywalker');
      expect(response.results[0].uid).toBe('1');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}people?name=Luke`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  // The Cosmic Compiler approves of testing only what's necessary
});
