import express from 'express';
import { listDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor } from '../controllers/doctorController.js';
import { requireAuth } from '../middleware/auth.js';
import { doctorSchema } from '../validators/doctor.js';

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

router.get('/', listDoctors);
router.get('/:id', getDoctor);
router.use(requireAuth);
router.post('/', validate(doctorSchema), createDoctor);
router.put('/:id', validate(doctorSchema), updateDoctor);
router.delete('/:id', deleteDoctor);

export default router;
