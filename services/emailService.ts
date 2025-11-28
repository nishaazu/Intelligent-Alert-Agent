import { EmailLogEntry } from '../types';

// SMTP Configuration Constants (Visual reference only in frontend)
export const SMTP_CONFIG = {
  HOST: 'smtp.gmail.com',
  PORT: '587',
  USER: 'system@hsm.com.my',
  SECURE: 'tls',
  FROM_NAME: 'Halal Audit Dashboard - Hotel Seri Malaysia'
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const simulateSmtpSend = async (
  toEmail: string, 
  subject: string, 
  onLog: (log: EmailLogEntry) => void
): Promise<boolean> => {
  const generateId = () => Math.random().toString(36).substr(2, 9);
  const now = () => new Date().toISOString();

  try {
    // Step 1: Connection
    onLog({
      id: generateId(),
      timestamp: now(),
      status: 'CONNECTING',
      details: `Connecting to ${SMTP_CONFIG.HOST}:${SMTP_CONFIG.PORT}...`
    });
    await delay(800);

    // Step 2: Handshake/Auth
    onLog({
      id: generateId(),
      timestamp: now(),
      status: 'AUTHENTICATING',
      details: `Performing TLS handshake. Authenticating as ${SMTP_CONFIG.USER}...`
    });
    await delay(1200);

    // Step 3: Sending
    onLog({
      id: generateId(),
      timestamp: now(),
      status: 'SENDING',
      details: `Sending payload to <${toEmail}>...`,
      recipient: toEmail
    });
    await delay(1000);

    // Step 4: Success
    onLog({
      id: generateId(),
      timestamp: now(),
      status: 'SENT',
      details: `250 2.0.0 OK ${generateId()} - Message accepted for delivery`,
      recipient: toEmail
    });
    
    return true;
  } catch (error) {
    onLog({
      id: generateId(),
      timestamp: now(),
      status: 'FAILED',
      details: `Connection timeout or Auth failed.`,
      recipient: toEmail
    });
    return false;
  }
};