import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const demoPassword = await bcrypt.hash('Password123!', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@healthcare.local' },
    update: {},
    create: {
      fullName: 'Demo User',
      email: 'demo@healthcare.local',
      password: demoPassword,
    },
  });

  const doctor1 = await prisma.doctor.upsert({
    where: { email: 'dr.smith@healthcare.local' },
    update: {},
    create: {
      fullName: 'Dr. Emma Smith',
      specialization: 'Cardiology',
      email: 'dr.smith@healthcare.local',
      phoneNumber: '+1-555-0101',
      clinicAddress: '123 Wellness Ave, Boston',
      yearsOfExperience: 12,
      registrationNumber: 'REG-1001',
    },
  });

  const doctor2 = await prisma.doctor.upsert({
    where: { email: 'dr.jones@healthcare.local' },
    update: {},
    create: {
      fullName: 'Dr. Liam Jones',
      specialization: 'Neurology',
      email: 'dr.jones@healthcare.local',
      phoneNumber: '+1-555-0102',
      clinicAddress: '45 Cedar Clinic, Chicago',
      yearsOfExperience: 9,
      registrationNumber: 'REG-1002',
    },
  });

  const patient = await prisma.patient.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      fullName: 'Alice Johnson',
      dateOfBirth: new Date('1990-04-15'),
      gender: 'Female',
      email: 'alice.johnson@example.com',
      phoneNumber: '+1-555-2200',
      address: '10 Birch Street, Boston',
      medicalNotes: 'Routine cardiology review',
      createdById: user.id,
    },
  });

  await prisma.patientDoctorMapping.upsert({
    where: {
      patientId_doctorId: {
        patientId: patient.id,
        doctorId: doctor1.id,
      },
    },
    update: {},
    create: {
      patientId: patient.id,
      doctorId: doctor1.id,
    },
  });

  console.log('Demo seed executed successfully');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
