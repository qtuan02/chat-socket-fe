export interface BaseResponse<T> {
  data: T;
  message: string | null;
  status: number;
}
