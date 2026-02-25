import apiClient from './client';

export const couponsApi = {
  list: () => apiClient.get('/admin/coupons').then(r => r.data),
  create: (data: { code: string; type: string; value: number; maxUses?: number; expiresAt?: string; applicablePlans?: string[] }) =>
    apiClient.post('/admin/coupons', data).then(r => r.data),
  remove: (id: string) => apiClient.delete(`/admin/coupons/${id}`).then(r => r.data),
  validate: (code: string) => apiClient.post('/coupons/validate', { code }).then(r => r.data),
  apply: (code: string, planId: string) => apiClient.post('/coupons/apply', { code, planId }).then(r => r.data),
};
