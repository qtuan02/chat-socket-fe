export interface BaseResponse<T> {
  data: T;
  message: string | null;
  status: number;
}

export type PaginationRequest = {
  limit?: number;
  cursor?: string;
  offset?: number;
};

export type PaginationResponse<T> = {
  messages: T[];
  nextCursor?: string;
  nextOffset?: number;
};
