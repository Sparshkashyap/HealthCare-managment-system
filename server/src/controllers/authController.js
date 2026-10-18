import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError, normalizeEmail } from '../utils/apiResponse.js';

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

const attachAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return sendError(res, 409, 'Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        fullName,
        email: normalizedEmail,
        password: hashedPassword,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
      },
    });

    const token = signToken(user);
    attachAuthCookie(res, token);

    return sendSuccess(res, 201, 'Registration successful', { user, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const token = signToken(user);
    attachAuthCookie(res, token);

    return sendSuccess(res, 200, 'Login successful', {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie('token');
  return sendSuccess(res, 200, 'Logged out successfully');
};

export const me = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, 'User profile loaded', {
      user: {
        id: req.user.id,
        fullName: req.user.fullName,
        email: req.user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};
