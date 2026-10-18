import { sendError } from '../utils/apiResponse.js';

export const notFoundHandler = (req, res) => {
  sendError(res, 404, 'Route not found');
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error('Unhandled error:', err.message);

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  sendError(res, statusCode, message, process.env.NODE_ENV === 'development' ? [err.message] : []);
};
