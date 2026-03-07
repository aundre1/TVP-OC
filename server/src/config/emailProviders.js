// ===========================================
// THE VIDEO POOL - Email Provider Configuration
// ===========================================

export const EMAIL_PROVIDERS = {
  resend: {
    name: 'Resend',
    dailyLimit: 500,
    envKey: 'RESEND_API_KEY',
    priority: 1,
  },
  brevo: {
    name: 'Brevo',
    dailyLimit: 300,
    envKey: 'BREVO_API_KEY',
    priority: 2,
  },
  mailjet: {
    name: 'Mailjet',
    dailyLimit: 200,
    envKeys: ['MAILJET_API_KEY', 'MAILJET_SECRET_KEY'],
    priority: 3,
  },
  sendgrid: {
    name: 'SendGrid',
    dailyLimit: 100,
    envKey: 'SENDGRID_API_KEY',
    priority: 4,
  },
  elasticemail: {
    name: 'Elastic Email',
    dailyLimit: 100,
    envKey: 'ELASTICEMAIL_API_KEY',
    priority: 5,
  },
  direct: {
    name: 'Direct SMTP',
    dailyLimit: 50,
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      user: 'info@thevideopool.com',
    },
    envKey: 'SUPPORT_EMAIL_PASSWORD',
    priority: 6,
  },
};

export const TOTAL_DAILY_CAPACITY = Object.values(EMAIL_PROVIDERS)
  .reduce((sum, p) => sum + p.dailyLimit, 0); // 750

export const SENDER_EMAIL = 'info@thevideopool.com';
export const SENDER_NAME = 'The Video Pool';

/**
 * Get list of configured (available) providers sorted by priority
 */
export function getAvailableProviders() {
  return Object.entries(EMAIL_PROVIDERS)
    .filter(([key, config]) => {
      if (config.envKeys) {
        return config.envKeys.every(k => !!process.env[k]);
      }
      return !!process.env[config.envKey];
    })
    .sort((a, b) => a[1].priority - b[1].priority)
    .map(([key, config]) => ({ key, ...config }));
}

/**
 * Get provider allocation for a daily batch
 * Returns array of { provider, count } sorted by priority
 */
export function getDailyAllocation() {
  const available = getAvailableProviders();
  return available.map(p => ({
    provider: p.key,
    name: p.name,
    count: p.dailyLimit,
  }));
}
