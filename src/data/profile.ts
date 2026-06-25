export type Friend = {
  id: string;
  name: string;
  initials: string;
  color: string;
  since: string;
  shared: number;
  received: number;
  circles: string[];
};

export type Circle = {
  id: string;
  name: string;
  color: string;
  desc: string;
};

export type MyCapsule = {
  id: string;
  place: string;
  sub: string;
  media: string;
  access: string;
  status: string;
  statusDot: string;
  gradient: [string, string];
  message: string;
  condition: string;
  opens: string;
  openAt: string;
  openDate: string;
};

export const profile = {
  name: 'Toi',
  handle: 'toi',
  loc: 'Lyon, France',
  capsulesLeft: 7,
  capsulesFound: 12,
  pendingRequests: 1,
};

export const friends: Friend[] = [
  { id: 'f1', name: 'Margaux', initials: 'M', color: '#7a3da0', since: '2023', shared: 4, received: 3, circles: ['cir1'] },
  { id: 'f2', name: 'Léo', initials: 'L', color: '#2d9d8f', since: '2024', shared: 2, received: 1, circles: ['cir2'] },
  { id: 'f3', name: 'Camille', initials: 'C', color: '#c43d7a', since: '2022', shared: 6, received: 5, circles: ['cir1', 'cir2'] },
  { id: 'f4', name: 'Sacha', initials: 'S', color: '#3a3060', since: '2025', shared: 0, received: 0, circles: [] },
  { id: 'f5', name: 'Nora', initials: 'N', color: '#8a4d2a', since: '2023', shared: 3, received: 2, circles: ['cir1'] },
  { id: 'f6', name: 'Yanis', initials: 'Y', color: '#2d6a9d', since: '2024', shared: 1, received: 4, circles: ['cir2'] },
  { id: 'f7', name: 'Élodie', initials: 'É', color: '#6e2d9d', since: '2021', shared: 8, received: 7, circles: ['cir1', 'cir3'] },
  { id: 'f8', name: 'Malik', initials: 'M', color: '#2d9d6a', since: '2025', shared: 2, received: 0, circles: [] },
  { id: 'f9', name: 'Jade', initials: 'J', color: '#9d2d5a', since: '2022', shared: 5, received: 3, circles: ['cir3'] },
];

export const circles: Circle[] = [
  { id: 'cir1', name: 'Mes proches', color: '#7a3da0', desc: 'Capsules les plus intimes' },
  { id: 'cir2', name: 'Cordée de rando', color: '#2d9d8f', desc: 'Souvenirs sur les sentiers' },
  { id: 'cir3', name: 'Famille', color: '#c43d7a', desc: "Aucun membre pour l'instant" },
];

export const myCapsules: MyCapsule[] = [
  {
    id: 'm1',
    place: "Parc de la Tête d'Or",
    sub: 'Lyon · déposée il y a 2 ans',
    media: 'Vidéo',
    access: 'Amis choisis',
    status: 'En attente',
    statusDot: '#ff5c8a',
    gradient: ['#5a2d70', '#7a3da0'],
    message: '« Reviens ici quand tu liras ça. »',
    condition: 'Présence sur le lieu · à moins de 5 m',
    opens: 'Amis choisis · 4 personnes',
    openAt: '14 juin 2027 · 18:00',
    openDate: '2027-06-14T18:00',
  },
  {
    id: 'm2',
    place: "Calanque d'En-Vau",
    sub: 'Cassis · déposée il y a 8 mois',
    media: 'Audio',
    access: 'Public',
    status: 'Déterrée par Léo',
    statusDot: '#6e9a6e',
    gradient: ['#1f7d6e', '#2d9d8f'],
    message: "« Le vent ici m'a rappelé toi. »",
    condition: 'Présence sur le lieu · à moins de 5 m',
    opens: 'Public · tout le monde',
    openAt: '2 septembre 2026 · 09:30',
    openDate: '2026-09-02T09:30',
  },
  {
    id: 'm3',
    place: 'Toit de la Croix-Rousse',
    sub: 'Lyon · déposée il y a 1 an',
    media: 'Photo',
    access: 'Énigme',
    status: 'Déterrée 3×',
    statusDot: '#6e9a6e',
    gradient: ['#5a2d70', '#c43d7a'],
    message: '« Tu as trouvé. Je savais que tu chercherais. »',
    condition: 'Présence sur le lieu · énigme',
    opens: 'Public · tout le monde',
    openAt: '25 décembre 2026 · 00:00',
    openDate: '2026-12-25T00:00',
  },
];
