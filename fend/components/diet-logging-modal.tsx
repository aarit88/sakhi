'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { use } from 'react';
import { apiClient } from '@/lib/api-client';
import { CreateDietLog, DietLog } from '@/lib/services/diet';

interface MealForm {
  mealName: string;
  calories?: number | string;
  notes?: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export function DietLoggingModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState<MealForm>({
    mealName: '',
    calories: undefined,
    notes: '',
    date: new Date().toISOString().split('T')[0],
    mealType: 'breakfast',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch user's diet logs
  const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLogsLoading(true);
        const data = await apiClient.get<DietLog[]>('/api/diet');
        setDietLogs(data);
      } catch (err) {
        setError('Failed to load diet logs');
        toast({
          title: 'Error',
          description: 'Failed to load diet logs. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLogsLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = {
        mealName: form.mealName.trim(),
        calories: form.calories !== undefined ? Number(form.calories) : undefined,
        notes: form.notes.trim(),
        date: form.date,
      };

      const data = await apiClient.post<DietLog>('/api/diet', formData);
      setSuccess(true);
      setForm({
        mealName: '',
        calories: undefined,
        notes: '',
        date: new Date().toISOString().split('T')[0],
        mealType: 'breakfast',
      });
      setDietLogs((prev) => [data, ...prev]);
      toast({
        title: 'Meal logged',
        description: `${data.mealName} logged successfully`,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to log meal');
      toast({
        title: 'Failed to log meal',
        description: err.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.del<{ success: boolean }>('/api/diet/' + id);
      setDietLogs((prev) => prev.filter((log) => log.id !== id));
      toast({
        title: 'Meal removed',
        description: 'Meal log deleted successfully',
      });
    } catch (err) {
      toast({
        title: 'Failed to delete meal',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  if (isOpen === false) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogHeader>
        <DialogTitle>Log a Meal</DialogTitle>
        <DialogCloseButton />
      </DialogHeader>
      <DialogContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading diet logs...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlInputID="meal-name" className="block text-sm font-medium text-gray-700">
                  Meal Name
                </Label>
                <Input
                  id="meal-name"
                  placeholder="e.g., Grilled Chicken Salad"
                  value={form.mealName}
                  onChange={(e) => setForm({ ...form, mealName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700">
                  Calories (optional)
                </Label>
                <Input
                  type="number"
                  value={form.calories !== undefined ? form.calories : ''}
                  onChange={(e) => setForm({ ...form, calories: e.target.value })}
                  placeholder="e.g., 450"
                />
              </div>
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700">
                Notes (optional)
                </Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g., Felt full, skipped dessert"
                  rows={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700">
                  Meal Type
                  </Label>
                <Select
                  value={form.mealType}
                  onValueChange={(value: 'breakfast' | 'lunch' | 'dinner' | 'snack') => setForm({ ...form, mealType: value })}
                >
                  <SelectTrigger>
                    <SelectValue className="flex items-center justify-between py-2 px-3 text-sm font-medium text-gray-900 bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                      {form.mealType}
                    </SelectValue>
                    <SelectContent className="space-y-1 pt-1"
                      >
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </SelectTrigger>
                </Select>
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700">
                  Date
                  </Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Logging...' : 'Log Meal'}
            </Button>
          </form>
        )}
      </DialogContent>
      <DialogFooter className="justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </Dialog>
  );
}