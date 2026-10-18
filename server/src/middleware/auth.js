import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { sendError } from '../utils/apiResponse.js';

export const requireAuth = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return sendError(res, 401, 'Authentication required');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return sendError(res, 401, 'User no longer exists');
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    };
    next();
  } catch (error) {
    return sendError(res, 401, 'Invalid or expired token');
  }
};
