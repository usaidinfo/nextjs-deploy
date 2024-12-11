export interface Location {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  location_id: any;
  id: number;
  location_name: string;
}

export interface CreateLocationRequest {
  location_name: string;
}

export interface LocationResponse {
  data: boolean;
  success: boolean;
  message?: string;
  locations?: Location[];
}