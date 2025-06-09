import { ApiResponse, ApiDetailResponse } from './api-response.model';

// Character list item in results array
export interface CharacterListItem {
  uid?: string;
  name?: string;
  url?: string;
  // For expanded=true responses
  properties?: Character;
  description?: string;
  _id?: string;
  __v?: number;
}

// Full character details
export interface Character {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  created: string;
  edited: string;
  url: string;
}

// Export type aliases for our specific use cases
export type CharacterResponse = ApiResponse<CharacterListItem>;
export type CharacterDetailResponse = ApiDetailResponse<Character>;
