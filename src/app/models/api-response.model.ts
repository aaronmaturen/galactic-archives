export interface ApiResponse<T> {
  message: string;
  total_records: number;
  total_pages: number;
  previous: string | null;
  next: string | null;
  results: T[];
}

export interface ApiDetailResponse<T> {
  message: string;
  result: {
    properties: T;
    description: string;
    uid: string;
  };
}
