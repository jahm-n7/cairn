# Cairn

Prototype d'une app mobile de capsules géolocalisées : on dépose un message
(photo, vidéo ou note vocale) à un endroit précis, pour soi, des amis choisis
ou tout le monde, et il ne peut être rouvert que sur place ou à une date donnée.

Interface en français, thème sombre violet/rose.

## État du projet

Prototype d'interface : les capsules, les amis et les cercles sont des données
fictives (`src/data/`), la caméra est une maquette et il n'y a pas encore de
backend ni de géolocalisation réelle. Seuls les réglages sont sauvegardés sur
l'appareil.

## Stack

- Expo SDK 56, React Native 0.85, React 19, TypeScript
- Cartes : `react-native-maps` (Apple Maps sur iOS)
- Sons : `expo-audio`, retours haptiques : `expo-haptics`
- Polices : Fredoka, Nunito, Caveat

## Lancer l'app

Prérequis : Node.js 22 et l'app **Expo Go** (iOS/Android) ou un simulateur.

```sh
npm install
npx expo start
```

Puis scanner le QR code avec Expo Go, ou appuyer sur `i` pour ouvrir le
simulateur iOS. Une version web est disponible avec `npm run web`.

## Structure

```
App.tsx            point d'entrée et navigation
src/screens/       écrans (dépôt, découverte, profil, amis, paiement...)
src/components/    composants partagés (carte, barre d'onglets...)
src/data/          données fictives et stores
src/i18n/          traductions
src/theme/         couleurs, sons, haptique
```

## Licence

[MIT](LICENSE)
