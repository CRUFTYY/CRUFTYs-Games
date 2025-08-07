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
  const code = generateVerificationCode();
  
  // Store code temporarily with expiration (10 minutes)
  const expirationTime = Date.now() + (10 * 60 * 1000); // 10 minutes from now
  const codeData = {
    code,
    expires: expirationTime,
    attempts: 0
  };
  sessionStorage.setItem(`verification_${email}`, JSON.stringify(codeData));
  
  try {
    // Call Supabase Edge Function to send email
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/send-verification-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        code
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send verification email');
    }

    const result = await response.json();
    console.log('Verification email sent successfully:', result);
    
  } catch (error) {
    console.error('Error sending verification email:', error);
    // Don't throw error - fallback to showing code in console for development
    console.log(`DEVELOPMENT: Verification code for ${email}: ${code}`);
  }
  
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