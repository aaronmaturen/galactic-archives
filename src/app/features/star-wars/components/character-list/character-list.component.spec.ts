import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacterListComponent } from './character-list.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StarWarsService } from '../../../../core/services/star-wars.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Character } from '../../../../models/character.model';

describe('CharacterListComponent', () => {
  let component: CharacterListComponent;
  let fixture: ComponentFixture<CharacterListComponent>;
  let starWarsServiceMock: { getCharacters: jest.Mock };

  beforeEach(async () => {
    // Create a mock service using Jest
    const mockService = { getCharacters: jest.fn() };

    // Character data for expanded response
    const characterData: Character = {
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

    // Mock expanded list response
    mockService.getCharacters.mockReturnValue(
      of({
        message: 'ok',
        total_records: 82,
        total_pages: 9,
        previous: null,
        next: 'https://www.swapi.tech/api/people?page=2&limit=10&expanded=true',
        results: [
          {
            properties: characterData,
            description: 'A person within the Star Wars universe',
            _id: '5f63a36eee9fd7000499be42',
            uid: '1',
            __v: 2,
          },
        ],
      })
    );

    await TestBed.configureTestingModule({
      imports: [CharacterListComponent, NoopAnimationsModule, HttpClientTestingModule],
      providers: [{ provide: StarWarsService, useValue: mockService }],
    }).compileComponents();

    starWarsServiceMock = TestBed.inject(StarWarsService) as unknown as {
      getCharacters: jest.Mock;
    };
    fixture = TestBed.createComponent(CharacterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load characters on init', () => {
    expect(starWarsServiceMock.getCharacters).toHaveBeenCalled();
    expect(component.characters.length).toBe(1);
    expect(component.characters[0].name).toBe('Luke Skywalker');
  });
});
