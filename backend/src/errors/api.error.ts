export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    public readonly message: string,
    public readonly fieldErrors?: any[]
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static badRequest(message: string, code: string = 'BAD_REQUEST', fieldErrors?: any[]) {
    return new ApiError(400, code, message, fieldErrors);
  }

  static notFound(message: string = 'Not found', code: string = 'NOT_FOUND') {
    return new ApiError(404, code, message);
  }

  static conflict(message: string, code: string = 'CONFLICT') {
    return new ApiError(409, code, message);
  }

  static internal(message: string = 'Internal server error', code: string = 'INTERNAL_ERROR') {
    return new ApiError(500, code, message);
  }
}
