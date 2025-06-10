import { http, HttpResponse } from 'msw';
import { environment } from '../environments/environment';

// Sample character data matching the swapi.tech API format with expanded=true
const characters = [
  {
    _id: '5f63a36eee9fd7000499be42',
    uid: '1',
    name: 'Luke Skywalker',
    url: 'https://www.swapi.tech/api/people/1',
    __v: 0,
    description: 'A person within the Star Wars universe',
    properties: {
      name: 'Luke Skywalker',
      height: '172',
      mass: '77',
      hair_color: 'blond',
      skin_color: 'fair',
      eye_color: 'blue',
      birth_year: '19BBY',
      gender: 'male',
      homeworld: 'https://www.swapi.tech/api/planets/1',
      created: '2023-12-09T13:50:51.644000Z',
      edited: '2023-12-20T21:17:56.891000Z',
      url: 'https://www.swapi.tech/api/people/1',
    },
  },
  {
    _id: '5f63a36eee9fd7000499be43',
    uid: '2',
    name: 'C-3PO',
    url: 'https://www.swapi.tech/api/people/2',
    __v: 0,
    description: 'A person within the Star Wars universe',
    properties: {
      name: 'C-3PO',
      height: '167',
      mass: '75',
      hair_color: 'n/a',
      skin_color: 'gold',
      eye_color: 'yellow',
      birth_year: '112BBY',
      gender: 'n/a',
      homeworld: 'https://www.swapi.tech/api/planets/1',
      created: '2023-12-10T15:10:51.357000Z',
      edited: '2023-12-20T21:17:50.309000Z',
      url: 'https://www.swapi.tech/api/people/2',
    },
  },
  {
    _id: '5f63a36eee9fd7000499be44',
    uid: '3',
    name: 'R2-D2',
    url: 'https://www.swapi.tech/api/people/3',
    __v: 0,
    description: 'A person within the Star Wars universe',
    properties: {
      name: 'R2-D2',
      height: '96',
      mass: '32',
      hair_color: 'n/a',
      skin_color: 'white, blue',
      eye_color: 'red',
      birth_year: '33BBY',
      gender: 'n/a',
      homeworld: 'https://www.swapi.tech/api/planets/8',
      created: '2023-12-10T15:11:50.376000Z',
      edited: '2023-12-20T21:17:50.311000Z',
      url: 'https://www.swapi.tech/api/people/3',
    },
  },
];

// Base URL from environment
const baseUrl = environment.apiUrl;

export const handlers = [
  // Handle GET request for all characters with pagination and expanded=true
  http.get(`${baseUrl}people`, ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';
    const expanded = url.searchParams.get('expanded') === 'true';
    const searchTerm = url.searchParams.get('name')?.toLowerCase();

    // Handle search if name parameter is present
    if (searchTerm) {
      const filteredResults = characters.filter(char =>
        char.name.toLowerCase().includes(searchTerm)
      );

      return HttpResponse.json({
        message: 'ok',
        total_records: filteredResults.length,
        total_pages: 1,
        previous: null,
        next: null,
        results: expanded
          ? filteredResults
          : filteredResults.map(({ uid, name, url }) => ({ uid, name, url })),
      });
    }

    // Calculate pagination for normal requests
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedResults = characters.slice(startIndex, endIndex);

    // The Cosmic Compiler appreciates realistic mock responses
    return HttpResponse.json({
      message: 'ok',
      total_records: characters.length,
      total_pages: Math.ceil(characters.length / limitNum),
      previous:
        pageNum > 1 ? `${baseUrl}people?page=${pageNum - 1}&limit=${limit}&expanded=true` : null,
      next:
        endIndex < characters.length
          ? `${baseUrl}people?page=${pageNum + 1}&limit=${limit}&expanded=true`
          : null,
      results: expanded
        ? paginatedResults
        : paginatedResults.map(({ uid, name, url }) => ({ uid, name, url })),
    });
  }),

  // Handle GET request for a specific character
  http.get(`${baseUrl}people/:id`, ({ params }) => {
    const { id } = params;
    const character = characters.find(char => char.uid === id);

    if (!character) {
      // The Ancient Order of Angular teaches us to handle errors gracefully
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json({
      message: 'ok',
      result: character,
    });
  }),

  // Handle error scenario for testing
  http.get(`${baseUrl}error-test`, () => {
    return new HttpResponse(null, { status: 500 });
  }),
];
