// Smart gender-based avatar picker for DYPSEM EduAssist
// Uses name + gender field to pick the right avatar

// Common Marathi/Indian female name endings and names
const FEMALE_NAMES = [
  'a', 'i', 'ee', 'ta', 'na', 'ia', 'ya', 'ika', 'ini', 'ani', 'ati',
  'anjali', 'priya', 'sneha', 'pooja', 'neha', 'kavya', 'divya', 'ananya',
  'shreya', 'riya', 'nisha', 'swati', 'pallavi', 'vaishali', 'madhuri',
  'rajnandini', 'nandini', 'sakshi', 'sonal', 'rutuja', 'manasi', 'gauri',
  'ketaki', 'ashwini', 'supriya', 'meghana', 'shweta', 'sangita', 'aarti',
  'mrunali', 'sayali', 'prajakta', 'urmila', 'sujata', 'vaibhavi', 'tejal',
  'vrushali', 'mayuri', 'komal', 'archana', 'chetana', 'leena', 'smita',
  'deepa', 'rekha', 'savita', 'sunita', 'anita', 'babita', 'kavita',
  'lalita', 'mamta', 'namita', 'puja', 'radha', 'sita', 'usha'
];

/**
 * Returns the avatar image URL based on user gender or name
 * @param {object} user - { gender, full_name, role }
 * @returns {string} - URL to avatar image
 */
export function getAvatarUrl(user) {
  if (!user) return '/avatar-boy.jpg';
  
  // 1. Explicit gender field
  if (user.gender === 'female' || user.gender === 'F' || user.gender === 'girl') {
    return '/avatar-girl.jpg';
  }
  if (user.gender === 'male' || user.gender === 'M' || user.gender === 'boy') {
    return '/avatar-boy.jpg';
  }

  // 2. Detect from first name
  const firstName = (user.full_name || user.name || '').trim().split(' ')[0].toLowerCase();
  
  if (!firstName) return '/avatar-boy.jpg';

  // Check exact female name matches
  for (const fname of FEMALE_NAMES) {
    if (firstName === fname || firstName.startsWith(fname)) {
      return '/avatar-girl.jpg';
    }
  }

  // Check common female name endings (names ending in 'a', 'i', 'ya' are usually female in Marathi)
  if (firstName.endsWith('a') || firstName.endsWith('i') || 
      firstName.endsWith('ya') || firstName.endsWith('ta') ||
      firstName.endsWith('na') || firstName.endsWith('ni') ||
      firstName.endsWith('ini') || firstName.endsWith('ika')) {
    return '/avatar-girl.jpg';
  }

  return '/avatar-boy.jpg';
}

/**
 * Returns initials from full name
 */
export function getInitials(user) {
  if (!user?.full_name) return 'U';
  return user.full_name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
