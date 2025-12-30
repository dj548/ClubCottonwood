// Club Cottonwood Membership Types

export type MembershipStatus = 'Prospect' | 'Active' | 'Overdue' | 'Expired' | 'Lapsed';

export interface ClubMemberOrder {
  orderNumber: string;
  orderDate: string;
  isOriginalOrder: boolean;
}

export interface ClubMember {
  id: string;
  shopifyCustomerId: string;
  email: string;
  name: string;
  phone?: string;
  joinDate?: string;
  lastRenewalDate?: string;
  effectiveRenewalDueDate?: string;
  hasOverride: boolean;
  status: MembershipStatus;
  hasQuackTag: boolean;
  lastOrderNumber?: string;
  daysUntilRenewal?: number;
  notes?: string;
  orders?: ClubMemberOrder[];
}

export interface ClubStats {
  totalMembers: number;
  activeMembers: number;
  overdueMembers: number;
  prospectCount: number;
  expiringThisMonth: number;
  lastSyncAt?: string;
}

export interface ClubMemberListResponse {
  members: ClubMember[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UpdateClubMemberRequest {
  renewalOverrideDate?: string;
  clearOverride?: boolean;
  notes?: string;
}

export interface ClubEmailRequest {
  memberIds: string[];
  subject: string;
  htmlBody: string;
  textBody?: string;
}

export interface ClubEmailResponse {
  success: boolean;
  sentCount: number;
  failedCount: number;
  failedEmails?: string[];
}

export interface SyncResponse {
  success: boolean;
  newMembers: number;
  updatedMembers: number;
  totalOrders?: number;
  syncedAt: string;
}

export interface SyncStatusResponse {
  lastSyncAt?: string;
}
