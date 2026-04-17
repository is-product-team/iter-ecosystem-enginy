import { PrismaClient, QuestionnaireTarget, ResponseType } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// --- ROBUST ENV LOADING (Copied from seed.ts) ---
const rootEnvPath = path.resolve(process.cwd(), '.env');
const localEnvPath = path.resolve(process.cwd(), 'apps/api/.env');

if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
}

if (process.env.DATABASE_URL) {
  let url = process.env.DATABASE_URL;
  url = url.replace(/\${(\w+)}/g, (_, v) => process.env[v] || '');
  const isDocker = fs.existsSync('/.dockerenv');
  if (!isDocker && url.includes('@db')) {
    url = url.replace('@db', '@localhost');
  }
  process.env.DATABASE_URL = url;
}
// --------------------------

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Seeding Teacher Evaluation Model...');

    // Delete existing teacher evaluation models to avoid duplicates during development
    await prisma.questionnaireModel.deleteMany({
        where: {
            target: QuestionnaireTarget.TEACHER,
            name: 'Workshop Evaluation (Teacher)'
        }
    });

    const model = await prisma.questionnaireModel.create({
        data: {
            name: 'Workshop Evaluation (Teacher)',
            target: QuestionnaireTarget.TEACHER,
            questions: {
                create: [
                    {
                        text: 'Comportamiento alumnos',
                        type: ResponseType.RATING,
                    },
                    {
                        text: 'Calidad material',
                        type: ResponseType.RATING,
                    },
                    {
                        text: 'Grau d\'atencio alumnat al taller',
                        type: ResponseType.RATING,
                    },
                    {
                        text: 'Assoliment objectius',
                        type: ResponseType.RATING,
                    },
                    {
                        text: 'Recomanació general',
                        type: ResponseType.RATING,
                    },
                    {
                        text: 'Comentaris i observacions',
                        type: ResponseType.TEXT,
                    }
                ]
            }
        }
    });

    console.log('✅ Teacher Evaluation Model created:', model.modelId);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
