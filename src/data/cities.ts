export type City = { name: string; country: string }

export const CITIES: City[] = [
  { name: 'Tokyo', country: 'Japan' },
  { name: 'Paris', country: 'France' },
  { name: 'New York', country: 'USA' },
  { name: 'Tulum', country: 'Mexico' },
  { name: 'Reykjavik', country: 'Iceland' },
  { name: 'Florence', country: 'Italy' },
  { name: 'Mexico City', country: 'Mexico' },
  { name: 'Bali', country: 'Indonesia' },
  { name: 'Barcelona', country: 'Spain' },
  { name: 'Rovaniemi', country: 'Finland' },
  { name: 'Kiruna', country: 'Sweden' },
  { name: 'Samara', country: 'Costa Rica' },
  { name: 'Berlin', country: 'Germany' },
  { name: 'Leticia', country: 'Colombia' },
]

// Per-city landmark icons. 24×24 viewBox, stroke-based, inherits color from CSS.
export const CITY_ICONS: Record<string, string> = {
  flexible: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="9" ry="3.5"/><line x1="12" y1="3" x2="12" y2="21"/>',
  Tokyo: '<path d="M2 4 L22 4"/><path d="M3 7 L21 7"/><line x1="6" y1="7" x2="6" y2="22"/><line x1="18" y1="7" x2="18" y2="22"/><line x1="11" y1="7" x2="11" y2="11"/><line x1="13" y1="7" x2="13" y2="11"/><line x1="4" y1="11.5" x2="20" y2="11.5"/>',
  Paris: '<line x1="12" y1="2" x2="12" y2="4"/><path d="M12 4 L16 22 L8 22 Z"/><line x1="10.3" y1="10" x2="13.7" y2="10"/><line x1="9.5" y1="14" x2="14.5" y2="14"/><line x1="8.5" y1="18" x2="15.5" y2="18"/>',
  'New York': '<polyline points="2,22 2,15 5,15 5,9 8,9 8,15 10,15 10,7 12,7 12,4 14,4 14,15 16,15 16,9 19,9 19,11 22,11 22,22"/><line x1="13" y1="4" x2="13" y2="2"/>',
  Tulum: '<polygon points="3,21 6,18 8,15 10,12 14,12 16,15 18,18 21,21"/><rect x="11" y="9" width="2" height="3"/><line x1="6" y1="18" x2="18" y2="18"/><line x1="8" y1="15" x2="16" y2="15"/>',
  Reykjavik: '<polyline points="3,20 7,13 10,17 14,11 17,15 21,20"/><line x1="3" y1="20" x2="21" y2="20"/><path d="M3 5 Q7 3 11 4 Q15 6 19 3 Q21 3 21 4"/>',
  Florence: '<line x1="12" y1="3" x2="12" y2="5"/><circle cx="12" cy="6" r="1"/><path d="M5 13 Q5 7 12 7 Q19 7 19 13"/><rect x="4" y="13" width="16" height="8"/><line x1="9" y1="13" x2="9" y2="21"/><line x1="15" y1="13" x2="15" y2="21"/>',
  'Mexico City': '<rect x="4" y="14" width="16" height="8"/><polygon points="6,14 9,14 8,11 7,11"/><polygon points="15,14 18,14 17,11 16,11"/><line x1="7.5" y1="11" x2="7.5" y2="9"/><line x1="6.5" y1="10" x2="8.5" y2="10"/><line x1="16.5" y1="11" x2="16.5" y2="9"/><line x1="15.5" y1="10" x2="17.5" y2="10"/><path d="M9 14 Q12 11 15 14"/>',
  Bali: '<path d="M12 10 Q11 14 11 18 Q11 21 12 22"/><path d="M12 10 Q8 6 3 7"/><path d="M12 10 Q16 6 21 7"/><path d="M12 10 Q9 5 6 4"/><path d="M12 10 Q15 5 18 4"/>',
  Barcelona: '<path d="M6 22 V12 Q6 7 7 6 Q8 7 8 12 V22"/><path d="M10 22 V10 Q10 5 11 4 Q12 5 12 10 V22"/><path d="M13 22 V10 Q13 5 14 4 Q15 5 15 10 V22"/><path d="M17 22 V12 Q17 7 18 6 Q19 7 19 12 V22"/><line x1="3" y1="22" x2="21" y2="22"/>',
  Rovaniemi: '<polygon points="12,3 8,9 10,9 6,15 9,15 5,21 19,21 15,15 18,15 14,9 16,9"/><line x1="12" y1="21" x2="12" y2="23"/>',
  Kiruna: '<line x1="12" y1="2" x2="12" y2="22"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/><path d="M12 6 l-2 2 M12 6 l2 2 M12 18 l-2 -2 M12 18 l2 -2 M6 12 l2 -2 M6 12 l2 2 M18 12 l-2 -2 M18 12 l-2 2"/>',
  Samara: '<path d="M12 21 V11"/><path d="M12 11 Q7 8 3 10"/><path d="M12 11 Q17 8 21 10"/><path d="M12 11 Q9 6 6 5"/><path d="M12 11 Q15 6 18 5"/><path d="M3 21 Q7.5 19 12 21 Q16.5 23 21 21"/>',
  Berlin: '<line x1="12" y1="2" x2="12" y2="22"/><circle cx="12" cy="7" r="2.5"/><path d="M9 22 L12 16 L15 22"/>',
  Leticia: '<path d="M3 19 Q8 16.5 12 19 Q16 21.5 21 19"/><line x1="12" y1="16" x2="12" y2="8"/><path d="M12 9 Q8 9 7 5"/><path d="M12 12 Q16 12 17 8"/><path d="M12 11 Q9 11 8 8"/>',
}

// Each city gets a background tone evoking its character.
export const CITY_COLORS: Record<string, string> = {
  flexible: '#F0E2C0',
  Tokyo: '#F0B8B0',
  Paris: '#D9CCE2',
  'New York': '#B8C6D8',
  Tulum: '#A0D4C8',
  Reykjavik: '#BCCDD0',
  Florence: '#E8C8A0',
  'Mexico City': '#E8B0BC',
  Bali: '#A8C898',
  Barcelona: '#E89880',
  Rovaniemi: '#C8DCEA',
  Kiruna: '#D6E6F0',
  Samara: '#8ECDB4',
  Berlin: '#C7CBD0',
  Leticia: '#8FBE73',
}

// "City, Country" for a stay's city — matches how the Where filter labels destinations.
const COUNTRY_BY_CITY = new Map(CITIES.map((c) => [c.name, c.country]))
export function cityCountry(city: string): string {
  const country = COUNTRY_BY_CITY.get(city)
  return country ? `${city}, ${country}` : city
}
