import { PrismaClient, Modality, QuestionnaireTarget, ResponseType } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PHASES, ROLES } from '@iter/shared';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// --- ROBUST ENV LOADING ---
const rootEnvPath = path.resolve(process.cwd(), '../../.env');
const localEnvPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config({ path: localEnvPath });
}

// Manual variable expansion for DATABASE_URL (e.g., ${POSTGRES_USER})
if (process.env.DATABASE_URL) {
  let url = process.env.DATABASE_URL;
  // Replace ${VAR} with process.env.VAR
  url = url.replace(/\${(\w+)}/g, (_, v) => process.env[v] || '');
  
  // Local host detection: if "@db" is in URL and we are NOT in a container, use localhost
  // Note: Simple check, if we can't find /proc/1/cgroup and it has @db, it's likely host
  const isDocker = fs.existsSync('/.dockerenv');
  if (!isDocker && url.includes('@db')) {
    console.log('🔄  Detectado entorno local (Host), cambiando "db" por "localhost" en DATABASE_URL...');
    url = url.replace('@db', '@localhost');
  }
  
  process.env.DATABASE_URL = url;
}
// --------------------------

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
    await prisma.workshop.upsert({ 
      where: {
        title_modality: {
          title: w.title,
          modality: w.modality
        }
      },
      update: {},
      create: {
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
        // Set APPLICATION active starting today until 1 month from now
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        isActive = true; // Set APPLICATION as the active phase
        break;
      case PHASES.PLANNING:
        startDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);
        isActive = false;
        break;
      case PHASES.EXECUTION:
        startDate = new Date(now.getFullYear(), now.getMonth() + 2, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 5, 0);
        isActive = false;
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

async function seedQuestionnaires() {
  console.log('📝  Configurando modelos de cuestionarios...');
  const teacherModel = await prisma.questionnaireModel.upsert({
    where: { 
      modelId: 1 // We can force id 1 for the first model if we want, or use name/target as unique but it is not unique in schema
    },
    update: {},
    create: {
      modelId: 1,
      name: 'Workshop Evaluation (Teacher)',
      target: QuestionnaireTarget.TEACHER,
      questions: {
        create: [
          { text: 'Comportamiento alumnos', type: ResponseType.RATING },
          { text: 'Calidad material', type: ResponseType.RATING },
          { text: 'Grau d\'atencio alumnat al taller', type: ResponseType.RATING },
          { text: 'Assoliment objectius', type: ResponseType.RATING },
          { text: 'Recomanació general', type: ResponseType.RATING },
          { text: 'Comentaris i observacions', type: ResponseType.TEXT }
        ]
      }
    }
  });
  console.log(`✅ Modelo de evaluación para profesores creado (ID: ${teacherModel.modelId})`);
}

async function main() {
  console.log('🌱  Iniciando proceso de seeding...');

  const infra = await seedInfrastructure();

  const salt = await bcrypt.genSalt(10);
  const passDefault = await bcrypt.hash('Iter@1234', salt);

  await seedUsers(infra.roles, passDefault);
  await seedWorkshops(infra.sectors);
  await seedPhases();
  await seedQuestionnaires();

  // Operative data for testing (CLEAN START)
  console.log('🧪  Preparando datos de prueba (Alumnos)...');
  
  const centers = await prisma.center.findMany();

  if (centers.length >= 2) {
    // 1. Create 20 students per center in the "pool"
    const firstNames = ['Marc', 'Júlia', 'Pau', 'Laia', 'Pol', 'Emma', 'Arnau', 'Clara', 'Biel', 'Ona', 'Oriol', 'Abril', 'Nil', 'Martina', 'Jan', 'Aina', 'Hugo', 'Lucía', 'Leo', 'Noa'];
    const lastNames = ['Pérez', 'Soler', 'García', 'Martínez', 'López', 'Sánchez', 'Rodríguez', 'Fernández', 'Vila', 'Serra'];

    for (const [index, center] of centers.entries()) {
      console.log(`   - Generando pool de alumnos para ${center.name}...`);
      for (let i = 0; i < 20; i++) {
        const fName = firstNames[i % firstNames.length];
        const lName = lastNames[Math.floor(i / 2) % lastNames.length];
        const studentId = `${1000 + (index * 20) + i}`;
        
        await prisma.student.upsert({
          where: { idalu: studentId },
          update: {},
          create: {
            idalu: studentId,
            fullName: fName,
            lastName: lName,
            email: `${fName.toLowerCase()}${i}@${center.centerCode}.edu`,
            originCenterId: center.centerId,
          }
        });
      }
    }
  }

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
