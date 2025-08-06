import { User } from '../types';

const AUTHORIZED_EMAILS = [
  'foster.dylan2006@gmail.com',
  'valentingarbalena10@gmail.com',
  'e.sofiac06@gmail.com',
  'eliascabanillas2006@gmail.com',
  'micaelasf2007@gmail.com',
  'aylasdaiana06@gmail.com',
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
  // Simulate sending email - in production, use a real email service
  const code = generateVerificationCode();
  
  // Store code temporarily (in production, use secure storage)
  sessionStorage.setItem(`verification_${email}`, code);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`Verification code for ${email}: ${code}`);
  return code;
};

export const verifyCode = (email: string, code: string): boolean => {
  const storedCode = sessionStorage.getItem(`verification_${email}`);
  return storedCode === code;
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