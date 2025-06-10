export interface ApiResponse<T> {
  message: string;
  total_records: number;
  total_pages: number;
  previous: string | null;
  next: string | null;
  results: T[];
}

export interface ApiSearchResponse<T> {
  message: string;
  result: T[];
  apiVersion?: string;
  timestamp?: string;
}

export interface ApiDetailResponse<T> {
  message: string;
  result: {
    properties: T;
    description: string;
    uid: string;
  };
}
