import { apiClient } from './client';
import type {
  ClubMember,
  ClubStats,
  ClubMemberListResponse,
  UpdateClubMemberRequest,
  ClubEmailRequest,
  ClubEmailResponse,
  SyncResponse,
  SyncStatusResponse,
  MembershipStatus,
} from '../types/clubCottonwood';

export interface GetMembersParams {
  status?: MembershipStatus;
  search?: string;
  hasQuackTag?: boolean;
  page?: number;
  pageSize?: number;
}

export const clubCottonwoodApi = {
  // Get membership statistics
  getStats: async (): Promise<ClubStats> => {
    const response = await apiClient.get('/admin/club-cottonwood/stats');
    return response.data;
  },

  // Get renewal forecast - past 3 months + next 12 months with renewed/outstanding split
  getRenewalForecast: async (): Promise<{ month: string; monthShort: string; total: number; renewed: number; outstanding: number; isPast: boolean; isCurrent: boolean }[]> => {
    const response = await apiClient.get('/admin/club-cottonwood/renewal-forecast');
    return response.data;
  },

  // Get list of members with filtering and pagination
  getMembers: async (params: GetMembersParams = {}): Promise<ClubMemberListResponse> => {
    const response = await apiClient.get('/admin/club-cottonwood/members', { params });
    return response.data;
  },

  // Get a single member
  getMember: async (id: string): Promise<ClubMember> => {
    const response = await apiClient.get(`/admin/club-cottonwood/members/${id}`);
    return response.data;
  },

  // Update a member
  updateMember: async (id: string, data: UpdateClubMemberRequest): Promise<ClubMember> => {
    const response = await apiClient.put(`/admin/club-cottonwood/members/${id}`, data);
    return response.data;
  },

  // Add Quack tag to customer
  addTag: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/admin/club-cottonwood/members/${id}/tag`);
    return response.data;
  },

  // Remove Quack tag from customer
  removeTag: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/admin/club-cottonwood/members/${id}/tag`);
    return response.data;
  },

  // Sync members from Shopify (longer timeout for large datasets)
  sync: async (full: boolean = false): Promise<SyncResponse> => {
    const response = await apiClient.post('/admin/club-cottonwood/sync', {}, {
      params: { full },
      timeout: 300000, // 5 minute timeout for sync
    });
    return response.data;
  },

  // Get sync status
  getSyncStatus: async (): Promise<SyncStatusResponse> => {
    const response = await apiClient.get('/admin/club-cottonwood/sync/status');
    return response.data;
  },

  // Send email to selected members
  sendEmail: async (data: ClubEmailRequest): Promise<ClubEmailResponse> => {
    const response = await apiClient.post('/admin/club-cottonwood/email', data);
    return response.data;
  },

  // Get available customer tags from Shopify
  getTags: async (): Promise<{ name: string; count: number }[]> => {
    const response = await apiClient.get('/admin/club-cottonwood/tags');
    return response.data;
  },

  // Get customers by tag
  getCustomersByTag: async (tag: string): Promise<any[]> => {
    const response = await apiClient.get('/admin/club-cottonwood/customers-by-tag', {
      params: { tag },
    });
    return response.data;
  },
};
