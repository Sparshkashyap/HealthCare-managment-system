import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';

const uniqueEmail = (prefix = 'user') => `${prefix}${Date.now()}${Math.random().toString(36).slice(2)}@example.com`;

const buildUser = (prefix = 'user') => ({
  fullName: `Test ${prefix}`,
  email: uniqueEmail(prefix),
  password: 'Password123!',
  confirmPassword: 'Password123!',
});

const registerUser = async (user) => request(app).post('/api/auth/register').send(user);

const loginUser = async (email, password) => request(app).post('/api/auth/login').send({ email, password });

describe('Healthcare API', () => {
  let user;
  let patientId;
  let doctorId;
  let mappingId;

  beforeAll(async () => {
    user = buildUser('auth');
    const registerResponse = await registerUser(user);
    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.success).toBe(true);
  });

  afterAll(async () => {
    await prisma.patientDoctorMapping.deleteMany({
      where: {
        OR: [{ patientId: patientId || undefined }, { doctorId: doctorId || undefined }],
      },
    });

    if (patientId) {
      await prisma.patient.deleteMany({ where: { id: patientId } });
    }

    if (doctorId) {
      await prisma.doctor.deleteMany({ where: { id: doctorId } });
    }

    await prisma.user.deleteMany({ where: { email: user.email } });
    await prisma.$disconnect();
  });

  it('registers a new user and rejects duplicate emails', async () => {
    const duplicateUser = buildUser('duplicate');
    const firstResponse = await registerUser(duplicateUser);
    expect(firstResponse.status).toBe(201);

    const duplicateResponse = await registerUser(duplicateUser);
    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.message).toMatch(/already registered/i);
  });

  it('logs in and returns the authenticated profile', async () => {
    const loginResponse = await loginUser(user.email, user.password);
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.data.user.email).toBe(user.email);

    const agent = request.agent(app);
    const cookieHeader = loginResponse.headers['set-cookie'];
    expect(cookieHeader).toBeDefined();

    const meResponse = await agent.get('/api/auth/me').set('Cookie', cookieHeader);
    expect(meResponse.status).toBe(200);
    expect(meResponse.body.data.user.email).toBe(user.email);
  });

  it('creates, updates, and lists patients for the authenticated user', async () => {
    const agent = request.agent(app);
    const loginResponse = await loginUser(user.email, user.password);
    const cookieHeader = loginResponse.headers['set-cookie'];

    const createResponse = await agent
      .post('/api/patients')
      .set('Cookie', cookieHeader)
      .send({
        fullName: 'Alice Johnson',
        dateOfBirth: '1990-04-15',
        gender: 'Female',
        email: 'alice.johnson@example.com',
        phoneNumber: '+1-555-2200',
        address: '10 Birch Street, Boston',
        medicalNotes: 'Routine review',
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    patientId = createResponse.body.data.id;

    const listResponse = await agent.get('/api/patients').set('Cookie', cookieHeader);
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.data.some((entry) => entry.id === patientId)).toBe(true);

    const updateResponse = await agent
      .put(`/api/patients/${patientId}`)
      .set('Cookie', cookieHeader)
      .send({
        fullName: 'Alice Johnson Updated',
        dateOfBirth: '1990-04-15',
        gender: 'Female',
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.fullName).toBe('Alice Johnson Updated');
  });

  it('creates doctors and assigns them to patients with ownership checks', async () => {
    const agent = request.agent(app);
    const loginResponse = await loginUser(user.email, user.password);
    const cookieHeader = loginResponse.headers['set-cookie'];

    const doctorResponse = await agent
      .post('/api/doctors')
      .set('Cookie', cookieHeader)
      .send({
        fullName: 'Dr. Emma Smith',
        specialization: 'Cardiology',
        email: uniqueEmail('doctor'),
        phoneNumber: '+1-555-0101',
        clinicAddress: '123 Wellness Ave, Boston',
        yearsOfExperience: 12,
        registrationNumber: `REG-${Date.now()}`,
      });

    expect(doctorResponse.status).toBe(201);
    doctorId = doctorResponse.body.data.id;

    const mappingResponse = await agent
      .post('/api/mappings')
      .set('Cookie', cookieHeader)
      .send({ patientId, doctorId });

    expect(mappingResponse.status).toBe(201);
    expect(mappingResponse.body.success).toBe(true);
    mappingId = mappingResponse.body.data.id;

    const duplicateMapping = await agent.post('/api/mappings').set('Cookie', cookieHeader).send({ patientId, doctorId });
    expect(duplicateMapping.status).toBe(409);

    const deleteResponse = await agent.delete(`/api/mappings/${mappingId}`).set('Cookie', cookieHeader);
    expect(deleteResponse.status).toBe(200);
  });

  it('rejects unauthenticated access and invalid patient IDs', async () => {
    const noAuthList = await request(app).get('/api/patients');
    expect(noAuthList.status).toBe(401);

    const invalidPatient = await request(app).get('/api/patients/not-a-real-id');
    expect(invalidPatient.status).toBe(401);
  });
});
