# Migration Guide: Vanilla JS/Express to Next.js React TypeScript

## Overzicht
Dit document beschrijft de migratie van het Laura Boekhoudsysteem van een vanilla JavaScript/Express.js applicatie naar Next.js met React en TypeScript.

## Project Structuur

```
laura-boekhoudsysteem/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (vervangt Express routes)
│   │   ├── login/
│   │   ├── verify-token/
│   │   ├── klanten/
│   │   ├── afspraken/
│   │   ├── uitgaven/
│   │   ├── mutualiteiten/
│   │   ├── consulttypes/
│   │   ├── categorieen/
│   │   ├── dashboard/
│   │   └── terugbetaling-signalen/
│   ├── login/                    # Login pagina
│   ├── dashboard/                # Dashboard pagina
│   ├── klanten/                  # Klanten pagina
│   ├── afspraken/                # Afspraken pagina
│   ├── uitgaven/                 # Uitgaven pagina
│   ├── terugbetaling/            # Terugbetaling pagina
│   ├── instellingen/             # Instellingen pagina
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page (redirect naar dashboard)
├── components/                    # React components
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── KPICard.tsx
│   ├── DataTable.tsx
│   ├── Modal.tsx
│   └── ...
├── lib/                          # Utility functions
│   ├── supabase.ts               # Supabase client
│   ├── auth.ts                   # Authentication helpers
│   └── api.ts                    # API client functions
├── types/                        # TypeScript type definitions
│   └── index.ts
├── styles/                       # CSS files
│   └── globals.css
├── public/                       # Static assets
└── package.json

```

## Belangrijkste Wijzigingen

### 1. API Routes
- **Oud**: Express.js routes in `server.js`
- **Nieuw**: Next.js API routes in `app/api/*/route.ts`
- Elke route is nu een apart bestand met `GET`, `POST`, `PUT`, `DELETE` exports

### 2. Frontend
- **Oud**: Vanilla JavaScript class in `app.js` met DOM manipulatie
- **Nieuw**: React components met hooks (useState, useEffect, etc.)
- **Oud**: HTML bestanden (`index-production.html`, `login.html`)
- **Nieuw**: React Server/Client Components in `app/*/page.tsx`

### 3. State Management
- **Oud**: Class properties (`this.data`, `this.currentPage`)
- **Nieuw**: React hooks (`useState`, `useContext` voor global state)

### 4. Routing
- **Oud**: Client-side routing met `showPage()` functie
- **Nieuw**: Next.js App Router met file-based routing

### 5. Authentication
- **Oud**: localStorage token check in `app.js`
- **Nieuw**: Next.js middleware + React context voor auth state

## Migratie Stappen

### Stap 1: Installatie
```bash
npm install
```

### Stap 2: Environment Variables
Zorg dat `.env.local` bestaat met:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SECRET_TOKEN=your_secret_token
```

### Stap 3: Development Server
```bash
npm run dev
```

### Stap 4: Build voor Productie
```bash
npm run build
npm start
```

## Nog Te Migreren

### API Routes (Prioriteit)
- [x] `/api/login`
- [x] `/api/verify-token`
- [x] `/api/klanten` (GET, POST)
- [x] `/api/klanten/[id]` (PUT, DELETE)
- [ ] `/api/afspraken` (GET, POST, PUT, DELETE)
- [ ] `/api/afspraken/[id]/pdf` (GET)
- [ ] `/api/uitgaven` (GET, POST, PUT, DELETE)
- [ ] `/api/mutualiteiten` (GET, POST, PUT, DELETE)
- [ ] `/api/consulttypes` (GET, POST, PUT, DELETE)
- [ ] `/api/categorieen` (GET, POST, PUT, DELETE)
- [ ] `/api/dashboard` (GET)
- [ ] `/api/maandoverzicht` (GET)
- [ ] `/api/terugbetaling-signalen` (GET)

### React Components (Prioriteit)
- [ ] Layout component (Sidebar + Header)
- [ ] Login page
- [ ] Dashboard page
- [ ] Klanten page
- [ ] Afspraken page
- [ ] Uitgaven page
- [ ] Terugbetaling page
- [ ] Instellingen page
- [ ] Modal components
- [ ] Table components
- [ ] Form components

## Belangrijke Notities

1. **File Uploads**: Multer werkt anders in Next.js. Gebruik `formData()` in API routes.
2. **Static Files**: Plaats statische bestanden in `public/` directory.
3. **Environment Variables**: Gebruik `.env.local` voor lokale development.
4. **TypeScript**: Alle nieuwe code moet TypeScript zijn met proper types.
5. **CSS**: Bestaande `styles.css` kan worden gebruikt als `globals.css` of geconverteerd naar CSS modules.

## Testing Checklist

- [ ] Login functionaliteit
- [ ] Token verificatie
- [ ] CRUD operaties voor alle entiteiten
- [ ] PDF upload/download
- [ ] Dashboard data loading
- [ ] Charts/visualisaties
- [ ] Excel export
- [ ] Responsive design
- [ ] Error handling

## Deployment

### Vercel
De `vercel.json` configuratie moet worden aangepast voor Next.js:
- Next.js heeft geen `builds` configuratie nodig
- Routes worden automatisch geconfigureerd
- API routes werken automatisch

### Environment Variables
Zorg dat alle environment variables zijn ingesteld in Vercel dashboard.
