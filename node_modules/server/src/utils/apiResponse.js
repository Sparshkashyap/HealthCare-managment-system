export const sendSuccess = (res, statusCode = 200, message, data = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res, statusCode = 500, message, errors = []) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export const normalizeEmail = (email) => email.trim().toLowerCase();
