// Fuente: build101 - Acreditaciones.xlsx, hoja Acreditaciones, columnas A–C.
// Se importan las 99 personas, sin filtrar por llegada ni copiar datos de contacto.
export const INVESTMENT_GAME = {
  roundId: "build101-acreditaciones-preview-v1",
  demo: true,
  seedDemoInvestments: false,
  open: true,
  budget: 1_000_000,
  step: 25_000,
} as const;

export type InvestorTeam = {
  id: string;
  number: number;
  name: string;
  members: { id: string; name: string }[];
};

// Nómina completa: los equipos que pueden entrar y votar.
export const INVESTOR_TEAMS: InvestorTeam[] = [
  {
    id: "equipo-01", number: 1, name: "Beyond The Bot",
    members: ["Rosario Stoppiello", "Martina Berrutti", "Romina Lubniski"].map((name, i) => ({ id: `equipo-01-${i + 1}`, name })),
  },
  {
    id: "equipo-02", number: 2, name: "3 tokens",
    members: ["Joaquin Rodriguez", "Ignacio Tondo", "MARTIN BLANCO"].map((name, i) => ({ id: `equipo-02-${i + 1}`, name })),
  },
  {
    id: "equipo-03", number: 3, name: "Equipo de Diego Marin",
    members: ["Diego Marin", "Juan Martin Noguez", "Ignacio Iglesia"].map((name, i) => ({ id: `equipo-03-${i + 1}`, name })),
  },
  {
    id: "equipo-04", number: 4, name: "GrecIA",
    members: ["Franco Fontanarossa", "Juan Pedro Guerra", "Guadalupe Carrasco"].map((name, i) => ({ id: `equipo-04-${i + 1}`, name })),
  },
  {
    id: "equipo-05", number: 5, name: "UnifyAI (por lo menos por ahora)",
    members: ["Manuel Arocena", "Bruno Pallas", "Facundo Sansalone"].map((name, i) => ({ id: `equipo-05-${i + 1}`, name })),
  },
  {
    id: "equipo-06", number: 6, name: "b&niks",
    members: ["Nicolas Tognola", "Alberto Ortolani", "Nicolas Sere"].map((name, i) => ({ id: `equipo-06-${i + 1}`, name })),
  },
  {
    id: "equipo-07", number: 7, name: "Equipo de Manuel Anselmi",
    members: ["Manuel Anselmi", "Nicolas Barboza", "Santiago Lizarazu"].map((name, i) => ({ id: `equipo-07-${i + 1}`, name })),
  },
  {
    id: "equipo-08", number: 8, name: "las chicas súper poderosas",
    members: ["Guido Vizoso", "Francisco Cuadra", "Joaquin Hernandez"].map((name, i) => ({ id: `equipo-08-${i + 1}`, name })),
  },
  {
    id: "equipo-09", number: 9, name: "Equipo de Santiago Abásolo",
    members: ["Santiago Abásolo", "Ignacio Azaretto Soler", "Gabriel Villaverde"].map((name, i) => ({ id: `equipo-09-${i + 1}`, name })),
  },
  {
    id: "equipo-10", number: 10, name: "TJJ Tech",
    members: ["Juan Estape", "Tomas Zelaschi", "Josefina Cardozo"].map((name, i) => ({ id: `equipo-10-${i + 1}`, name })),
  },
  {
    id: "equipo-11", number: 11, name: "furIA",
    members: ["Guillermo Storace", "Phillip Bowles", "Manuel Perez"].map((name, i) => ({ id: `equipo-11-${i + 1}`, name })),
  },
  {
    id: "equipo-12", number: 12, name: "Claude & Asociados",
    members: ["Bruno Colo", "Pedro Morga", "Matias Moser"].map((name, i) => ({ id: `equipo-12-${i + 1}`, name })),
  },
  {
    id: "equipo-13", number: 13, name: "SOLO",
    members: ["Facundo Larrosa", "Matías ramilo", "Guido dinello"].map((name, i) => ({ id: `equipo-13-${i + 1}`, name })),
  },
  {
    id: "equipo-14", number: 14, name: "TokenMaxxers",
    members: ["Bruno Romero", "Juan Perrachon", "German Ipes"].map((name, i) => ({ id: `equipo-14-${i + 1}`, name })),
  },
  {
    id: "equipo-15", number: 15, name: "BigO",
    members: ["Tomás Rama", "Jessica Sista", "Matias Hirschfeld"].map((name, i) => ({ id: `equipo-15-${i + 1}`, name })),
  },
  {
    id: "equipo-16", number: 16, name: "JAM",
    members: ["Alexis Friss de Kereki", "Mauricio Friss de Kereki", "Joaquín Becerra"].map((name, i) => ({ id: `equipo-16-${i + 1}`, name })),
  },
  {
    id: "equipo-17", number: 17, name: "Equipo de Juan Sebastian Val",
    members: ["Juan Sebastian Val", "Juan Maria Andre", "Paul Mc Cubbin"].map((name, i) => ({ id: `equipo-17-${i + 1}`, name })),
  },
  {
    id: "equipo-18", number: 18, name: "Equipo de Nicolás Stanko",
    members: ["Nicolás Stanko", "Pablo Maurente", "Pablo Dalchiele"].map((name, i) => ({ id: `equipo-18-${i + 1}`, name })),
  },
  {
    id: "equipo-19", number: 19, name: "Delta",
    members: ["Emilio Muniz", "Gastón Martinez", "Agustín Gomez"].map((name, i) => ({ id: `equipo-19-${i + 1}`, name })),
  },
  {
    id: "equipo-20", number: 20, name: "Los Top Globales",
    members: ["Martin Trigo", "Santiago Muñoz", "Benjamin Macció"].map((name, i) => ({ id: `equipo-20-${i + 1}`, name })),
  },
  {
    id: "equipo-21", number: 21, name: "Waven",
    members: ["Nicolas Perez Quintero", "Tiago Benedetto", "Lucas Melo"].map((name, i) => ({ id: `equipo-21-${i + 1}`, name })),
  },
  {
    id: "equipo-22", number: 22, name: "Equipo de Manuel Graña",
    members: ["Manuel Graña", "Franco Bonavita", "Enzo Izquierdo"].map((name, i) => ({ id: `equipo-22-${i + 1}`, name })),
  },
  {
    id: "equipo-23", number: 23, name: "Equipo de Ivan Guchin",
    members: ["Ivan Guchin", "Francisco Carbajal", "Camilo Aguiar"].map((name, i) => ({ id: `equipo-23-${i + 1}`, name })),
  },
  {
    id: "equipo-24", number: 24, name: "Equipo de Felipe Perdomo",
    members: ["Felipe Perdomo", "Santiago Souto", "Erika Alvarez"].map((name, i) => ({ id: `equipo-24-${i + 1}`, name })),
  },
  {
    id: "equipo-25", number: 25, name: "Sin Dormir S.A.",
    members: ["Emiliano Montone", "Guzman de Leon", "Claude Tissierre"].map((name, i) => ({ id: `equipo-25-${i + 1}`, name })),
  },
  {
    id: "equipo-26", number: 26, name: "Grupo numero 502",
    members: ["Santiago Sosa", "Joaquin Piedra", "Renzo De Marco"].map((name, i) => ({ id: `equipo-26-${i + 1}`, name })),
  },
  {
    id: "equipo-27", number: 27, name: "Equipo de Juan Pablo Borja",
    members: ["Juan Pablo Borja", "Federico Dallo", "Zuo Heng Dai"].map((name, i) => ({ id: `equipo-27-${i + 1}`, name })),
  },
  {
    id: "equipo-28", number: 28, name: "Equipo de Salvador Secco",
    members: ["Salvador Secco", "Juan Pablo Benítez", "Facundo Morena"].map((name, i) => ({ id: `equipo-28-${i + 1}`, name })),
  },
  {
    id: "equipo-29", number: 29, name: "LIF",
    members: ["INES BERTOLOTTI", "Lara Stirling", "Felipe Lyonnet"].map((name, i) => ({ id: `equipo-29-${i + 1}`, name })),
  },
  {
    id: "equipo-30", number: 30, name: "LUMAC",
    members: ["Martina Mazza", "Camila Granato", "Luca Benites"].map((name, i) => ({ id: `equipo-30-${i + 1}`, name })),
  },
  {
    id: "equipo-31", number: 31, name: "Luxis",
    members: ["Máximo Zales", "Sebastián Viglione", "Rafael Fuidio"].map((name, i) => ({ id: `equipo-31-${i + 1}`, name })),
  },
  {
    id: "equipo-32", number: 32, name: "Equipo individuales 1 (César)",
    members: ["Cesar Canessa", "Adrian Mircus", "Mauricio Parodi"].map((name, i) => ({ id: `equipo-32-${i + 1}`, name })),
  },
  {
    id: "equipo-33", number: 33, name: "Equipo de Ezequiel Garcia",
    members: ["Ezequiel Garcia", "Juan Portas", "Rodrigo Portas"].map((name, i) => ({ id: `equipo-33-${i + 1}`, name })),
  },
];

export type InvestmentTeam = {
  id: string;
  teamId: string | null;
  name: string;
  category: string;
  description: string;
};

// Completar con los 10 equipos finalistas, usando IDs de INVESTOR_TEAMS.
// Ejemplo: ["equipo-01", "equipo-12", ...]. No se eligen finalistas automáticamente.
export const FINALIST_TEAM_IDS: string[] = [];

const DEMO_PROJECTS: InvestmentTeam[] = Array.from({ length: 10 }, (_, index) => ({
  id: `por-definir-${String(index + 1).padStart(2, "0")}`,
  teamId: null,
  name: `a definir ${String(index + 1).padStart(2, "0")}`,
  category: "FINALISTA",
  description: "Equipo pendiente de confirmar.",
}));

export const INVESTMENT_TEAMS: InvestmentTeam[] = FINALIST_TEAM_IDS.length > 0
  ? FINALIST_TEAM_IDS.map((id) => {
    const team = INVESTOR_TEAMS.find((entry) => entry.id === id);
    if (!team) throw new Error(`Equipo finalista desconocido: ${id}`);
    return { id: team.id, teamId: team.id, name: team.name, category: `EQUIPO ${String(team.number).padStart(2, "0")}`, description: "Producto de IA presentado en build 101." };
  })
  : INVESTMENT_GAME.demo ? DEMO_PROJECTS : [];

export const INVESTORS = INVESTOR_TEAMS.flatMap((team) => team.members.map((member) => ({ ...member, teamId: team.id })));
export type Allocations = Record<string, number>;
export type Portfolio = { investorId: string; allocations: Allocations; updatedAt: string };
export type GameResults = {
  teams: { teamId: string; amount: number; investors: number }[];
  total: number;
  submitted: number;
  participants: number;
};
export type GameSnapshot = {
  results: GameResults;
  portfolio: Portfolio | null;
  storage: "shared" | "local" | "preview";
  updatedAt: string;
};

export function money(amount: number) {
  return `US$ ${new Intl.NumberFormat("es-UY", { maximumFractionDigits: 0 }).format(amount)}`;
}

export function validatePortfolio(body: unknown): { portfolio: Portfolio; error?: never } | { error: string; portfolio?: never } {
  if (!body || typeof body !== "object") return { error: "La cartera llegó incompleta." };
  const { investorId, allocations } = body as Partial<Portfolio>;
  const investor = INVESTORS.find((person) => person.id === investorId);
  if (!investor) return { error: "Seleccioná un participante de la lista." };
  if (!allocations || typeof allocations !== "object" || Array.isArray(allocations)) return { error: "Revisá las inversiones de tu cartera." };
  const clean: Allocations = {};
  for (const [teamId, amount] of Object.entries(allocations)) {
    const recipient = INVESTMENT_TEAMS.find((team) => team.id === teamId);
    if (!recipient) return { error: "Ese equipo no participa de esta ronda." };
    if (!Number.isSafeInteger(amount) || amount < 0 || amount % INVESTMENT_GAME.step !== 0) return { error: "Usá montos positivos en pasos de US$ 25.000." };
    if (recipient.teamId === investor.teamId && amount > 0) return { error: "No podés invertir en tu propio equipo." };
    if (amount > 0) clean[teamId] = amount;
  }
  const total = Object.values(clean).reduce((sum, amount) => sum + amount, 0);
  if (total !== INVESTMENT_GAME.budget) return { error: "Repartí exactamente US$ 1.000.000 antes de confirmar." };
  return { portfolio: { investorId: investor.id, allocations: clean, updatedAt: new Date().toISOString() } };
}

export function demoPortfolios(): Portfolio[] {
  if (!INVESTMENT_GAME.demo || !INVESTMENT_GAME.seedDemoInvestments) return [];
  return INVESTORS.filter((_, i) => i >= 4 && i % 2 === 0).map((investor, i) => {
    const others = INVESTMENT_TEAMS.filter((team) => team.teamId !== investor.teamId);
    return {
      investorId: investor.id,
      allocations: {
        [others[i % others.length].id]: 500_000,
        [others[(i + 3) % others.length].id]: 300_000,
        [others[(i + 5) % others.length].id]: 200_000,
      },
      updatedAt: "2026-10-18T12:00:00.000Z",
    };
  });
}

export function summarizePortfolios(portfolios: Portfolio[]): GameResults {
  return {
    teams: INVESTMENT_TEAMS.map((team) => ({
      teamId: team.id,
      amount: portfolios.reduce((sum, portfolio) => sum + (portfolio.allocations[team.id] ?? 0), 0),
      investors: portfolios.filter((portfolio) => (portfolio.allocations[team.id] ?? 0) > 0).length,
    })).sort((a, b) => b.amount - a.amount || a.teamId.localeCompare(b.teamId)),
    total: portfolios.reduce((sum, portfolio) => sum + Object.values(portfolio.allocations).reduce((subtotal, amount) => subtotal + amount, 0), 0),
    submitted: portfolios.length,
    participants: INVESTORS.length,
  };
}
