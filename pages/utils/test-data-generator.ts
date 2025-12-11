/**
 * Gerador de dados aleatórios para testes do Iglu Ski
 */

/**
 * Títulos disponíveis no formulário
 */
export const AVAILABLE_TITLES = ['Dr', 'Lady', 'Lord', 'Mast', 'Miss', 'Mr', 'Mrs', 'Ms', 'Professor', 'Rev', 'Rt Revd', 'Sir', 'Other'];

/**
 * Primeiros nomes comuns (aleatórios)
 */
const FIRST_NAMES = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Lisa', 'Robert', 'Mary',
  'Richard', 'Patricia', 'Charles', 'Jennifer', 'William', 'Linda', 'Joseph', 'Barbara',
  'Thomas', 'Susan', 'Joao', 'Maria', 'Antonio', 'Ana', 'Carlos', 'Rosa'
];

/**
 * Apelidos comuns (aleatórios)
 */
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Silva', 'Santos', 'Oliveira', 'Pereira', 'Gomes', 'Costa', 'Ferreira', 'Alves'
];

/**
 * Endereços tipo rua (aleatórios)
 */
const STREET_NAMES = [
  'Oxford Street', 'Baker Street', 'Main Street', 'High Street', 'King Street', 'Queen Street',
  'Church Road', 'Park Lane', 'Regent Street', 'Strand', 'Bond Street', 'Piccadilly', 'Fleet Street'
];

/**
 * Cidades disponíveis (com POST CODE válidos do Reino Unido)
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
 * Interface para dados de passageiro
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
 * Gera um número aleatório entre min e max (inclusivo)
 */
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gera um elemento aleatório de um array
 */
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Gera um primeiro nome aleatório
 */
export function generateFirstName(): string {
  return getRandomElement(FIRST_NAMES);
}

/**
 * Gera um apelido aleatório
 */
export function generateLastName(): string {
  return getRandomElement(LAST_NAMES);
}

/**
 * Gera um título aleatório válido
 */
export function generateTitle(): string {
  return getRandomElement(AVAILABLE_TITLES);
}

/**
 * Gera uma data de nascimento aleatória (adulto entre 18 e 80 anos)
 * Retorna { day, month, year }
 */
export function generateDateOfBirth(): { day: string; month: string; year: string } {
  const currentYear = new Date().getFullYear();
  const year = getRandomNumber(currentYear - 80, currentYear - 18);
  const month = String(getRandomNumber(1, 12)).padStart(2, '0');
  const day = String(getRandomNumber(1, 28)).padStart(2, '0'); // Usar até dia 28 para evitar problemas com fevereiro

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const monthName = monthNames[parseInt(month) - 1];

  return {
    day: String(parseInt(day)),
    month: monthName,
    year: String(year)
  };
}

/**
 * Gera um POST CODE válido do Reino Unido
 */
export function generatePostCode(): string {
  return getRandomElement(CITIES).postcode;
}

/**
 * Gera um endereço válido
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
 * Gera um número de telemóvel válido do Reino Unido
 * Formato: +447911123456 (11 dígitos após +44)
 */
export function generateMobilePhone(): string {
  const prefix = '+447911'; // Número fixo válido do UK
  const randomDigits = String(getRandomNumber(100000, 999999));
  return `${prefix}${randomDigits}`;
}

/**
 * Gera um email único e válido
 */
export function generateEmail(): string {
  const randomId = Math.random().toString(36).substring(2, 8); // Gera string aleatória
  const firstName = getRandomElement(FIRST_NAMES).toLowerCase();
  const domain = getRandomElement(['example.com', 'test.com', 'demo.co.uk', 'mail.co.uk']);
  return `${firstName}.${randomId}@${domain}`;
}

/**
 * Gera dados completos de um passageiro aleatório
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
 * Gera múltiplos passageiros
 */
export function generateMultiplePassengers(count: number, includeOptionalFields = true): PassengerData[] {
  return Array.from({ length: count }, () => generatePassengerData(includeOptionalFields));
}
