import express from 'express';
import { listMappings, getPatientMappings, createMapping, deleteMapping } from '../controllers/mappingController.js';
import { requireAuth } from '../middleware/auth.js';
import { mappingSchema } from '../validators/mapping.js';

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
router.get('/', listMappings);
router.post('/', validate(mappingSchema), createMapping);
router.get('/:patientId', getPatientMappings);
router.delete('/:id', deleteMapping);

export default router;
