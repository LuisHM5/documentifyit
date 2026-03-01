export class ApiException extends Error {
  public statusCode: number;
  public error: string;

  constructor(statusCode: number, message: string, error: string) {
    super(message);
    this.name = 'ApiException';
    this.statusCode = statusCode;
    this.error = error;
    Error.captureStackTrace(this, this.constructor);
  }
}
