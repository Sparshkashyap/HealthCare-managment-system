import express from 'express';
import { z } from 'zod';
import { listPatients, getPatient, createPatient, updatePatient, deletePatient } from '../controllers/patientController.js';
import { requireAuth } from '../middleware/auth.js';
import { patientSchema } from '../validators/patient.js';

const router = express.Router();

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.issues.map((issue) => issue.message),
    });
  }
  req.body = result.data;
  next();
};

router.use(requireAuth);
router.get('/', listPatients);
router.post('/', validate(patientSchema), createPatient);
router.get('/:id', getPatient);
router.put('/:id', validate(patientSchema), updatePatient);
router.delete('/:id', deletePatient);

export default router;
