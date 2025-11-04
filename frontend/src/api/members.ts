import client from './client';

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  optInSms: boolean;
  createdAt: string;
}

export interface CreateMemberData {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  optInSms?: boolean;
}

export interface MembersResponse {
  data: Member[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Get all members in a group with pagination
 */
export async function getMembers(
  groupId: string,
  options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}
): Promise<MembersResponse> {
  const params = new URLSearchParams();
  if (options.page) params.append('page', options.page.toString());
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.search) params.append('search', options.search);

  const response = await client.get(`/groups/${groupId}/members?${params.toString()}`);
  return response.data;
}

/**
 * Add a single member to a group
 */
export async function addMember(groupId: string, data: CreateMemberData): Promise<Member> {
  const response = await client.post(`/groups/${groupId}/members`, data);
  return response.data.data;
}

/**
 * Import members from CSV file
 */
export async function importMembers(
  groupId: string,
  file: File
): Promise<{
  imported: number;
  failed: number;
  failedDetails?: Array<{ member: any; error: string }>;
}> {
  const formData = new FormData();
  formData.append('file', file);

  // Note: Do NOT set Content-Type header - let axios set it with the boundary
  // Authorization header is automatically added by the client interceptor
  const response = await client.post(`/groups/${groupId}/members/import`, formData, {
    headers: {
      // Let axios auto-set Content-Type with multipart boundary
      // 'Content-Type': 'multipart/form-data' - DO NOT SET, let axios handle it
    },
  });

  return response.data.data;
}

/**
 * Update a member
 */
export async function updateMember(
  memberId: string,
  data: Partial<CreateMemberData>
): Promise<Member> {
  const response = await client.put(`/members/${memberId}`, data);
  return response.data.data;
}

/**
 * Remove a member from a group
 */
export async function removeMember(groupId: string, memberId: string): Promise<any> {
  const response = await client.delete(`/groups/${groupId}/members/${memberId}`);
  return response.data.data;
}
