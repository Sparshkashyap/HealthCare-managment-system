import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError, normalizeEmail } from '../utils/apiResponse.js';

const formatDoctor = (doctor) => ({
  ...doctor,
  createdAt: doctor.createdAt ? doctor.createdAt.toISOString() : null,
  updatedAt: doctor.updatedAt ? doctor.updatedAt.toISOString() : null,
});

export const listDoctors = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = (req.query.search || '').toString().trim();
    const specialization = (req.query.specialization || '').toString().trim();

    const where = {
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { specialization: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(specialization ? { specialization: { contains: specialization, mode: 'insensitive' } } : {}),
    };

    const total = await prisma.doctor.count({ where });
    const doctors = await prisma.doctor.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { fullName: 'asc' },
    });

    return sendSuccess(res, 200, 'Doctors retrieved successfully', {
      data: doctors.map(formatDoctor),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctor = async (req, res, next) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { id: req.params.id } });
    if (!doctor) {
      return sendError(res, 404, 'Doctor not found');
    }
    return sendSuccess(res, 200, 'Doctor retrieved successfully', formatDoctor(doctor));
  } catch (error) {
    next(error);
  }
};

export const createDoctor = async (req, res, next) => {
  try {
    const { fullName, specialization, email, phoneNumber, clinicAddress, yearsOfExperience, registrationNumber } = req.body;

    const existing = await prisma.doctor.findUnique({ where: { email: normalizeEmail(email) } });
    if (existing) {
      return sendError(res, 409, 'Doctor with this email already exists');
    }

    const doctor = await prisma.doctor.create({
      data: {
        fullName: fullName.trim(),
        specialization: specialization.trim(),
        email: normalizeEmail(email),
        phoneNumber: phoneNumber || null,
        clinicAddress: clinicAddress || null,
        yearsOfExperience: Number(yearsOfExperience),
        registrationNumber: registrationNumber || null,
      },
    });

    return sendSuccess(res, 201, 'Doctor created successfully', formatDoctor(doctor));
  } catch (error) {
    next(error);
  }
};

export const updateDoctor = async (req, res, next) => {
  try {
    const existing = await prisma.doctor.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return sendError(res, 404, 'Doctor not found');
    }

    const doctor = await prisma.doctor.update({
      where: { id: req.params.id },
      data: {
        fullName: req.body.fullName?.trim() || existing.fullName,
        specialization: req.body.specialization?.trim() || existing.specialization,
        email: req.body.email ? normalizeEmail(req.body.email) : existing.email,
        phoneNumber: req.body.phoneNumber ?? existing.phoneNumber,
        clinicAddress: req.body.clinicAddress ?? existing.clinicAddress,
        yearsOfExperience: req.body.yearsOfExperience !== undefined ? Number(req.body.yearsOfExperience) : existing.yearsOfExperience,
        registrationNumber: req.body.registrationNumber ?? existing.registrationNumber,
      },
    });

    return sendSuccess(res, 200, 'Doctor updated successfully', formatDoctor(doctor));
  } catch (error) {
    next(error);
  }
};

export const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { id: req.params.id } });
    if (!doctor) {
      return sendError(res, 404, 'Doctor not found');
    }

    await prisma.doctor.delete({ where: { id: req.params.id } });
    return sendSuccess(res, 200, 'Doctor deleted successfully');
  } catch (error) {
    next(error);
  }
};
