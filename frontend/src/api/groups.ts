import client from './client';
import { Group } from '../stores/groupStore';

export interface CreateGroupData {
  name: string;
  description?: string;
  welcomeMessageEnabled?: boolean;
  welcomeMessageText?: string;
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
  welcomeMessageEnabled?: boolean;
  welcomeMessageText?: string;
}

/**
 * Get all groups for a branch
 */
export async function getGroups(branchId: string): Promise<Group[]> {
  const response = await client.get(`/branches/${branchId}/groups`);
  return response.data.data;
}

/**
 * Create a new group
 */
export async function createGroup(
  branchId: string,
  data: CreateGroupData
): Promise<Group> {
  const response = await client.post(`/branches/${branchId}/groups`, data);
  return response.data.data;
}

/**
 * Update a group
 */
export async function updateGroup(groupId: string, data: UpdateGroupData): Promise<Group> {
  const response = await client.put(`/groups/${groupId}`, data);
  return response.data.data;
}

/**
 * Delete a group
 */
export async function deleteGroup(groupId: string): Promise<any> {
  const response = await client.delete(`/groups/${groupId}`);
  return response.data.data;
}
