export type AccessType = 'private' | 'friends' | 'public' | 'riddle' | 'mine';

export type Capsule = {
  id: string;
  author: string;
  initials: string;
  gradient: [string, string];
  media: 'Vidéo' | 'Audio' | 'Photo';
  access: string;
  accessType: AccessType;
  dm: number;
  message: string;
  date: string;
  dateKey: string;
  x: `${number}%`;
  y: `${number}%`;
  bearing: number;
  rad: number;
  dir: string;
  mine?: boolean;
  place?: string;
  openDate?: string;
  riddleQ?: string;
  riddleA?: string;
};

const OPEN_M = 5;

const RAW: Capsule[] = [
  {
    id: 'c1',
    author: 'Margaux',
    initials: 'M',
    gradient: ['#5a2d70', '#7a3da0'],
    media: 'Vidéo',
    access: 'Privé · Amis',
    accessType: 'friends',
    dm: 3,
    message: '« Reviens ici quand tu liras ça. »',
    date: 'il y a 2 ans',
    dateKey: 'date_2y',
    x: '45%',
    y: '62%',
    bearing: 48,
    rad: 0.42,
    dir: 'Nord-est ↗',
  },
  {
    id: 'c2',
    author: 'Léo',
    initials: 'L',
    gradient: ['#1f7d6e', '#2d9d8f'],
    media: 'Audio',
    access: 'Public',
    accessType: 'public',
    dm: 120,
    message: "« Le vent ici m'a rappelé toi. »",
    date: 'il y a 5 mois',
    dateKey: 'date_5m',
    x: '30%',
    y: '31%',
    bearing: 316,
    rad: 0.9,
    dir: 'Nord-ouest ↖',
  },
  {
    id: 'c3',
    author: 'Camille',
    initials: 'C',
    gradient: ['#5a2d70', '#c43d7a'],
    media: 'Photo',
    access: 'Énigme',
    accessType: 'riddle',
    dm: 2,
    riddleQ: 'Où nous sommes-nous dit oui ?',
    riddleA: 'jardin',
    message: '« Tu as trouvé. Je savais que tu chercherais. »',
    date: 'il y a 1 an',
    dateKey: 'date_1y',
    x: '75%',
    y: '55%',
    bearing: 150,
    rad: 0.16,
    dir: 'Sud-est ↘',
  },
  {
    id: 'me1',
    author: 'Vous',
    initials: 'V',
    mine: true,
    place: 'Berge du Rhône',
    gradient: ['#b9892f', '#ff3d77'],
    media: 'Vidéo',
    access: 'Privé · Vous',
    accessType: 'mine',
    dm: 3,
    openDate: '2027-06-14T18:00',
    message: '« Pour mon futur moi. »',
    date: 'déposée par vous',
    dateKey: 'deposited_by_you',
    x: '52%',
    y: '47%',
    bearing: 12,
    rad: 0.22,
    dir: 'Nord ↑',
  },
  {
    id: 'me2',
    author: 'Vous',
    initials: 'V',
    mine: true,
    place: 'Roseraie du parc',
    gradient: ['#2d6a9d', '#ff3d77'],
    media: 'Photo',
    access: 'Privé · Vous',
    accessType: 'mine',
    dm: 140,
    message: "« Le banc où on s'asseyait. »",
    date: 'déposée par vous',
    dateKey: 'deposited_by_you',
    x: '28%',
    y: '24%',
    bearing: 300,
    rad: 0.86,
    dir: 'Nord-ouest ↖',
  },
  {
    id: 'me3',
    author: 'Vous',
    initials: 'V',
    mine: true,
    place: 'Pont de la Guillotière',
    gradient: ['#7a3da0', '#ff3d77'],
    media: 'Audio',
    access: 'Privé · Vous',
    accessType: 'mine',
    dm: 95,
    openDate: '2027-12-25T09:00',
    message: '« À écouter le bon jour. »',
    date: 'déposée par vous',
    dateKey: 'deposited_by_you',
    x: '70%',
    y: '78%',
    bearing: 210,
    rad: 0.6,
    dir: 'Sud-ouest ↙',
  },
];

export function accessKey(accessType: AccessType): string {
  switch (accessType) {
    case 'friends':
      return 'acc_friends';
    case 'public':
      return 'acc_public';
    case 'riddle':
      return 'acc_riddle';
    default:
      return 'acc_mine';
  }
}

export function mediaKey(media: Capsule['media']): string {
  return media === 'Audio' ? 'media_audio' : media === 'Photo' ? 'media_photo' : 'media_video';
}

export function getCapsules(): (Capsule & { here: boolean; distance: string })[] {
  return RAW.map((c) => ({
    ...c,
    here: c.dm <= OPEN_M,
    distance: `${c.dm} m`,
  }));
}
