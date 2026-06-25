// Generates the Cairn app icon + splash assets from the "jeu complet" icon design.
// The mark is a cairn (3 stacked pebbles) on a purple→magenta→pink gradient.
// Run: node scripts/gen-assets.js
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const ASSETS = path.join(__dirname, '..', 'assets');

// 3 stacked pebbles in a 0..100 viewBox (from the prototype).
function pebbles(fill) {
  return (
    `<ellipse cx="50" cy="73" rx="24" ry="12.5" fill="${fill}"/>` +
    `<ellipse cx="47" cy="50" rx="17.5" ry="11" fill="${fill}"/>` +
    `<ellipse cx="52" cy="30" rx="11" ry="8.5" fill="${fill}"/>`
  );
}

// Place the 0..100 mark inside a square of side S with `pad` fraction of padding.
function cairnGroup(fill, S, pad) {
  const off = pad * S;
  const sc = ((1 - 2 * pad) * S) / 100;
  return `<g transform="translate(${off},${off}) scale(${sc})">${pebbles(fill)}</g>`;
}

const GRAD = (id) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">` +
  `<stop offset="0" stop-color="#3a1c70"/>` +
  `<stop offset="0.58" stop-color="#a93a86"/>` +
  `<stop offset="1" stop-color="#ff5c8a"/>` +
  `</linearGradient>`;

const SHEEN =
  `<radialGradient id="sheen" cx="0.28" cy="0.18" r="0.52">` +
  `<stop offset="0" stop-color="#ffffff" stop-opacity="0.28"/>` +
  `<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>` +
  `</radialGradient>`;

const CREAM = '#fff0f6';

function render(svg, size, out) {
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  fs.writeFileSync(path.join(ASSETS, out), r.render().asPng());
  console.log('  ✓', out, `(${size}px)`);
}

// 1) Master icon — full square gradient + sheen + cream cairn (iOS masks corners).
function iconSvg(S) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">` +
    `<defs>${GRAD('bg')}${SHEEN}</defs>` +
    `<rect width="${S}" height="${S}" fill="url(#bg)"/>` +
    `<rect width="${S}" height="${S}" fill="url(#sheen)"/>` +
    cairnGroup(CREAM, S, 0.21) +
    `</svg>`
  );
}

// 2) Splash mark — soft pink glow + cream cairn on transparent (centered on dark bg by expo-splash-screen).
function splashSvg(S) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">` +
    `<defs><radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">` +
    `<stop offset="0" stop-color="#ff5c8a" stop-opacity="0.55"/>` +
    `<stop offset="0.62" stop-color="#ff5c8a" stop-opacity="0"/>` +
    `</radialGradient></defs>` +
    `<rect width="${S}" height="${S}" fill="url(#glow)"/>` +
    cairnGroup(CREAM, S, 0.26) +
    `</svg>`
  );
}

// 3) Android adaptive foreground — cream cairn on transparent, extra padding for the safe zone.
function adaptiveFgSvg(S) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">` +
    cairnGroup(CREAM, S, 0.3) +
    `</svg>`
  );
}

// 4) Android adaptive background — the gradient.
function adaptiveBgSvg(S) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">` +
    `<defs>${GRAD('bg')}</defs><rect width="${S}" height="${S}" fill="url(#bg)"/></svg>`
  );
}

// 5) Android monochrome — white cairn silhouette on transparent.
function monoSvg(S) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">` +
    cairnGroup('#ffffff', S, 0.3) +
    `</svg>`
  );
}

console.log('Generating Cairn assets…');
render(iconSvg(1024), 1024, 'icon.png');
render(splashSvg(1024), 1024, 'splash-icon.png');
render(adaptiveFgSvg(1024), 1024, 'android-icon-foreground.png');
render(adaptiveBgSvg(1024), 1024, 'android-icon-background.png');
render(monoSvg(1024), 1024, 'android-icon-monochrome.png');
render(iconSvg(196), 196, 'favicon.png');
console.log('Done.');
