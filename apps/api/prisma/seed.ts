import { PrismaClient, Modality } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PHASES, ROLES } from '@iter/shared';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Estrategia de Seeding Profesional:
 * 1. Idempotencia: Usar upsert siempre que sea posible.
 * 2. Modularidad: Separar infraestructura de datos de ejemplo.
 * 3. Validación: Usar constantes compartidas.
 */

async function seedInfrastructure() {
  console.log('🏗️  Configurando infraestructura base (Roles y Sectores)...');

  const roles = await Promise.all(
    Object.values(ROLES).map((roleName) =>
      prisma.role.upsert({
        where: { roleName: roleName },
        update: {},
        create: { roleName: roleName },
      })
    )
  );

  const rolesMap = {
    ADMIN: roles.find((r) => r.roleName === ROLES.ADMIN)!,
    COORDINATOR: roles.find((r) => r.roleName === ROLES.COORDINATOR)!,
    TEACHER: roles.find((r) => r.roleName === ROLES.TEACHER)!,
  };

  const sectors = ['Transformación Digital', 'Creación Artística', 'Industrial y Logística'];
  const createdSectors = await Promise.all(
    sectors.map((name) =>
      prisma.sector.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  return {
    roles: rolesMap,
    sectors: {
      tech: createdSectors.find((s) => s.name === 'Transformación Digital')!,
      creative: createdSectors.find((s) => s.name === 'Creación Artística')!,
      industrial: createdSectors.find((s) => s.name === 'Industrial y Logística')!,
    },
  };
}

async function seedUsers(roles: any, passDefault: string) {
  console.log('👥  Generando usuarios y centros de prueba...');

  // 1. Administrador Global
  await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      fullName: 'Administrador Global',
      email: 'admin@admin.com',
      passwordHash: passDefault,
      roleId: roles.ADMIN.roleId,
    },
  });

  // 2. Centros
  const centersData = [
    {
      code: '08014231',
      name: 'Institut Joan Brossa',
      email: 'a8014231@xtec.cat',
      address: 'Carrer de la Mare de Déu del Port, 397',
      phone: '934 32 30 54',
      coordEmail: 'coordinacion@brossa.cat',
      coordName: 'Coord. Joan Brossa',
    },
    {
      code: '08013147',
      name: 'Institut Pau Claris',
      email: 'a8013147@xtec.cat',
      address: 'Passeig de Lluís Companys, 18',
      phone: '932 68 02 11',
      coordEmail: 'coordinacion@pauclaris.cat',
      coordName: 'Coord. Pau Claris',
    },
  ];

  const centers = [];
  for (const c of centersData) {
    const center = await prisma.center.upsert({
      where: { centerCode: c.code },
      update: { name: c.name },
      create: {
        centerCode: c.code,
        name: c.name,
        contactEmail: c.email,
        address: c.address,
        contactPhone: c.phone,
      },
    });
    centers.push(center);

    await prisma.user.upsert({
      where: { email: c.coordEmail },
      update: { passwordHash: passDefault },
      create: {
        fullName: c.coordName,
        email: c.coordEmail,
        passwordHash: passDefault,
        roleId: roles.COORDINATOR.roleId,
        centerId: center.centerId,
      },
    });
  }

  // 3. Profesores
  const brossaProfs = ['Laura Martínez', 'Jordi Soler'];
  const clarisProfs = ['Anna Ferrer', 'Marc Dalmau'];

  for (const name of brossaProfs) {
    const email = `${name.toLowerCase().replace(' ', '.').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@brossa.cat`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        fullName: name,
        email,
        passwordHash: passDefault,
        roleId: roles.TEACHER.roleId,
        centerId: centers[0].centerId,
      },
    });
    await prisma.teacher.upsert({
      where: { userId: user.userId },
      update: {},
      create: { 
        name: name, 
        contact: email, 
        centerId: centers[0].centerId, 
        userId: user.userId 
      },
    });
  }

  for (const name of clarisProfs) {
    const email = `${name.toLowerCase().replace(' ', '.').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@pauclaris.cat`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        fullName: name,
        email,
        passwordHash: passDefault,
        roleId: roles.TEACHER.roleId,
        centerId: centers[1].centerId,
      },
    });
    await prisma.teacher.upsert({
      where: { userId: user.userId },
      update: {},
      create: { 
        name: name, 
        contact: email, 
        centerId: centers[1].centerId, 
        userId: user.userId 
      },
    });
  }

  return centers;
}

async function seedWorkshops(sectors: any) {
  console.log('📚  Generando catálogo de talleres...');
  const workshops = [
    { title: 'Robótica e IoT', sectorId: sectors.tech.sectorId, modality: Modality.A, icon: 'ROBOT' },
    { title: 'Cine Digital', sectorId: sectors.creative.sectorId, modality: Modality.B, icon: 'FILM' },
    { title: 'Impresión 3D', sectorId: sectors.industrial.sectorId, modality: Modality.A, icon: 'TOOLS' },
    { title: 'Desarrollo Web', sectorId: sectors.tech.sectorId, modality: Modality.C, icon: 'CODE' },
  ];

  for (const w of workshops) {
    await prisma.workshop.create({ 
      data: {
        title: w.title,
        modality: w.modality,
        sectorId: w.sectorId,
        durationHours: 3,
        maxPlaces: 20,
        icon: w.icon,
        description: `Exploración práctica de ${w.title}.`,
      },
    });
  }
}

async function seedPhases() {
  console.log('🗓️   Configurando fases del programa...');
  const now = new Date();
  const currentYear = now.getFullYear();

  const phasesData = [
    { name: PHASES.APPLICATION, order: 1, isActive: true },
    { name: PHASES.PLANNING, order: 2, isActive: false },
    { name: PHASES.EXECUTION, order: 3, isActive: false },
    { name: PHASES.CLOSURE, order: 4, isActive: false },
  ];

  for (const phase of phasesData) {
    let startDate: Date;
    let endDate: Date;
    let isActive = false;

    // Sequential dates logic
    switch (phase.name) {
      case PHASES.APPLICATION:
        // Set Application active starting 1 week ago until 3 months from now
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        endDate = new Date(now.getFullYear(), now.getMonth() + 3, 0);
        isActive = true; // Set APPLICATION as the active phase for testing
        break;
      case PHASES.PLANNING:
        startDate = new Date(now.getFullYear(), now.getMonth() + 3, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 4, 0);
        break;
      case PHASES.EXECUTION:
        startDate = new Date(now.getFullYear(), now.getMonth() + 4, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 7, 0);
        break;
      case PHASES.CLOSURE:
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() + 7, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 8, 0);
        break;
    }

    await prisma.phase.upsert({
      where: { name: phase.name },
      update: { 
        order: phase.order, 
        isActive: isActive,
        startDate,
        endDate
      },
      create: {
        name: phase.name,
        order: phase.order,
        isActive: isActive,
        startDate,
        endDate,
      },
    });
  }
}

async function main() {
  console.log('🌱  Iniciando proceso de seeding...');

  const infra = await seedInfrastructure();

  const salt = await bcrypt.genSalt(10);
  const passDefault = await bcrypt.hash('Iter@1234', salt);

  await seedUsers(infra.roles, passDefault);
  await seedWorkshops(infra.sectors);
  await seedPhases();

  console.log('✅  Seeding completado con éxito.');
}

main()
  .catch((e) => {
    console.error('❌  Error en el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
