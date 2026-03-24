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
        where: { nom_role: roleName },
        update: {},
        create: { nom_role: roleName },
      })
    )
  );

  const rolesMap = {
    ADMIN: roles.find((r) => r.nom_role === ROLES.ADMIN)!,
    COORDINADOR: roles.find((r) => r.nom_role === ROLES.COORDINADOR)!,
    PROFESSOR: roles.find((r) => r.nom_role === ROLES.PROFESSOR)!,
  };

  const sectors = ['Transformació Digital', 'Creació Artística', 'Industrial i Logística'];
  const createdSectors = await Promise.all(
    sectors.map((name) =>
      prisma.sector.upsert({
        where: { nom: name },
        update: {},
        create: { nom: name },
      })
    )
  );

  return {
    roles: rolesMap,
    sectors: {
      tecnologic: createdSectors.find((s) => s.nom === 'Transformació Digital')!,
      creatiu: createdSectors.find((s) => s.nom === 'Creació Artística')!,
      industrial: createdSectors.find((s) => s.nom === 'Industrial i Logística')!,
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
      nom_complet: 'Administrador Global',
      email: 'admin@admin.com',
      password_hash: passDefault,
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
      where: { codi_center: c.codi },
      update: { nom: c.nom },
      create: {
        codi_center: c.codi,
        nom: c.nom,
        email_contacte: c.email,
        adreca: c.adreca,
        telefon_contacte: c.tel,
      },
    });
    centres.push(centre);

    await prisma.user.upsert({
      where: { email: c.coordEmail },
      update: {},
      create: {
        nom_complet: c.coordNom,
        email: c.coordEmail,
        password_hash: passDefault,
        id_role: roles.COORDINADOR.id_role,
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
        nom_complet: name,
        email,
        password_hash: passDefault,
        id_role: roles.PROFESSOR.id_role,
        id_center: centres[0].id_center,
      },
    });
    await prisma.teacher.upsert({
      where: { id_user: user.id_user },
      update: {},
      create: { nom: name, contacte: email, id_center: centres[0].id_center, id_user: user.id_user },
    });
  }

  for (const name of clarisProfs) {
    const email = `${name.toLowerCase().replace(' ', '.').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@pauclaris.cat`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        nom_complet: name,
        email,
        password_hash: passDefault,
        id_role: roles.PROFESSOR.id_role,
        id_center: centres[1].id_center,
      },
    });
    await prisma.teacher.upsert({
      where: { id_user: user.id_user },
      update: {},
      create: { nom: name, contacte: email, id_center: centres[1].id_center, id_user: user.id_user },
    });
  }

  return centres;
}

async function seedTallers(sectors: any) {
  console.log('📚  Generant catàleg de tallers...');
  const tallers = [
    { titol: 'Robòtica i IoT', sectorId: sectors.tecnologic.id_sector, modalitat: Modalitat.A, icona: 'ROBOT' },
    { titol: 'Cinema Digital', sectorId: sectors.creatiu.id_sector, modalitat: Modalitat.B, icona: 'FILM' },
    { titol: 'Impressió 3D', sectorId: sectors.industrial.id_sector, modalitat: Modalitat.A, icona: 'TOOLS' },
    { titol: 'Desenvolupament Web', sectorId: sectors.tecnologic.id_sector, modalitat: Modalitat.C, icona: 'CODE' },
  ];

  for (const t of tallers) {
    await prisma.workshop.create({ // For simplicity and sample data, we use create or we could check existence by title
      data: {
        titol: t.titol,
        modalitat: t.modalitat,
        id_sector: t.sectorId,
        durada_h: 3,
        places_maximes: 20,
        icona: t.icona,
        descripcio: `Exploració pràctica de ${t.titol}.`,
      },
    });
  }
}

async function seedFases() {
  console.log('🗓️   Configurant fases del programa...');
  const now = new Date();
  const currentYear = now.getFullYear();

  const fasesData = [
    { nom: PHASES.SOLICITUD, ordre: 1, activa: true },
    { nom: PHASES.PLANIFICACION, ordre: 2, activa: false },
    { nom: PHASES.EJECUCION, ordre: 3, activa: false },
    { nom: PHASES.CIERRE, ordre: 4, activa: false },
  ];

  for (const fase of fasesData) {
    await prisma.phase.upsert({
      where: { nom: fase.nom },
      update: { ordre: fase.ordre, activa: fase.activa },
      create: {
        nom: fase.nom,
        ordre: fase.ordre,
        activa: fase.activa,
        data_inici: new Date(`${currentYear}-09-01`),
        data_fi: new Date(`${currentYear + 1}-06-30`),
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
