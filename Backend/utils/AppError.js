class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // Automatically set status to 'fail' for 4xx errors, and 'error' for 5xx errors
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    // Operational errors are predictable user/input errors, not application crashes
    this.isOperational = true;

    // Captures the stack trace while preventing this constructor function from appearing in it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;