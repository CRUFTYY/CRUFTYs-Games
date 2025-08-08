import { User } from '../types';

const AUTHORIZED_EMAILS = [
  'foster.dylan2006@gmail.com',
  'valentingarbalena10@gmail.com',
  'e.sofiac06@gmail.com',
  'eliascabanillas2006@gmail.com',
  'micaelasf2007@gmail.com',
  'aylasdaiana06@gmail.com',
  'test@gmail.com',
];

const ADMIN_EMAIL = 'eliasmateoet24@gmail.com';

export const isEmailAuthorized = (email: string): boolean => {
  return AUTHORIZED_EMAILS.includes(email) || email === ADMIN_EMAIL;
};

export const isAdmin = (email: string): boolean => {
  return email === ADMIN_EMAIL;
};

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendVerificationCode = async (email: string): Promise<string> => {
  const code = generateVerificationCode();
  
  // Store code temporarily with expiration (10 minutes)
  const expirationTime = Date.now() + (10 * 60 * 1000); // 10 minutes from now
  const codeData = {
    code,
    expires: expirationTime,
    attempts: 0
  };
  sessionStorage.setItem(`verification_${email}`, JSON.stringify(codeData));
  
  // Para desarrollo/demo, simplemente logueamos el código
  console.log(`CÓDIGO DE VERIFICACIÓN para ${email}: ${code}`);
  
  return code;
};

export const verifyCode = (email: string, code: string): boolean => {
  const storedData = sessionStorage.getItem(`verification_${email}`);
  
  if (!storedData) {
    return false;
  }

  try {
    const { code: storedCode, expires, attempts } = JSON.parse(storedData);
    
    // Check if code has expired
    if (Date.now() > expires) {
      sessionStorage.removeItem(`verification_${email}`);
      return false;
    }

    // Check if too many attempts
    if (attempts >= 3) {
      sessionStorage.removeItem(`verification_${email}`);
      return false;
    }

    // Increment attempts
    const updatedData = {
      code: storedCode,
      expires,
      attempts: attempts + 1
    };
    sessionStorage.setItem(`verification_${email}`, JSON.stringify(updatedData));

    return storedCode === code;
  } catch (error) {
    console.error('Error verifying code:', error);
    return false;
  }
};

export const hasUserCompletedQuiz = (email: string): boolean => {
  const completedUsers = JSON.parse(localStorage.getItem('completedUsers') || '[]');
  return completedUsers.includes(email);
};

export const markUserAsCompleted = (email: string): void => {
  const completedUsers = JSON.parse(localStorage.getItem('completedUsers') || '[]');
  if (!completedUsers.includes(email)) {
    completedUsers.push(email);
    localStorage.setItem('completedUsers', JSON.stringify(completedUsers));
  }
};

export const saveUser = (user: User): void => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const existingIndex = users.findIndex((u: User) => u.email === user.email);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem('users', JSON.stringify(users));
};

export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem('users') || '[]');
};