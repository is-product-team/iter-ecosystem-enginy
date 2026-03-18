# 🛠️ Stack Tecnològic - Iter Ecosystem

Aquest document detalla totes les tecnologies, llibreries i eines utilitzades en el projecte, juntament amb les seves versions i la justificació del seu ús.

## 🏗️ Arquitectura General "Monorepo"

El projecte s'organitza en un **Monorepo** gestionat per **Turborepo**, permetent compartir codi i tipus entre el frontend, backend i aplicació mòbil.

*   **Gestor de Paquets**: `npm` (amb Workspaces).
*   **Orquestrador**: `Turborepo` (Optimitza la construcció i execució de scripts en paral·lel).
*   **Llenguatge Base**: **TypeScript** (v5.x) en tot l'ecosistema per garantir integritat de tipus end-to-end.

---

## 💻 Frontend Web (`apps/web`)

Aplicació web unificada que serveix tant al client públic com al panell d'administració.

| Tecnologia | Versió | Ús / Justificació |
| :--- | :--- | :--- |
| **Next.js** | **16.1.1** | Framework React de producció. Utilitzem **App Router** i Server Actions. |
| **React** | **19.2.3** | Llibreria UI. Ús de nous hooks i optimitzacions de React 19. |
| **Tailwind CSS** | 3.4.17 | Framework CSS utilitari per a diseny ràpid i responsive. |
| **Lucide React** | 0.562.0 | Llibreria d'icones vectorials lleugeres i consistents. |
| **Sonner** | 2.0.7 | Sistema de notificacions "Toasts" modern i accessible. |
| **Axios** | 1.13.2 | Client HTTP per a peticions a l'API. |
| **Next-Themes** | 0.4.6 | Gestió del mode fosc/clar automàtic. |

---

## 📱 Aplicació Mòbil (`apps/mobile`)

Aplicació nativa per a Android i iOS, enfocada a professors.

| Tecnologia | Versió | Ús / Justificació |
| :--- | :--- | :--- |
| **Expo** | **54.0.29** | Plataforma per desenvolupar React Native sense gestionar codi natiu complex. |
| **React Native** | **0.81.5** | Framework per construir apps natives amb React. |
| **NativeWind** | 4.2.1 | Utilitat per usar classes de Tailwind CSS dins de React Native. |
| **Expo Router** | 6.0.19 | Enrutament basat en fitxers (file-based routing) similar a Next.js. |
| **Expo Glass Effect** | 0.1.8 | Efectes visuals de desenfocament (blur) d'alta qualitat. |
| **Expo Haptics** | 15.0.8 | Feedback tàctil per millorar l'experiència d'usuari. |

---

## 🔌 Backend API (`apps/api`)

Servidor RESTful robust i escalable.

| Tecnologia | Versió | Ús / Justificació |
| :--- | :--- | :--- |
| **Node.js** | **22.x** | Entorn d'execució JavaScript d'alt rendiment. |
| **Express** | 4.21.2 | Framework lleuger per a servidors HTTP. |
| **Prisma ORM** | **5.22.0** | ORM modern per gestionar PostgreSQL amb seguretat de tipus. |
| **tsx** | 4.19.2 | Execució directa de TypeScript (substitut ràpid de `ts-node`). |
| **Zod** | 3.23.x | Validació d'esquemes i dades entrants (runtime validation). |
| **Winston** | 3.19.0 | Sistema de logging professional i estructurat. |
| **Multer** | 1.4.5 | Middleware per a la gestió de pujada de fitxers (multipart/form-data). |

### Persistència de Dades

L'arquitectura utilitza una base de dades relacional centralitzada:

*   **PostgreSQL 15**: Emmagatzema totes les dades del sistema (Usuaris, Peticions, Assignacions, Assistència, Logs d'Auditoria). Gestionada via **Prisma ORM**.

---

## ☁️ Infraestructura i DevOps

| Eina | Descripció |
| :--- | :--- |
| **Docker Compose** | Orquestració de contenidors locals (API, Web, DB, Adminer). |
| **PostgreSQL (Docker)** | Imatge `postgres:15-alpine` per a mínim consum de recursos. |
| **Adminer** | Interfície web lleugera per gestionar bases de dades SQL. |
| **Ngrok** | Túnel segur per exposar l'API local a Internet (necessari per testar l'App mòbil en dispositius físics). |
| **ESLint + Prettier** | Estàndards de codi i formatat automàtic compartit. |

---

## 🔐 Seguretat

*   **Autenticació**: Basada en **JWT** (JSON Web Tokens) amb rotació de claus.
*   **Encrptació**: Contrasunyes *hashejades* amb **Bcrypt** (cost factor adaptat).
*   **Validació**: Totes les entrades es validen amb **Zod** per prevenir injeccions i dades corruptes.
