# LMA — League & Tournament Management Platform

A full-stack platform for managing sports/games leagues: players, clubs, leagues, tournaments, and a custom **ELO ranking system** to track player performance over time.

> Built as a personal project to practice backend architecture, relational database design, and full-stack development end to end.

## Features

- Player, club, league, and tournament management
- Custom ELO rating engine that recalculates rankings after each tournament
- Match/result tracking with full history per player
- Trophy and medal records
- Bulk import of tournament results from Excel spreadsheets
- Admin panel with authenticated login
- Public ranking and tournament pages for players/clubs

## Tech Stack

**Backend**
- Python, [FastAPI](https://fastapi.tiangolo.com/)
- SQLAlchemy (ORM) + PostgreSQL (psycopg2)
- JWT authentication (`python-jose`) with bcrypt password hashing
- `openpyxl` for importing tournament results from `.xlsx` files
- CORS configured for the frontend

**Frontend**
- React + TypeScript, built with Vite
- shadcn/ui (Radix UI) + Tailwind CSS
- Custom API client (`src/api/client.ts`)
- Deployed on Vercel (SPA routing via `vercel.json`)

## Project Structure

```
Pagina-LMA/
├── lma-backend/          # FastAPI application
│   ├── app/
│   │   ├── core/
│   │   │   └── elo.py    # ELO rating calculation logic
│   │   ├── models/       # Jugador, Club, Liga, Torneo, ResultadoTorneo,
│   │   │                 # HistorialELO, Trofeo, Medalla, Partida
│   │   └── ...
│   └── requirements.txt
└── lma-frontend/         # React + TypeScript app
    ├── src/
    │   ├── api/
    │   │   └── client.ts # API client, points to localhost:8000 in dev
    │   └── pages/         # Home, Players, Clubs, Leagues, Tournaments,
    │                       # Ranking, Admin (login)
    └── vercel.json
```

## Data Model

Core entities: `Jugador` (Player), `Club`, `Liga` (League), `Torneo` (Tournament), `ResultadoTorneo` (Tournament Result), `HistorialELO` (ELO History), `Trofeo` (Trophy), `Medalla` (Medal), `Partida` (Match).

## Getting Started

### Backend

```bash
cd lma-backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file with your database and JWT settings:

```
DATABASE_URL=postgresql://user:password@localhost:5432/lma
SECRET_KEY=your-secret-key
```

Run the server:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd lma-frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

## Deployment

The frontend is configured for deployment on [Vercel](https://vercel.com), with SPA rewrites defined in `vercel.json`.

## Roadmap

- [ ] Public API documentation
- [ ] Automated tests for the ELO calculation module
- [ ] Player statistics dashboard

## License

All rights reserved. This code is shared publicly for portfolio purposes; no license is granted for reuse, distribution, or commercial use without explicit permission.

## Contact

**Laureano Petri**
Backend Developer (Python/FastAPI) — open to remote freelance work
📧 laureanopetri@gmail.com
💻 [github.com/LaureanoPetri](https://github.com/LaureanoPetri)
