"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const users = await prisma.user.findMany();
    const companies = await prisma.company.findMany();
    const zonas = await prisma.zona.findMany();
    console.log('Users:', users);
    console.log('Companies:', companies);
    console.log('Zonas:', zonas);
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=check-data.js.map