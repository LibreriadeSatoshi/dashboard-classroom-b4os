/**
 * Lord of the Rings Themed Anonymous Username Generator
 * 
 * Generates consistent anonymous IDs based on GitHub usernames
 * using Middle-earth locations, characters, and elements.
 */

import crypto from 'node:crypto'

// Locations from Middle-earth
const LOCATIONS = [
  'Rivendell', 'Gondor', 'Rohan', 'Shire', 'Moria', 'Isengard',
  'Lothlorien', 'Edoras', 'MinasTirith', 'Helm', 'Fangorn', 'Dale',
  'Erebor', 'Esgaroth', 'Bree', 'Weathertop', 'Osgiliath', 'Dol',
  'Mirkwood', 'Dunharrow', 'Pelennor', 'Cair', 'Barad', 'Orthanc'
]

// Races and titles from Middle-earth
const RACES = [
  'Hobbit', 'Elf', 'Dwarf', 'Ranger', 'Wizard', 'King',
  'Lord', 'Knight', 'Guardian', 'Rider', 'Warrior', 'Mage',
  'Scout', 'Archer', 'Smith', 'Bard', 'Healer', 'Warden',
  'Captain', 'Prince', 'Duke', 'Earl', 'Baron', 'Steward'
]

// Weapons and artifacts
const ARTIFACTS = [
  'Sting', 'Anduril', 'Glamdring', 'Orcrist', 'Durin', 'Aeglos',
  'Grond', 'Palantir', 'Ring', 'Crown', 'Shield', 'Bow',
  'Staff', 'Cloak', 'Horn', 'Gem', 'Stone', 'Crystal',
  'Blade', 'Axe', 'Spear', 'Arrow', 'Torch', 'Key'
]

// Elements and nature
const ELEMENTS = [
  'Star', 'Moon', 'Sun', 'Light', 'Shadow', 'Fire',
  'Water', 'Earth', 'Wind', 'Storm', 'Thunder', 'Lightning',
  'Snow', 'Ice', 'Flame', 'Ember', 'Mist', 'Dawn',
  'Dusk', 'Night', 'Silver', 'Gold', 'Iron', 'Steel'
]

/**
 * Generates a deterministic anonymous ID based on GitHub username
 * Format: [Race][Location]_[Element][Number]
 * Example: ElfRivendell_Star42A, DwarfMoria_Fire17B
 */
export function generateAnonymousId(githubUsername: string): string {
  if (!githubUsername) {
    return 'UnknownHobbit_Shire01'
  }

  // Create deterministic hash
  const hash = crypto
    .createHash('sha256')
    .update(githubUsername.toLowerCase() + 'MIDDLE_EARTH_SECRET')
    .digest('hex')

  // Extract indices from hash
  const raceIndex = Number.parseInt(hash.substring(0, 2), 16) % RACES.length
  const locationIndex = Number.parseInt(hash.substring(2, 4), 16) % LOCATIONS.length
  const elementIndex = Number.parseInt(hash.substring(4, 6), 16) % ELEMENTS.length
  
  // Generate number and letter suffix
  const number = (Number.parseInt(hash.substring(6, 8), 16) % 99) + 1
  const letterIndex = Number.parseInt(hash.substring(8, 10), 16) % 26
  const letter = String.fromCodePoint(65 + letterIndex) // A-Z

  const race = RACES[raceIndex]
  const location = LOCATIONS[locationIndex]
  const element = ELEMENTS[elementIndex]

  return `${race}${location}_${element}${number.toString().padStart(2, '0')}${letter}`
}

/**
 * Finds a user's anonymous ID by their real GitHub username
 */
export function findUserByRealUsername(
  realUsername: string, 
  allUsernames: string[]
): { anonymousId: string; found: boolean } {
  const anonymousId = generateAnonymousId(realUsername)
  const found = allUsernames.some(username => 
    generateAnonymousId(username) === anonymousId
  )
  
  return { anonymousId, found }
}

/**
 * Get avatar initials from anonymous ID
 * Example: ElfRivendell_Star42A -> ER
 */
export function getAvatarInitials(anonymousId: string): string {
  if (!anonymousId || anonymousId.length < 2) {
    return 'ME' // Middle Earth
  }
  
  const parts = anonymousId.split('_')
  if (parts.length < 1) {
    return anonymousId.substring(0, 2).toUpperCase()
  }
  
  const firstPart = parts[0]
  // Try to extract race and location initials
  const raceMatch = RACES.find(race => firstPart.startsWith(race))
  if (raceMatch) {
    const locationPart = firstPart.substring(raceMatch.length)
    const locationMatch = LOCATIONS.find(loc => locationPart.startsWith(loc))
    if (locationMatch) {
      return `${raceMatch[0]}${locationMatch[0]}`.toUpperCase()
    }
  }
  
  // Fallback to first two characters
  return firstPart.substring(0, 2).toUpperCase()
}

/**
 * Get a themed description for the anonymous ID
 */
export function getAnonymousDescription(anonymousId: string): string {
  const parts = anonymousId.split('_')
  if (parts.length < 2) {
    return 'Un habitante de la Tierra Media'
  }
  
  const firstPart = parts[0]
  const secondPart = parts[1]
  
  // Extract race
  const race = RACES.find(r => firstPart.startsWith(r))
  // Extract location  
  const location = LOCATIONS.find(l => firstPart.includes(l))
  // Extract element
  const element = ELEMENTS.find(e => secondPart.startsWith(e))
  
  if (race && location && element) {
    return `${race} de ${location}, portador de ${element}`
  } else if (race && location) {
    return `${race} de ${location}`
  } else if (race) {
    return `${race} de la Tierra Media`
  }
  
  return 'Habitante de la Tierra Media'
}

/**
 * Generate avatar color based on anonymous ID
 */
export function getAvatarColor(anonymousId: string): { from: string; to: string } {
  const id = anonymousId.toLowerCase()
  
  // Wizards - magical purples and mystical colors
  if (id.includes('wizard') || id.includes('gandalf') || id.includes('saruman')) {
    return { from: 'from-purple-400', to: 'to-indigo-700' }
  }
  
  // Elves - ethereal blues and silvers
  if (id.includes('elf') || id.includes('rivendell') || id.includes('lothlorien') || id.includes('mirkwood')) {
    const elvishColors = [
      { from: 'from-blue-400', to: 'to-indigo-600' },      // Rivendell twilight
      { from: 'from-cyan-400', to: 'to-blue-600' },        // Elrond's wisdom
      { from: 'from-violet-400', to: 'to-purple-600' },    // Lothlórien magic
      { from: 'from-indigo-400', to: 'to-slate-600' },     // Grey Havens
    ]
    const hash = crypto.createHash('sha256').update(anonymousId).digest('hex')
    const colorIndex = Number.parseInt(hash.substring(0, 2), 16) % elvishColors.length
    return elvishColors[colorIndex]
  }
  
  // Dwarves - warm golds and forge fires
  if (id.includes('dwarf') || id.includes('erebor') || id.includes('moria') || id.includes('khazad')) {
    const dwarvenColors = [
      { from: 'from-amber-400', to: 'to-red-600' },        // Erebor treasure
      { from: 'from-orange-400', to: 'to-amber-600' },     // Forge fires
      { from: 'from-yellow-400', to: 'to-orange-600' },    // Mithril gleam
      { from: 'from-red-400', to: 'to-rose-600' },         // Moria depths
    ]
    const hash = crypto.createHash('sha256').update(anonymousId).digest('hex')
    const colorIndex = Number.parseInt(hash.substring(2, 4), 16) % dwarvenColors.length
    return dwarvenColors[colorIndex]
  }
  
  // Hobbits - earthy greens and nature
  if (id.includes('hobbit') || id.includes('shire') || id.includes('baggins') || id.includes('took')) {
    const hobbitColors = [
      { from: 'from-green-400', to: 'to-emerald-600' },    // Shire meadows  
      { from: 'from-emerald-400', to: 'to-teal-600' },     // Baggins garden
      { from: 'from-lime-400', to: 'to-green-600' },       // Old Forest
      { from: 'from-teal-400', to: 'to-cyan-600' },        // Brandywine River
    ]
    const hash = crypto.createHash('sha256').update(anonymousId).digest('hex')
    const colorIndex = Number.parseInt(hash.substring(4, 6), 16) % hobbitColors.length
    return hobbitColors[colorIndex]
  }
  
  // Rangers & Royalty - regal and noble colors
  if (id.includes('ranger') || id.includes('gondor') || id.includes('rohan') || id.includes('captain') || id.includes('prince')) {
    const royalColors = [
      { from: 'from-purple-400', to: 'to-pink-600' },      // Gondor royalty
      { from: 'from-rose-400', to: 'to-red-600' },         // Rohan banners
      { from: 'from-pink-400', to: 'to-rose-600' },        // Arwen's grace
      { from: 'from-slate-400', to: 'to-gray-600' },       // Ranger cloak
    ]
    const hash = crypto.createHash('sha256').update(anonymousId).digest('hex')
    const colorIndex = Number.parseInt(hash.substring(6, 8), 16) % royalColors.length
    return royalColors[colorIndex]
  }
  
  // Default - mixed epic colors for others
  const hash = crypto.createHash('sha256').update(anonymousId).digest('hex')
  const colorIndex = Number.parseInt(hash.substring(0, 2), 16) % 8
  
  const defaultColors = [
    { from: 'from-blue-400', to: 'to-purple-600' },       // Mystical
    { from: 'from-amber-400', to: 'to-orange-600' },      // Warm
    { from: 'from-green-400', to: 'to-teal-600' },        // Nature
    { from: 'from-rose-400', to: 'to-pink-600' },         // Noble
    { from: 'from-indigo-400', to: 'to-blue-600' },       // Deep
    { from: 'from-emerald-400', to: 'to-green-600' },     // Forest
    { from: 'from-violet-400', to: 'to-purple-600' },     // Magic
    { from: 'from-cyan-400', to: 'to-blue-600' },         // Sky
  ]
  
  return defaultColors[colorIndex]
}

// Export all arrays for potential use in UI
export { LOCATIONS, RACES, ARTIFACTS, ELEMENTS }
