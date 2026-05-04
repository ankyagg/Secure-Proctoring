export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
export const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map(email => email.trim())
  .filter(Boolean);

export const getAdminEmails = () => ADMIN_EMAILS;
export const isEmailAdmin = (email: string) => ADMIN_EMAILS.includes(email);
