import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const formatMapping = (mapping) => ({
  ...mapping,
  assignedAt: mapping.assignedAt.toISOString(),
});

export const listMappings = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const patientId = req.query.patientId ? String(req.query.patientId) : null;

    const where = patientId
      ? { patient: { createdById: req.user.id, id: patientId } }
      : { patient: { createdById: req.user.id } };

    const total = await prisma.patientDoctorMapping.count({ where });
    const mappings = await prisma.patientDoctorMapping.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { assignedAt: 'desc' },
    });

    return sendSuccess(res, 200, 'Assignments retrieved successfully', {
      data: mappings.map(formatMapping),
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

export const getPatientMappings = async (req, res, next) => {
  try {
    const patient = await prisma.patient.findFirst({
      where: { id: req.params.patientId, createdById: req.user.id },
    });

    if (!patient) {
      return sendError(res, 404, 'Patient not found');
    }

    const mappings = await prisma.patientDoctorMapping.findMany({
      where: { patientId: req.params.patientId },
      include: {
        doctor: true,
      },
      orderBy: { assignedAt: 'desc' },
    });

    return sendSuccess(res, 200, 'Patient assignments retrieved successfully', mappings.map(formatMapping));
  } catch (error) {
    next(error);
  }
};

export const createMapping = async (req, res, next) => {
  try {
    const { patientId, doctorId } = req.body;

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, createdById: req.user.id },
    });

    if (!patient) {
      return sendError(res, 404, 'Patient not found or not owned by you');
    }

    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      return sendError(res, 404, 'Doctor not found');
    }

    const existing = await prisma.patientDoctorMapping.findUnique({
      where: {
        patientId_doctorId: {
          patientId,
          doctorId,
        },
      },
    });

    if (existing) {
      return sendError(res, 409, 'This doctor is already assigned to the patient');
    }

    const mapping = await prisma.patientDoctorMapping.create({
      data: {
        patientId,
        doctorId,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    return sendSuccess(res, 201, 'Assignment created successfully', formatMapping(mapping));
  } catch (error) {
    next(error);
  }
};

export const deleteMapping = async (req, res, next) => {
  try {
    const mapping = await prisma.patientDoctorMapping.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });

    if (!mapping) {
      return sendError(res, 404, 'Assignment not found');
    }

    if (mapping.patient.createdById !== req.user.id) {
      return sendError(res, 403, 'You cannot delete assignments for another user\'s patients');
    }

    await prisma.patientDoctorMapping.delete({ where: { id: req.params.id } });
    return sendSuccess(res, 200, 'Assignment removed successfully');
  } catch (error) {
    next(error);
  }
};
