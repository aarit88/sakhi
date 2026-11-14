'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

function createHealthHook<T>(endpoint: string) {
  return function useHealthHook() {
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (startDate?: string, endDate?: string) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const url = params.toString() ? `${endpoint}?${params}` : endpoint;
        const result = await apiClient.get(url);

        if (result.success) {
          setData(result.logs || result.data || []);
          setError(null);
        } else {
          setError(result.message || result.error || 'Failed to fetch data');
        }
      } catch (err: any) {
        setError(err.message || 'Network error occurred');
      } finally {
        setLoading(false);
      }
    }, []);

    const addData = async (payload: any) => {
      try {
        const result = await apiClient.post(endpoint, payload);
        if (result.success) {
          await fetchData();
          return result.log || result.data;
        } else {
          throw new Error(result.message || result.error);
        }
      } catch (err: any) {
        setError(err.message || 'Add data failed');
        throw err;
      }
    };

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    return { data, loading, error, fetchData, addData };
  };
}

export const useMoodData = createHealthHook<any>('/api/health/mood');
export const useSleepData = createHealthHook<any>('/api/health/sleep');
export const useHydrationData = createHealthHook<any>('/api/health/hydration');
export const useActivityData = createHealthHook<any>('/api/health/activity');
export const useSymptomData = createHealthHook<any>('/api/health/symptoms');
export const useCycleData = createHealthHook<any>('/api/health/cycle');

export function useHealthSummary() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiClient.get('/api/health');
      if (result.success) {
        const records = result.records || {};
        const sleeps = records.sleeps || [];
        const hydrations = records.hydrations || [];
        const activities = records.activities || [];
        const avgSleep = sleeps.length
          ? (sleeps.slice(0, 14).reduce((a: number, s: any) => a + s.hours, 0) / Math.min(sleeps.length, 14)).toFixed(1)
          : '0';
        const avgHydration = hydrations.length
          ? Math.round(
              (hydrations.slice(0, 14).reduce((a: number, h: any) => a + Number(h.intake || 0), 0) /
                Math.min(hydrations.length, 14)) *
                1000
            ).toString()
          : '0';
        const avgSteps = activities.length
          ? Math.round(activities.slice(0, 14).reduce((a: number, ac: any) => a + Number(ac.steps || 0), 0) / Math.min(activities.length, 14))
          : 0;

        setData({
          ...result,
          currentCycle: result.cycleInfo,
          summary: { avgSleep, avgHydration, avgSteps },
          mood: records.moods || [],
          sleep: sleeps,
          hydration: hydrations,
          activity: activities,
          symptoms: records.symptoms || [],
          periods: records.periods || [],
          bodyMaps: records.bodyMaps || [],
          reports: records.reports || [],
        });
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch health summary');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data, loading, error, fetchSummary };
}
