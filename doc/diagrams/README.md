# Diagrames del Sistema ITER ECOSYSTEM


## 🏗️ Arquitectura General del Sistema

```mermaid
graph TB
    subgraph "Frontend Layer"
        WEB["WebApp<br/>Next.js 16<br/>Port: 8002"]
        MOBILE["Mobile App<br/>Expo<br/>React Native"]
    end
    
    subgraph "Backend Layer"
        API["API Gateway<br/>Node.js + Express<br/>Port: 3000"]
    end
    
    subgraph "Database Layer"
        POSTGRES["PostgreSQL 15<br/>Prisma ORM<br/>Port: 5432"]
    end
    
    subgraph "Infrastructure"
        DOCKER["Docker Compose"]
        ADMINER["Adminer<br/>Port: 8080"]
        NGROK["Ngrok Tunnel<br/>Port: 4040"]
    end
    
    WEB -->|"HTTP/REST"| API
    MOBILE -->|"HTTP/REST"| API
    API -->|"Prisma Client"| POSTGRES
    DOCKER -->|"Orchestrates"| WEB
    DOCKER -->|"Orchestrates"| API
    DOCKER -->|"Orchestrates"| POSTGRES
    ADMINER -->|"Manages"| POSTGRES
    NGROK -->|"Exposes"| API
```

## 🐳 Flux de Docker Compose

```mermaid
graph TB
    START["docker compose up"]
    
    START --> DB["db service<br/>postgres:15-alpine<br/>Port: 5432"]
    
    DB -->|"depends_on"| SETUP["setup service<br/>base stage<br/>npm install<br/>db:generate<br/>db push<br/>db:seed"]
    
    SETUP -->|"condition:<br/>service_completed_successfully"| API["api service<br/>turbo dev --filter=api<br/>Port: 3000"]
    
    SETUP -->|"condition:<br/>service_completed_successfully"| WEB["web service<br/>turbo dev --filter=web<br/>Port: 8002"]
    
    API --> NGROK["ngrok service<br/>Port: 4040"]
    
    DB -.->|"Accessible via"| ADMINER["adminer service<br/>Port: 8080"]
    
    style SETUP fill:#e1f5ff
```

## 🗄️ Esquema de Base de Dades Principal

```mermaid
erDiagram
    SECTOR ||--o{ TALLER : contains
    CENTRE ||--o{ USUARI : has
    CENTRE ||--o{ PETICIO : makes
    CENTRE ||--o{ ALUMNE : enrolls
    TALLER ||--o{ PETICIO : receives
    TALLER ||--o{ ASSIGNACIO : assigned_to
    PETICIO ||--o{ ASSIGNACIO : generates
    PETICIO ||--o{ ALUMNE : includes
    ASSIGNACIO ||--o{ INSCRIPCIO : enrolls
    ASSIGNACIO ||--o{ SESSIO : schedules
    USUARI ||--o{ PROFESSOR : becomes
    PROFESSOR ||--o{ PETICIO : requests
    PROFESSOR ||--o{ ASSIGNACIO : teaches
    
    SECTOR {
        int id_sector PK
        string nom
        string descripcio
    }
    
    TALLER {
        int id_taller PK
        string titol
        int durada_h
        int places_maximes
        string modalitat
        int id_sector FK
    }
    
    CENTRE {
        int id_centre PK
        string codi_centre
        string nom
        string adreca
    }
    
    USUARI {
        int id_usuari PK
        string nom_complet
        string email
        string password_hash
        int id_rol FK
        int id_centre FK
    }
    
    PETICIO {
        int id_peticio PK
        int id_centre FK
        int id_taller FK
        string estat
        string modalitat
    }
    
    ASSIGNACIO {
        int id_assignacio PK
        int id_peticio FK
        int id_centre FK
        int id_taller FK
        int grup
        string estat
    }
```

## 🤖 Flux de Funcionalitats d'IA

```mermaid
graph TB
    subgraph "Idea 1: Motor d'Assignació"
        ALGO["AssignmentSolver<br/>IA Simbòlica<br/>Constraint Satisfaction"]
        AUTO["Auto-Assignment Service<br/>Orquestració"]
        ALGO -->|"Resultats"| AUTO
    end
    
    subgraph "Idea 2: Assistent de Veu"
        NLP["NLP Service<br/>Anàlisi de text<br/>Paraules clau"]
        EVAL["Evaluation Controller<br/>Processament de veu"]
        NLP -->|"Suggeriments"| EVAL
    end
    
    subgraph "Idea 3: Detecció de Risc"
        RISK["Risk Analysis Service<br/>Sistema Expert<br/>Basat en regles"]
        STATS["Stats Controller<br/>Anàlisi predictiva"]
        RISK -->|"Alertes"| STATS
    end
    
    subgraph "Idea 4: Validació Documental"
        VISION["Vision Service<br/>Computer Vision<br/>Verificació"]
        ASSIGN["Assignacio Controller<br/>Validació de docs"]
        VISION -->|"Resultats"| ASSIGN
    end
    
    API -->|"POST /api/assignacions/auto-generate"| ALGO
    API -->|"POST /api/evaluation/voice-process"| NLP
    API -->|"POST /api/stats/risk-analysis"| RISK
    API -->|"POST /api/assignacions/validate-doc"| VISION
```

## 🔄 Flux de Dades Complet

```mermaid
sequenceDiagram
    participant U as Usuari
    participant W as Web App
    participant A as API
    participant P as PostgreSQL
    
    U->>W: Login/Interacció
    W->>A: HTTP Request (/api/*)
    A->>P: Prisma Query
    P-->>A: Dades estructurades
    A-->>W: JSON Response
    W-->>U: UI Update
    
    Note over A,P: Per a funcionalitats IA:
    A->>A: Processament IA
    A->>P: Guardar resultats
```

## 📱 Arquitectura Mobile

```mermaid
graph LR
    MOBILE["Expo App<br/>React Native"]
    
    subgraph "Development"
        LOCAL["Local API<br/>localhost:3000"]
        NGROK_DEV["Ngrok Tunnel<br/>Development"]
    end
    
    subgraph "Production"
        PROD_API["Production API<br/>api-iter.kore29.com"]
    end
    
    MOBILE -->|"Dev Mode"| NGROK_DEV
    NGROK_DEV -->|"Forwards"| LOCAL
    MOBILE -->|"Prod Mode"| PROD_API
    
    style NGROK_DEV fill:#fff5e1
```

## 🔧 Configuració d'Entorn

```mermaid
graph TB
    ROOT[".env (Root)"]
    API_ENV["apps/api/.env"]
    WEB_ENV["apps/web/.env"]
    MOBILE_ENV["apps/mobile/.env"]
    
    ROOT -->|"Inherited by"| API_ENV
    ROOT -->|"Inherited by"| WEB_ENV
    ROOT -->|"Inherited by"| MOBILE_ENV
    
    API_ENV -->|"DATABASE_URL<br/>JWT_SECRET"| API_RUNTIME["API Runtime"]
    WEB_ENV -->|"NEXT_PUBLIC_API_URL"| WEB_RUNTIME["Web Runtime"]
    MOBILE_ENV -->|"EXPO_PUBLIC_API_URL"| MOBILE_RUNTIME["Mobile Runtime"]
    
    API_RUNTIME -->|"Connects to"| PG["PostgreSQL"]
```

---

## Notes

- **Arquitectura Monorepo**: El projecte utilitza Turborepo per gestionar múltiples aplicacions en un sol repositori.
- **Base de Dades**: PostgreSQL per a dades estructurades amb Prisma ORM.
- **Orquestració Docker**: Flux seqüencial amb servei setup dedicat per evitar conflictes.
- **Funcionalitats IA**: Quatre mòduls integrats amb diferents enfocaments (simbòlic, NLP, expert system, computer vision).
- **Esquema de Dades**: Model relacional complex amb entitats principals com Centre, Usuari, Taller, Peticio, Assignacio.
