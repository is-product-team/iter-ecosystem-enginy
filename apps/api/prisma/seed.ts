import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PHASES, ROLES } from '@iter/shared';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Netejant base de dades dinàmicament...');
  
  // Obtener todas las tablas del esquema público
  const tables: { tablename: string }[] = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;

  for (const { tablename } of tables) {
    if (tablename === '_prisma_migrations') continue;
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE`);
    } catch (e) {
      console.warn(`⚠️ No s'ha pogut truncar la taula ${tablename}:`, e);
    }
  }
}

async function seedInfrastructure() {
  console.log('🏗️ Generant rols i sectors...');
  const rolesMap = {
    ADMIN: await prisma.role.create({ data: { nom_role: ROLES.ADMIN } }),
    COORDINADOR: await prisma.role.create({ data: { nom_role: ROLES.COORDINADOR } }),
    PROFESSOR: await prisma.role.create({ data: { nom_role: ROLES.PROFESOR } }),
  };

  const sectorTecno = await prisma.sector.create({ data: { nom: 'Transformació Digital' } });
  const sectorCreacio = await prisma.sector.create({ data: { nom: 'Creació Artística' } });
  const sectorIndus = await prisma.sector.create({ data: { nom: 'Industrial i Logística' } });

  return { 
    roles: rolesMap, 
    sectors: { sectorTecno, sectorCreacio, sectorIndus } 
  };
}

async function seedUsers(roles: any, passDefault: string) {
  console.log('👥 Generant usuaris i centres...');
  
  // 1. Admin Global
  await prisma.user.create({
    data: {
      nom_complet: 'Administrador Global',
      email: 'admin@admin.com',
      password_hash: passDefault,
      id_role: roles.ADMIN.id_role
    }
  });

  // 2. Centro Joan Brossa
  const centroBrossa = await prisma.center.create({
    data: { 
      codi_center: '08014231', 
      nom: 'Institut Joan Brossa', 
      email_contacte: 'a8014231@xtec.cat',
      adreca: 'Carrer de la Mare de Déu del Port, 397',
      telefon_contacte: '934 32 30 54'
    }
  });
  await prisma.user.create({
    data: {
      nom_complet: 'Coord. Joan Brossa',
      email: 'coordinacion@brossa.cat',
      password_hash: passDefault,
      id_role: roles.COORDINADOR.id_role,
      id_center: centroBrossa.id_center
    }
  });

  // 3. Centro Pau Claris
  const centroPauClaris = await prisma.center.create({
    data: { 
      codi_center: '08013147', 
      nom: 'Institut Pau Claris', 
      email_contacte: 'a8013147@xtec.cat',
      adreca: 'Passeig de Lluís Companys, 18',
      telefon_contacte: '932 68 02 11'
    }
  });
  await prisma.user.create({
    data: {
      nom_complet: 'Coord. Pau Claris',
      email: 'coordinacion@pauclaris.cat',
      password_hash: passDefault,
      id_role: roles.COORDINADOR.id_role,
      id_center: centroPauClaris.id_center
    }
  });

  const profesBrossa = [];
  const profesClaris = [];

  const brossaProfsNames = ['Laura Martínez', 'Jordi Soler', 'Marta Vila', 'Pere Gomis'];
  const clarisProfsNames = ['Anna Ferrer', 'Marc Dalmau', 'Laia Puig', 'Sergi Vidal'];

  for (let i = 0; i < 4; i++) {
    const name = brossaProfsNames[i];
    const email = `${name.toLowerCase().replace(' ', '.').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@brossa.cat`;
    const userB = await prisma.user.create({
      data: {
        nom_complet: name,
        email: email,
        password_hash: passDefault,
        id_role: roles.PROFESSOR.id_role,
        id_center: centroBrossa.id_center
      }
    });
    const pb = await prisma.teacher.create({
      data: { nom: name, contacte: email, id_center: centroBrossa.id_center, id_user: userB.id_user }
    });
    profesBrossa.push(pb);

    const nameClaris = clarisProfsNames[i];
    const emailC = `${nameClaris.toLowerCase().replace(' ', '.').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@pauclaris.cat`;
    const userP = await prisma.user.create({
      data: {
        nom_complet: nameClaris,
        email: emailC,
        password_hash: passDefault,
        id_role: roles.PROFESSOR.id_role,
        id_center: centroPauClaris.id_center
      }
    });
    const pc = await prisma.teacher.create({
      data: { nom: nameClaris, contacte: emailC, id_center: centroPauClaris.id_center, id_user: userP.id_user }
    });
    profesClaris.push(pc);
  }

  const brossaStudents = [
    { n: 'Pol', c: 'Garcia' }, { n: 'Nuria', c: 'Roca' }, { n: 'Arnau', c: 'Font' }, 
    { n: 'Julia', c: 'Serra' }, { n: 'Oriol', c: 'Mas' }, { n: 'Clara', c: 'Pons' }, 
    { n: 'Nil', c: 'Bosch' }, { n: 'Emma', c: 'Sala' }, { n: 'Aleix', c: 'Camps' }, 
    { n: 'Ona', c: 'Valls' }
  ];

  const clarisStudents = [
    { n: 'Paula', c: 'Martí' }, { n: 'Eric', c: 'Torres' }, { n: 'Marina', c: 'Gil' }, 
    { n: 'Jan', c: 'Costa' }, { n: 'Aina', c: 'Ramos' }, { n: 'Biel', c: 'Rovira' }, 
    { n: 'Carla', c: 'Mola' }, { n: 'David', c: 'Romeu' }, { n: 'Sara', c: 'Canals' }, 
    { n: 'Roger', c: 'Sants' }
  ];

  for (let i = 0; i < 10; i++) {
    await prisma.student.create({
      data: { 
        nom: brossaStudents[i].n, 
        cognoms: brossaStudents[i].c, 
        idalu: `B${100+i}`, 
        curs: '4t ESO', 
        id_center_origin: centroBrossa.id_center 
      }
    });
    await prisma.student.create({
      data: { 
        nom: clarisStudents[i].n, 
        cognoms: clarisStudents[i].c, 
        idalu: `P${100+i}`, 
        curs: '3r ESO', 
        id_center_origin: centroPauClaris.id_center 
      }
    });
  }

  return { centroBrossa, centroPauClaris, profesBrossa, profesClaris };
}

async function seedTallers(sectors: any) {
  console.log('📚 Generant catàleg de tallers...');
  const tallers = [
    { 
      titol: 'Robòtica i IoT', 
      sector: sectors.sectorTecno.id_sector, 
      modalitat: 'A', 
      cap: 10, 
      icona: 'ROBOT',
      schedule: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "11:00" }, 
        { dayOfWeek: 3, startTime: "09:00", endTime: "11:00" }  
      ]
    },
    { 
      titol: 'Cinema Digital', 
      sector: sectors.sectorCreacio.id_sector, 
      modalitat: 'B', 
      cap: 8, 
      icona: 'FILM',
      schedule: [
        { dayOfWeek: 2, startTime: "15:00", endTime: "18:00" },
        { dayOfWeek: 4, startTime: "15:00", endTime: "18:00" } 
      ]
    },
    { 
      titol: 'Impressió 3D', 
      sector: sectors.sectorIndus.id_sector, 
      modalitat: 'A', 
      cap: 7, 
      icona: 'TOOLS',
      schedule: [
        { dayOfWeek: 5, startTime: "08:00", endTime: "12:00" } 
      ]
    },
    { 
      titol: 'Desenvolupament Web', 
      sector: sectors.sectorTecno.id_sector, 
      modalitat: 'C', 
      cap: 6, 
      icona: 'CODE',
      schedule: [
         { dayOfWeek: 1, startTime: "10:00", endTime: "13:00" },
         { dayOfWeek: 2, startTime: "10:00", endTime: "13:00" }
      ]
    },
    { 
      titol: 'Disseny Gràfic', 
      sector: sectors.sectorCreacio.id_sector, 
      modalitat: 'B', 
      cap: 4, 
      icona: 'PAINT',
      schedule: [
        { dayOfWeek: 3, startTime: "16:00", endTime: "19:00" }
      ]
    },
    { 
      titol: 'Realitat Virtual', 
      sector: sectors.sectorTecno.id_sector, 
      modalitat: 'A', 
      cap: 8, 
      icona: 'GEAR',
      schedule: [
        { dayOfWeek: 4, startTime: "09:00", endTime: "11:00" },
        { dayOfWeek: 5, startTime: "09:00", endTime: "11:00" }
      ]
    }, 
    { 
      titol: 'Energies Renovables', 
      sector: sectors.sectorIndus.id_sector, 
      modalitat: 'B', 
      cap: 10, 
      icona: 'LEAF',
      schedule: [
        { dayOfWeek: 1, startTime: "12:00", endTime: "14:00" },
        { dayOfWeek: 3, startTime: "12:00", endTime: "14:00" }
      ]
    }
  ];

  const creadosTallers = [];
  for (const t of tallers) {
    const nuevo = await prisma.workshop.create({
      data: {
        titol: t.titol,
        modalitat: t.modalitat as any,
        id_sector: t.sector,
        durada_h: 3,
        places_maximes: t.cap,
        icona: t.icona,
        descripcio: `Exploració pràctica de ${t.titol}.`,
        dies_execucio: t.schedule
      }
    });
    creadosTallers.push(nuevo);
  }
  return creadosTallers;
}


async function seedFases() {
  console.log('🗓️ Creant fases del programa...');
  const now = new Date();
  const currentYear = now.getFullYear();
  const prevYear = currentYear - 1;

  const fasesData = [
    {
      nom: PHASES.SOLICITUD,
      descripcio: 'Fase inicial on els centres sol·liciten tallers i indiquen nombre d\'alumnes.',
      data_inici: new Date(`${prevYear}-09-01`),
      data_fi: new Date(`${currentYear}-02-15`),
      activa: true,
      ordre: 1
    },
    {
      nom: PHASES.PLANIFICACION,
      descripcio: 'Planificació i assignació de tallers.',
      data_inici: new Date(`${currentYear}-02-16`),
      data_fi: new Date(`${currentYear}-03-15`),
      activa: false,
      ordre: 2
    },
    {
      nom: PHASES.EJECUCION,
      descripcio: 'Execució dels tallers als centres.',
      data_inici: new Date(`${currentYear}-03-16`),
      data_fi: new Date(`${currentYear}-06-15`),
      activa: false,
      ordre: 3
    },
    {
      nom: PHASES.CIERRE,
      descripcio: 'Tancament i avaluació.',
      data_inici: new Date(`${currentYear}-06-16`),
      data_fi: new Date(`${currentYear}-07-31`),
      activa: false,
      ordre: 4
    }
  ];

  for (const fase of fasesData) {
    await prisma.phase.create({ data: fase });
  }
}

async function seedCompetencies() {
  console.log('🧠 Generant competències...');
  const tecniques = [
    "Capacitat de resoldre situacions independentment",
    "Reconeixement d'eines",
    "Responsabilitat en l'execució"
  ];
  const transversals = [
    "Autoconfiança",
    "Treball en equip",
    "Disposició a l'aprenentatge",
    "Actitud responsable",
    "Iniciativa",
    "Comunicació amb el responsable"
  ];

  for (const c of tecniques) {
    await prisma.competence.create({ data: { nom: c, tipus: 'Tecnica' } });
  }
  for (const c of transversals) {
    await prisma.competence.create({ data: { nom: c, tipus: 'Transversal' } });
  }
}

async function seedQuestionnaires() {
  console.log('📝 Generant qüestionaris...');
  
  // Qüestionari de Qualitat del Taller (Professor)
  await prisma.questionnaireModel.create({
    data: {
      titol: "Qüestionari de Qualitat del Taller",
      target: "TEACHER",
      questions: {
        create: [
          { enunciat: "Satisfacció general amb el taller", response_type: "Likert_1_5" },
          { enunciat: "Valoració de l'organització i resources", response_type: "Likert_1_5" },
          { enunciat: "Observacions i suggeriments", response_type: "Oberta" }
        ]
      }
    }
  });
}
async function main() {
  console.log('🌱 Iniciant Seed final per al programa Iter...');
  
  await cleanDatabase();
  
  const infra = await seedInfrastructure();
  
  const salt = await bcrypt.genSalt(10);
  const passDefault = await bcrypt.hash('Iter@1234', salt);
  
  await seedUsers(infra.roles, passDefault);
  await seedTallers(infra.sectors);
  
  await seedFases();
  await seedCompetencies();
  await seedQuestionnaires();

  console.log('✅ Seed finalitzat amb èxit (Amb dades de prova i sessions).');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
