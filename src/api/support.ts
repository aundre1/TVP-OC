import apiClient from './client';

export const supportApi = {
  createTicket: (data: { category: string; subject: string; message: string; priority?: string }) =>
    apiClient.post('/support/tickets', data).then(r => r.data),
  myTickets: () => apiClient.get('/support/tickets').then(r => r.data),
  adminList: (params?: { category?: string; status?: string; assignee?: string }) =>
    apiClient.get('/admin/support/tickets', { params }).then(r => r.data),
  adminUpdate: (id: string, data: { status?: string; admin_response?: string; assignee?: string }) =>
    apiClient.patch(`/admin/support/tickets/${id}`, data).then(r => r.data),
};
