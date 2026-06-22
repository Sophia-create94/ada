import type { Stay } from './types'

// On-brand SVG placeholder — same for every stay until real photos are dropped
// into /assets named by slug. The slug travels onto the <img> as data-asset-slug
// so each card maps visibly to its asset.
export const PLACEHOLDER_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" preserveAspectRatio="xMidYMid slice">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#F4EDDF"/>' +
      '<stop offset="1" stop-color="#E6D5B0"/>' +
      '</linearGradient></defs>' +
      '<rect width="600" height="450" fill="url(#g)"/>' +
      '<g transform="translate(270 195)" fill="none" stroke="#B8862D" ' +
      'stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.4">' +
      '<rect x="0" y="0" width="60" height="60" rx="8"/>' +
      '<circle cx="20" cy="20" r="5" fill="#B8862D" opacity="0.5"/>' +
      '<path d="M60 42 L42 25 L15 52"/>' +
      '</g>' +
      '</svg>',
  )

// Real photos live in public/assets/style/<style>/<slug>.jpg, grouped by style under the
// style/ folder for a cleaner overview (run scripts/fetch-images.mjs; scripts/reconcile-assets.mjs
// re-files each image into its style's folder after a re-style). StayCard falls back to
// PLACEHOLDER_IMG on error, so this is safe even before the images have been fetched.
export function getImageUrl(stay: Stay): string {
  return `/assets/style/${stay.style}/${stay.image}.jpg`
}
