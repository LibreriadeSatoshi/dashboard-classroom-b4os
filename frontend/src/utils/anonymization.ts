/**
 * Lord of the Rings Themed Anonymous Username Generator
 * 
 * Generates consistent anonymous IDs based on GitHub usernames
 * using Middle-earth locations, characters, and elements.
 */

import crypto from 'crypto'

// 🏔️ Locations from Middle-earth
const LOCATIONS = [
  'Rivendell', 'Gondor', 'Rohan', 'Shire', 'Moria', 'Isengard',
  'Lothlorien', 'Edoras', 'MinasTirith', 'Helm', 'Fangorn', 'Dale',
  'Erebor', 'Esgaroth', 'Bree', 'Weathertop', 'Osgiliath', 'Dol',
  'Mirkwood', 'Dunharrow', 'Pelennor', 'Cair', 'Barad', 'Orthanc'
]

// ⚔️ Races and titles from Middle-earth
const RACES = [
  'Hobbit', 'Elf', 'Dwarf', 'Ranger', 'Wizard', 'King',
  'Lord', 'Knight', 'Guardian', 'Rider', 'Warrior', 'Mage',
  'Scout', 'Archer', 'Smith', 'Bard', 'Healer', 'Warden',
  'Captain', 'Prince', 'Duke', 'Earl', 'Baron', 'Steward'
]

// 🗡️ Weapons and artifacts
const ARTIFACTS = [
  'Sting', 'Anduril', 'Glamdring', 'Orcrist', 'Durin', 'Aeglos',
  'Grond', 'Palantir', 'Ring', 'Crown', 'Shield', 'Bow',
  'Staff', 'Cloak', 'Horn', 'Gem', 'Stone', 'Crystal',
  'Blade', 'Axe', 'Spear', 'Arrow', 'Torch', 'Key'
]

// 🌟 Elements and nature
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
  const raceIndex = parseInt(hash.substring(0, 2), 16) % RACES.length
  const locationIndex = parseInt(hash.substring(2, 4), 16) % LOCATIONS.length
  const elementIndex = parseInt(hash.substring(4, 6), 16) % ELEMENTS.length
  
  // Generate number and letter suffix
  const number = (parseInt(hash.substring(6, 8), 16) % 99) + 1
  const letterIndex = parseInt(hash.substring(8, 10), 16) % 26
  const letter = String.fromCharCode(65 + letterIndex) // A-Z

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
  const hash = crypto.createHash('sha256').update(anonymousId).digest('hex')
  const colorIndex = parseInt(hash.substring(0, 2), 16) % 12
  
  const colors = [
    { from: 'from-blue-500', to: 'to-purple-600' },      // Elven magic
    { from: 'from-amber-500', to: 'to-orange-600' },     // Dwarven forge
    { from: 'from-green-500', to: 'to-emerald-600' },    // Shire nature
    { from: 'from-red-500', to: 'to-pink-600' },         // Gondor banners
    { from: 'from-indigo-500', to: 'to-blue-600' },      // Rivendell waters
    { from: 'from-purple-500', to: 'to-violet-600' },    // Wizard robes
    { from: 'from-teal-500', to: 'to-cyan-600' },        // Rohan plains
    { from: 'from-rose-500', to: 'to-red-600' },         // Moria fires
    { from: 'from-slate-500', to: 'to-gray-600' },       // Isengard steel
    { from: 'from-yellow-500', to: 'to-amber-600' },     // Golden halls
    { from: 'from-lime-500', to: 'to-green-600' },       // Fangorn forest
    { from: 'from-sky-500', to: 'to-blue-600' },         // Weathertop skies
  ]
  
  return colors[colorIndex]
}

// Export all arrays for potential use in UI
export { LOCATIONS, RACES, ARTIFACTS, ELEMENTS }
