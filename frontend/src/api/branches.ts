import client from './client';
import { Branch } from '../stores/branchStore';

export interface CreateBranchInput {
  name: string;
  address?: string;
  phone?: string;
  description?: string;
}

export interface UpdateBranchInput {
  name?: string;
  address?: string;
  phone?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Get all branches for a church
 */
export async function getBranches(churchId: string): Promise<Branch[]> {
  const response = await client.get(`/branches/churches/${churchId}/branches`);
  return response.data.data;
}

/**
 * Create a new branch
 */
export async function createBranch(
  churchId: string,
  data: CreateBranchInput
): Promise<Branch> {
  const response = await client.post(`/branches/churches/${churchId}/branches`, data);
  return response.data.data;
}

/**
 * Update an existing branch
 */
export async function updateBranch(
  branchId: string,
  data: UpdateBranchInput
): Promise<Branch> {
  const response = await client.put(`/branches/branches/${branchId}`, data);
  return response.data.data;
}

/**
 * Delete a branch
 */
export async function deleteBranch(
  branchId: string
): Promise<{
  success: boolean;
  groupsDeleted: number;
  membersDeleted: number;
}> {
  const response = await client.delete(`/branches/branches/${branchId}`);
  return response.data.data;
}
