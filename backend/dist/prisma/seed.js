"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    const password = await bcrypt.hash('password123', 10);
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
    const companyA = await prisma.company.upsert({
        where: { name: 'PT.A' },
        update: {},
        create: { name: 'PT.A' },
    });
    const companyB = await prisma.company.upsert({
        where: { name: 'PT.B' },
        update: {},
        create: { name: 'PT.B' },
    });
    await prisma.zona.upsert({
        where: { name: 'Kantor Cabang 1' },
        update: {},
        create: { name: 'Kantor Cabang 1', companyId: companyA.id },
    });
    await prisma.zona.upsert({
        where: { name: 'Kantor Cabang 2' },
        update: {},
        create: { name: 'Kantor Cabang 2', companyId: companyA.id },
    });
    await prisma.zona.upsert({
        where: { name: 'Gudang Pusat' },
        update: {},
        create: { name: 'Gudang Pusat', companyId: companyB.id },
    });
    const zona1 = await prisma.zona.findUnique({ where: { name: 'Kantor Cabang 1' } });
    const zona2 = await prisma.zona.findUnique({ where: { name: 'Kantor Cabang 2' } });
    const zona3 = await prisma.zona.findUnique({ where: { name: 'Gudang Pusat' } });
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
    }
}
main()
    .then(() => {
    console.log('Seeding selesai!');
    return prisma.$disconnect();
})
    .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map