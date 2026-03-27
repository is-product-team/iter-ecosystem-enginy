import { PrismaClient, Modalitat } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PHASES, ROLES } from '@iter/shared';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Professional Seeding Strategy:
 * 1. Idempotency: Use upsert where possible.
 * 2. Modularity: Separate infrastructure from sample data.
 * 3. Validation: Use shared constants.
 */

async function seedInfrastructure() {
  console.log('🏗️  Configurant infraestructura base (Rols i Sectors)...');

  const roles = await Promise.all(
    Object.values(ROLES).map((roleName) =>
      prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName },
      })
    )
  );

  const rolesMap = {
    ADMIN: roles.find((r) => r.name === ROLES.ADMIN)!,
    COORDINATOR: roles.find((r) => r.name === ROLES.COORDINATOR)!,
    TEACHER: roles.find((r) => r.name === ROLES.TEACHER)!,
  };

  const sectors = ['Transformació Digital', 'Creació Artística', 'Industrial i Logística'];
  const createdSectors = await Promise.all(
    sectors.map((name) =>
      prisma.sector.upsert({
        where: { name: name },
        update: {},
        create: { name: name },
      })
    )
  );

  return {
    roles: rolesMap,
    sectors: {
      tecnologic: createdSectors.find((s) => s.name === 'Transformació Digital')!,
      creatiu: createdSectors.find((s) => s.name === 'Creació Artística')!,
      industrial: createdSectors.find((s) => s.name === 'Industrial i Logística')!,
    },
  };
}

async function seedUsers(roles: any, passDefault: string) {
  console.log('👥  Generant usuaris i centres de prova...');

  // 1. Admin Global
  await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      fullName: 'Administrador Global',
      email: 'admin@admin.com',
      passwordHash: passDefault,
      id_role: roles.ADMIN.id_role,
    },
  });

  // 2. Centres
  const centresData = [
    {
      codi: '08014231',
      nom: 'Institut Joan Brossa',
      email: 'a8014231@xtec.cat',
      adreca: 'Carrer de la Mare de Déu del Port, 397',
      tel: '934 32 30 54',
      coordEmail: 'coordinacion@brossa.cat',
      coordNom: 'Coord. Joan Brossa',
    },
    {
      codi: '08013147',
      nom: 'Institut Pau Claris',
      email: 'a8013147@xtec.cat',
      adreca: 'Passeig de Lluís Companys, 18',
      tel: '932 68 02 11',
      coordEmail: 'coordinacion@pauclaris.cat',
      coordNom: 'Coord. Pau Claris',
    },
  ];

  const centres = [];
  for (const c of centresData) {
    const centre = await prisma.center.upsert({
      where: { centerCode: c.codi },
      update: { name: c.nom },
      create: {
        centerCode: c.codi,
        name: c.nom,
        email: c.email,
        address: c.adreca,
        phone: c.tel,
      },
    });
    centres.push(centre);

    await prisma.user.upsert({
      where: { email: c.coordEmail },
      update: { passwordHash: passDefault },
      create: {
        fullName: c.coordNom,
        email: c.coordEmail,
        passwordHash: passDefault,
        id_role: roles.COORDINATOR.id_role,
        id_center: centre.id_center,
      },
    });
  }

  // 3. Professors
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
        id_role: roles.TEACHER.id_role,
        id_center: centres[0].id_center,
      },
    });
    await prisma.teacher.upsert({
      where: { id_user: user.id_user },
      update: {},
      create: { name: name, contact: email, id_center: centres[0].id_center, id_user: user.id_user },
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
        id_role: roles.TEACHER.id_role,
        id_center: centres[1].id_center,
      },
    });
    await prisma.teacher.upsert({
      where: { id_user: user.id_user },
      update: {},
      create: { name: name, contact: email, id_center: centres[1].id_center, id_user: user.id_user },
    });
  }

  return centres;
}

async function seedTallers(sectors: any) {
  console.log('📚  Generant catàleg de tallers...');
  const tallers = [
    { titol: 'Robòtica i IoT', sectorId: sectors.tecnologic.id_sector, modality: Modalitat.A, icona: 'ROBOT' },
    { titol: 'Cinema Digital', sectorId: sectors.creatiu.id_sector, modality: Modalitat.B, icona: 'FILM' },
    { titol: 'Impressió 3D', sectorId: sectors.industrial.id_sector, modality: Modalitat.A, icona: 'TOOLS' },
    { titol: 'Desenvolupament Web', sectorId: sectors.tecnologic.id_sector, modality: Modalitat.C, icona: 'CODE' },
  ];

  for (const t of tallers) {
    await prisma.workshop.create({ // For simplicity and sample data, we use create or we could check existence by title
      data: {
        title: t.titol,
        modality: t.modality,
        id_sector: t.sectorId,
        durationHours: 3,
        maxPlaces: 20,
        icon: t.icona,
        description: `Exploració pràctica de ${t.titol}.`,
      },
    });
  }
}

async function seedFases() {
  console.log('🗓️   Configurant fases del programa...');
  const now = new Date();
  const currentYear = now.getFullYear();

  const fasesData = [
    { nom: PHASES.APPLICATION, ordre: 1, activa: true },
    { nom: PHASES.PLANNING, ordre: 2, activa: false },
    { nom: PHASES.EXECUTION, ordre: 3, activa: false },
    { nom: PHASES.CLOSURE, ordre: 4, activa: false },
  ];

  for (const fase of fasesData) {
    await prisma.phase.upsert({
      where: { name: fase.nom },
      update: { order: fase.ordre, isActive: fase.activa },
      create: {
        name: fase.nom,
        order: fase.ordre,
        isActive: fase.activa,
        startDate: new Date(`${currentYear}-09-01`),
        endDate: new Date(`${currentYear + 1}-06-30`),
      },
    });
  }
}

async function main() {
  console.log('🌱  Iniciant procés de seeding...');
  
  // En desenvolupament, de vegades volem netejar, però el seeding professional prefereix upsert.
  // Si realment volem netejar: await prisma.$executeRaw`TRUNCATE TABLE ...`
  
  const infra = await seedInfrastructure();
  
  const salt = await bcrypt.genSalt(10);
  const passDefault = await bcrypt.hash('Iter@1234', salt);
  
  await seedUsers(infra.roles, passDefault);
  await seedTallers(infra.sectors);
  await seedFases();

  console.log('✅  Seeding completat amb èxit.');
}

main()
  .catch((e) => {
    console.error('❌  Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
