/**
 * Random data generator for Iglu Ski tests
 */

/**
 * Available titles in the form
 */
export const AVAILABLE_TITLES = ['Dr', 'Miss', 'Mr', 'Mrs', 'Ms'];

/**
 * Common first names (random)
 */
const FIRST_NAMES = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Lisa', 'Robert', 'Mary',
  'Richard', 'Patricia', 'Charles', 'Jennifer', 'William', 'Linda', 'Joseph', 'Barbara',
  'Thomas', 'Susan', 'Joao', 'Maria', 'Antonio', 'Ana', 'Carlos', 'Rosa'
];

/**
 * Common last names (random)
 */
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Silva', 'Santos', 'Oliveira', 'Pereira', 'Gomes', 'Costa', 'Ferreira', 'Alves'
];

/**
 * Street address names (random)
 */
const STREET_NAMES = [
  'Oxford Street', 'Baker Street', 'Main Street', 'High Street', 'King Street', 'Queen Street',
  'Church Road', 'Park Lane', 'Regent Street', 'Strand', 'Bond Street', 'Piccadilly', 'Fleet Street'
];

/**
 * Available cities (with valid UK postcodes)
 */
const CITIES = [
  { city: 'London', postcode: 'SW1A 1AA' },
  { city: 'Manchester', postcode: 'M1 1AA' },
  { city: 'Birmingham', postcode: 'B4 6AL' },
  { city: 'Liverpool', postcode: 'L1 1AA' },
  { city: 'Leeds', postcode: 'LS1 1AA' },
  { city: 'Glasgow', postcode: 'G2 1BB' },
  { city: 'Edinburgh', postcode: 'EH8 8DX' },
  { city: 'Bristol', postcode: 'BS1 3AA' },
  { city: 'Cambridge', postcode: 'CB1 1AY' },
  { city: 'Oxford', postcode: 'OX1 1AA' }
];

/**
 * Interface for passenger data
 */
export interface PassengerData {
  title: string;
  firstName: string;
  lastName: string;
  day: string;
  month: string;
  year: string;
  postcode: string;
  address1: string;
  address2?: string;
  town: string;
  country: string;
  mobilePhone: string;
  email: string;
}

/**
 * Generates a random number between min and max (inclusive)
 */
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gets a random element from an array
 */
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generates a random first name
 */
export function generateFirstName(): string {
  return getRandomElement(FIRST_NAMES);
}

/**
 * Generates a random last name
 */
export function generateLastName(): string {
  return getRandomElement(LAST_NAMES);
}

/**
 * Generates a random valid title
 */
export function generateTitle(): string {
  return getRandomElement(AVAILABLE_TITLES);
}

/**
 * Generates a random date of birth (adult between 18 and 80 years old)
 * Returns { day, month, year }
 */
export function generateDateOfBirth(): { day: string; month: string; year: string } {
  const currentYear = new Date().getFullYear();
  const year = getRandomNumber(currentYear - 80, currentYear - 18);
  const month = String(getRandomNumber(1, 12)).padStart(2, '0');
  const day = String(getRandomNumber(1, 28)).padStart(2, '0'); // Use up to day 28 to avoid February issues

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const monthName = monthNames[parseInt(month) - 1];

  return {
    day: String(parseInt(day)),
    month: monthName,
    year: String(year)
  };
}

/**
 * Generates a valid UK postcode
 */
export function generatePostCode(): string {
  return getRandomElement(CITIES).postcode;
}

/**
 * Generates a valid address
 */
export function generateAddress(): { postcode: string; address1: string; town: string; country: string } {
  const city = getRandomElement(CITIES);
  const streetNumber = getRandomNumber(1, 999);
  const streetName = getRandomElement(STREET_NAMES);

  return {
    postcode: city.postcode,
    address1: `${streetNumber} ${streetName}`,
    town: city.city,
    country: 'United Kingdom'
  };
}

/**
 * Generates a valid UK mobile phone number
 * Format: +447911123456 (11 digits after +44)
 */
export function generateMobilePhone(): string {
  const prefix = '+447911'; // Valid UK fixed prefix
  const randomDigits = String(getRandomNumber(100000, 999999));
  return `${prefix}${randomDigits}`;
}

/**
 * Generates a phone number without country code (digits only)
 * Format: 7911123456
 */
export function generatePhoneNumber(): string {
  const prefix = '7911'; // Valid UK prefix without +44
  const randomDigits = String(getRandomNumber(100000, 999999));
  return `${prefix}${randomDigits}`;
}

/**
 * Generates a random phone country code
 * Returns the country name or code, depending on the expected format
 */
export function generatePhoneCountryCode(): string {
  const countries = ['+44', '+1', '+33', '+49'];
  return getRandomElement(countries);
}

/**
 * Generates a random number of adults (1-4)
 */
export function generateAdultsCount(): string {
  return String(getRandomNumber(1, 4));
}

/**
 * Generates a random number of children (0-2)
 */
export function generateChildrenCount(): string {
  return String(getRandomNumber(0, 2));
}

/**
 * Generates a unique and valid email
 */
export function generateEmail(): string {
  const randomId = Math.random().toString(36).substring(2, 8); // Generate random string
  const firstName = getRandomElement(FIRST_NAMES).toLowerCase();
  const domain = getRandomElement(['example.com', 'test.com', 'demo.co.uk', 'mail.co.uk']);
  return `${firstName}.${randomId}@${domain}`;
}

/**
 * Generates complete random passenger data
 */
export function generatePassengerData(includeOptionalFields = true): PassengerData {
  const dob = generateDateOfBirth();
  const address = generateAddress();
  const email = generateEmail();

  return {
    title: generateTitle(),
    firstName: generateFirstName(),
    lastName: generateLastName(),
    day: dob.day,
    month: dob.month,
    year: dob.year,
    postcode: address.postcode,
    address1: address.address1,
    address2: includeOptionalFields ? `Apartment ${getRandomNumber(1, 50)}` : undefined,
    town: address.town,
    country: address.country,
    mobilePhone: generateMobilePhone(),
    email: email
  };
}

/**
 * Generates multiple passengers
 */
export function generateMultiplePassengers(count: number, includeOptionalFields = true): PassengerData[] {
  return Array.from({ length: count }, () => generatePassengerData(includeOptionalFields));
}
