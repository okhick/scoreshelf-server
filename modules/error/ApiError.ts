export default class ApiError {
  code;
  message;
  constructor(code: number, message: string) {
    this.code = code;
    this.message = message;
  }

  static noFiles(message: string) {
    return new ApiError(400, message);
  }

  static badData(message: string) {
    return new ApiError(400, message);
  }

  static authFailed(message: string) {
    return new ApiError(403, message);
  }

  static publisherError(message: string) {
    return new ApiError(400, message);
  }
}
