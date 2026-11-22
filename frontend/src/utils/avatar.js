// Accurate gender-based avatar picker for DYPSEM EduAssist
// Strictly maps boy -> /avatar-boy.jpg and girl -> /avatar-girl.jpg

// Common Indian & Marathi male names
const KNOWN_MALE_NAMES = new Set([
  'aarav', 'rahul', 'rohan', 'amit', 'rohit', 'aditya', 'nikhil', 'prathamesh',
  'sanket', 'swapnil', 'vishal', 'omkar', 'vaibhav', 'shubham', 'saurabh', 'sahil',
  'suraj', 'harsh', 'yash', 'aryan', 'atharva', 'ayush', 'kunal', 'mayur',
  'tanmay', 'chinmay', 'akshay', 'tejas', 'tushar', 'gaurav', 'chetan', 'ganesh',
  'mahesh', 'ramesh', 'suresh', 'dinesh', 'rajesh', 'nilesh', 'sandeep', 'sagar',
  'sachin', 'pravin', 'deepak', 'manoj', 'vijay', 'ajay', 'sanjay', 'vinay',
  'aniket', 'abhishek', 'anand', 'prasad', 'prakash', 'prashant', 'pritam', 'vikas',
  'vivek', 'sumit', 'krishna', 'rama', 'datta', 'shiva', 'virat', 'shreyas',
  'hardik', 'rishabh', 'ashwin', 'ishan', 'shubman', 'surya', 'samir', 'sameer',
  'soham', 'shantanu', 'siddharth', 'sudhir', 'sunil', 'anil', 'satish', 'umesh',
  'kamlesh', 'alok', 'atul', 'arun', 'ashok', 'avinash', 'bhushan', 'chaitanya',
  'dhruv', 'girish', 'hemant', 'jitendra', 'kiran', 'lalit', 'madan', 'mukesh',
  'narendra', 'om', 'pankaj', 'parag', 'pramod', 'raj', 'rajan', 'ravindra',
  'ravi', 'ritesh', 'ronit', 'samar', 'sarvesh', 'shivam', 'shrikant', 'srikant',
  'swapnesh', 'tarun', 'utkarsh', 'varun', 'vidyut', 'yatin', 'yogesh', 'verma',
  'patil', 'kulkarni', 'deshmukh', 'jadhav', 'pawar', 'sharma', 'gupta'
]);

// Common Indian & Marathi female names
const KNOWN_FEMALE_NAMES = new Set([
  'rajnandini', 'sakshi', 'madhura', 'priya', 'sneha', 'pooja', 'neha', 'kavya',
  'divya', 'ananya', 'shreya', 'riya', 'nisha', 'swati', 'pallavi', 'vaishali',
  'madhuri', 'nandini', 'sonal', 'rutuja', 'manasi', 'gauri', 'ketaki', 'ashwini',
  'supriya', 'meghana', 'shweta', 'sangita', 'aarti', 'mrunali', 'sayali',
  'prajakta', 'urmila', 'sujata', 'vaibhavi', 'tejal', 'vrushali', 'mayuri',
  'komal', 'archana', 'chetana', 'leena', 'smita', 'deepa', 'rekha', 'savita',
  'sunita', 'anita', 'babita', 'kavita', 'lalita', 'mamta', 'namita', 'puja',
  'radha', 'sita', 'usha', 'aishwarya', 'akshata', 'alka', 'amita', 'amruta',
  'anagha', 'anjali', 'ankita', 'aparna', 'apoorva', 'asavari', 'bhagyashree',
  'bhavana', 'chhaya', 'damini', 'dhanashree', 'durga', 'geeta', 'harshada',
  'hema', 'ishita', 'janhavi', 'jyoti', 'kalpana', 'kalyani', 'kanchan',
  'karuna', 'kasturi', 'kranti', 'madhavi', 'manjusha', 'meena', 'mithila',
  'mohini', 'monika', 'mrunmayee', 'mukta', 'nalini', 'neeta', 'nikita',
  'poonam', 'pranali', 'pranita', 'pratibha', 'pratiksha', 'preeti', 'prerana',
  'radhika', 'rajashree', 'rajashri', 'rashmi', 'renuka', 'rohini', 'ruchira',
  'rupali', 'rupa', 'sanika', 'sarita', 'seema', 'shailaja', 'sharmila',
  'sheetal', 'shilpa', 'shobha', 'shraddha', 'siddhi', 'snehal', 'sonali',
  'tanvi', 'trupti', 'ujjwala', 'vaidehi', 'vandana', 'varsha', 'vidya', 'vinaya'
]);

/**
 * Returns the avatar image URL based on user gender or name
 * @param {object} user - { gender, full_name, role, avatar }
 * @returns {string} - '/avatar-boy.jpg' or '/avatar-girl.jpg'
 */
export function getAvatarUrl(user) {
  if (!user) return '/avatar-boy.jpg';

  // 1. Explicit avatar property
  if (user.avatar === '/avatar-girl.jpg' || user.avatar_url?.includes('girl')) {
    return '/avatar-girl.jpg';
  }
  if (user.avatar === '/avatar-boy.jpg' || user.avatar_url?.includes('boy')) {
    return '/avatar-boy.jpg';
  }

  // 2. Explicit gender field
  const g = (user.gender || '').toLowerCase().trim();
  if (g === 'female' || g === 'f' || g === 'girl' || g === 'woman') {
    return '/avatar-girl.jpg';
  }
  if (g === 'male' || g === 'm' || g === 'boy' || g === 'man') {
    return '/avatar-boy.jpg';
  }

  // 3. Detect from first name
  const rawName = (user.full_name || user.name || user.email || '').trim();
  const firstName = rawName.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');

  if (!firstName) return '/avatar-boy.jpg';

  // Check known male names first
  if (KNOWN_MALE_NAMES.has(firstName)) {
    return '/avatar-boy.jpg';
  }

  // Check known female names
  if (KNOWN_FEMALE_NAMES.has(firstName)) {
    return '/avatar-girl.jpg';
  }

  // Check female prefixes
  for (const fname of KNOWN_FEMALE_NAMES) {
    if (firstName.startsWith(fname)) {
      return '/avatar-girl.jpg';
    }
  }

  // Check common female Marathi suffixes (only multi-char suffixes that are distinctly female)
  const femaleSuffixes = ['shree', 'shri', 'mati', 'vati', 'ika', 'ini', 'ali', 'ani', 'ana', 'ita', 'uta', 'uja'];
  for (const suffix of femaleSuffixes) {
    if (firstName.endsWith(suffix) && !KNOWN_MALE_NAMES.has(firstName)) {
      return '/avatar-girl.jpg';
    }
  }

  // Default to boy avatar
  return '/avatar-boy.jpg';
}

/**
 * Returns initials from full name
 */
export function getInitials(user) {
  if (!user?.full_name) return 'U';
  return user.full_name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
