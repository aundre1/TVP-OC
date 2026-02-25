import apiClient from './client';

export const marketingApi = {
  sendEmail: (data: { subject: string; htmlBody?: string; textBody?: string; segment?: string }) =>
    apiClient.post('/admin/marketing/email', data).then(r => r.data),
  sendSms: (data: { message: string; segment?: string }) =>
    apiClient.post('/admin/marketing/sms', data).then(r => r.data),
  history: () => apiClient.get('/admin/marketing/history').then(r => r.data),
};
