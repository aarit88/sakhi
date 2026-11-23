/**
 * Diet tracking API services.
 *
 * Wraps the centralized apiClient for meal logging and history retrieval.
 *
 * Authentication: cookie-based (default, via apiClient credentials: "include")
 *   or Bearer token (via withBearerToken() helper).
 */

import { apiClient, withBearerToken, type RequestOptions } from "../api-client"

export interface DietLog {
  id: string
  mealName: string
  calories?: number | null
  notes?: string | null
  date: string
  userId: string
  createdAt: string
}

export interface CreateDietLog {
  mealName: string
  calories?: number | string
  notes?: string
  date?: string | Date
}

/** Log a new meal (POST /api/diet) */
export async function createDietLog(
  data: CreateDietLog,
  options: RequestOptions = {}
): Promise<DietLog> {
  const body = {
    mealName: data.mealName,
    calories: data.calories !== undefined ? Number(data.calories) : undefined,
    notes: data.notes,
    date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : (data.date || undefined),
  }
  return apiClient.post<DietLog>("/api/diet", body, options)
}

/** Get user's diet log history (GET /api/diet) */
export async function getDietLogs(
  options: RequestOptions = {}
): Promise<DietLog[]> {
  return apiClient.get<DietLog[]>("/api/diet", options)
}

/** Delete a diet log entry (DELETE /api/diet/:id) */
export async function deleteDietLog(
  id: string,
  options: RequestOptions = {}
): Promise<{ success: boolean }> {
  return apiClient.del<{ success: boolean }>(
    `/api/diet/${id}`,
    options
  )
}