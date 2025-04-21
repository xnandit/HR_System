import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    const password = await bcrypt.hash('password123', 10);
    console.log('Seeding users...');

    // Staff 1
    await prisma.user.upsert({
      where: { email: 'staff1@example.com' },
      update: {},
      create: {
        email: 'staff1@example.com',
        name: 'Staff Satu',
        password,
        role: 'employee',
      },
    });
    console.log('Staff 1 seeded');

    // Staff 2
    await prisma.user.upsert({
      where: { email: 'staff2@example.com' },
      update: {},
      create: {
        email: 'staff2@example.com',
        name: 'Staff Dua',
        password,
        role: 'employee',
      },
    });
    console.log('Staff 2 seeded');

    // HRD/Supervisor
    await prisma.user.upsert({
      where: { email: 'hrd@example.com' },
      update: {},
      create: {
        email: 'hrd@example.com',
        name: 'HRD Supervisor',
        password,
        role: 'admin',
      },
    });
    console.log('HRD seeded');

    // Company & Zona Example Data
    console.log('Seeding companies and zonas...');
    const companyA = await prisma.company.upsert({
      where: { name: 'PT.A' },
      update: {},
      create: { name: 'PT.A' },
    });
    console.log('Company PT.A seeded');
    const companyB = await prisma.company.upsert({
      where: { name: 'PT.B' },
      update: {},
      create: { name: 'PT.B' },
    });
    console.log('Company PT.B seeded');

    // Zona 1: Kantor Cabang 1 (Jakarta)
    const zona1 = await prisma.zona.upsert({
      where: { name: 'Kantor Cabang 1' },
      update: {},
      create: {
        name: 'Kantor Cabang 1',
        companyId: companyA.id,
        timeZone: 'Asia/Jakarta',
      },
    });
    console.log('Zona Kantor Cabang 1 seeded');

    // Zona 2: Kantor Cabang 2 (Makassar)
    const zona2 = await prisma.zona.upsert({
      where: { name: 'Kantor Cabang 2' },
      update: {},
      create: {
        name: 'Kantor Cabang 2',
        companyId: companyA.id,
        timeZone: 'Asia/Makassar',
      },
    });
    console.log('Zona Kantor Cabang 2 seeded');

    // Zona 3: Gudang Pusat (Jayapura)
    const zona3 = await prisma.zona.upsert({
      where: { name: 'Gudang Pusat' },
      update: {},
      create: {
        name: 'Gudang Pusat',
        companyId: companyB.id,
        timeZone: 'Asia/Jayapura',
      },
    });
    console.log('Zona Gudang Pusat seeded');

    // ZonaSchedule Example Data
    if (zona1) {
      await prisma.zonaSchedule.upsert({
        where: { zonaId: zona1.id },
        update: {},
        create: {
          zonaId: zona1.id,
          checkinTime: '08:00',
          checkoutTime: '17:00',
          toleranceMin: 15,
        },
      });
      console.log('ZonaSchedule Kantor Cabang 1 seeded');
    }
    if (zona2) {
      await prisma.zonaSchedule.upsert({
        where: { zonaId: zona2.id },
        update: {},
        create: {
          zonaId: zona2.id,
          checkinTime: '08:30',
          checkoutTime: '17:30',
          toleranceMin: 10,
        },
      });
      console.log('ZonaSchedule Kantor Cabang 2 seeded');
    }
    if (zona3) {
      await prisma.zonaSchedule.upsert({
        where: { zonaId: zona3.id },
        update: {},
        create: {
          zonaId: zona3.id,
          checkinTime: '09:00',
          checkoutTime: '18:00',
          toleranceMin: 20,
        },
      });
      console.log('ZonaSchedule Gudang Pusat seeded');
    }

    console.log('Seeding selesai!');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
