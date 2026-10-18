import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError, normalizeEmail } from '../utils/apiResponse.js';

const formatPatient = (patient) => ({
  ...patient,
  dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.toISOString() : null,
  createdAt: patient.createdAt ? patient.createdAt.toISOString() : null,
  updatedAt: patient.updatedAt ? patient.updatedAt.toISOString() : null,
});

export const listPatients = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const search = (req.query.search || '').toString().trim();

    const where = {
      createdById: req.user.id,
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const total = await prisma.patient.count({ where });
    const patients = await prisma.patient.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 200, 'Patients retrieved successfully', {
      data: patients.map(formatPatient),
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

export const getPatient = async (req, res, next) => {
  try {
    const patient = await prisma.patient.findFirst({
      where: { id: req.params.id, createdById: req.user.id },
      include: {
        mappings: {
          include: {
            doctor: true,
          },
        },
      },
    });

    if (!patient) {
      return sendError(res, 404, 'Patient not found');
    }

    return sendSuccess(res, 200, 'Patient retrieved successfully', formatPatient(patient));
  } catch (error) {
    next(error);
  }
};

export const createPatient = async (req, res, next) => {
  try {
    const { fullName, dateOfBirth, gender, email, phoneNumber, address, medicalNotes } = req.body;

    const patient = await prisma.patient.create({
      data: {
        fullName: fullName.trim(),
        dateOfBirth: new Date(dateOfBirth),
        gender,
        email: email ? normalizeEmail(email) : null,
        phoneNumber: phoneNumber || null,
        address: address || null,
        medicalNotes: medicalNotes || null,
        createdById: req.user.id,
      },
    });

    return sendSuccess(res, 201, 'Patient created successfully', formatPatient(patient));
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req, res, next) => {
  try {
    const existing = await prisma.patient.findFirst({
      where: { id: req.params.id, createdById: req.user.id },
    });

    if (!existing) {
      return sendError(res, 404, 'Patient not found');
    }

    const patient = await prisma.patient.update({
      where: { id: req.params.id },
      data: {
        fullName: req.body.fullName?.trim() || existing.fullName,
        dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : existing.dateOfBirth,
        gender: req.body.gender || existing.gender,
        email: req.body.email ? normalizeEmail(req.body.email) : existing.email,
        phoneNumber: req.body.phoneNumber ?? existing.phoneNumber,
        address: req.body.address ?? existing.address,
        medicalNotes: req.body.medicalNotes ?? existing.medicalNotes,
      },
    });

    return sendSuccess(res, 200, 'Patient updated successfully', formatPatient(patient));
  } catch (error) {
    next(error);
  }
};

export const deletePatient = async (req, res, next) => {
  try {
    const patient = await prisma.patient.findFirst({
      where: { id: req.params.id, createdById: req.user.id },
    });

    if (!patient) {
      return sendError(res, 404, 'Patient not found');
    }

    await prisma.patient.delete({ where: { id: req.params.id } });
    return sendSuccess(res, 200, 'Patient deleted successfully');
  } catch (error) {
    next(error);
  }
};
