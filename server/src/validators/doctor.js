import { z } from 'zod';

export const doctorSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  specialization: z.string().trim().min(2).max(120),
  email: z.string().trim().email('Invalid email address'),
  phoneNumber: z.string().max(30).optional().or(z.literal('')),
  clinicAddress: z.string().max(300).optional().or(z.literal('')),
  yearsOfExperience: z.coerce.number().int().min(0).max(100),
  registrationNumber: z.string().max(50).optional().or(z.literal('')),
});
