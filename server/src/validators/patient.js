import { z } from 'zod';

export const patientSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  dateOfBirth: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Invalid date of birth',
  }),
  gender: z.string().min(1).max(30),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  phoneNumber: z.string().max(30).optional().or(z.literal('')),
  address: z.string().max(300).optional().or(z.literal('')),
  medicalNotes: z.string().max(2500).optional().or(z.literal('')),
});
