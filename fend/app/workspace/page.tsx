'use client';

import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  BellRing,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Circle,
  Clock,
  Mail,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CalendarEventItem {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}

interface TaskListItem {
  id: string;
  title: string;
}

interface TaskItem {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: 'needsAction' | 'completed';
}

interface GmailMessageItem {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

interface ReminderSettingsState {
  enabled: boolean;
  recipientEmail: string;
  cycleReminderEnabled: boolean;
  cycleLeadDays: number;
  doctorReminderEnabled: boolean;
  doctorLeadHours: number;
  calendarKeywords: string;
}

interface DetectedDoctorVisit {
  eventId: string;
  summary: string;
  location: string | null;
  description: string | null;
  startRaw: string;
  hoursUntil: number;
  matchedKeywords: string[];
  withinLeadWindow: boolean;
  alreadySent: boolean;
  reminderKey: string;
}

interface DueReminderDraft {
  reminderKey: string;
  type: 'cycle' | 'doctor_visit';
  recipientEmail: string;
  subject: string;
  body: string;
  targetDate: string;
  sourceLabel: string;
  alreadySent: boolean;
  withinWindow: boolean;
}

interface ReminderLogRow {
  id: number;
  reminderType: string;
  recipientEmail: string;
  subject: string;
  targetDate: string;
  status: string;
  sentAt: string;
}

interface PendingConfirmation {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => Promise<void>;
}

function GoogleSignInMaterialButton({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="gsi-material-button inline-flex items-center gap-3 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-60"
    >
      <div className="gsi-material-button-icon h-5 w-5 shrink-0">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="block h-5 w-5">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
          <path fill="none" d="M0 0h48v48H0z" />
        </svg>
      </div>
      <span className="gsi-material-button-contents">
        {loading ? 'Connecting Google Workspace...' : 'Sign in with Google'}
      </span>
    </button>
  );
}

export default function WorkspacePage() {
  const {
    user,
    isAuthenticated,
    workspaceAccessToken,
    workspaceUserEmail,
    connectGoogleWorkspace,
    clearWorkspaceToken,
  } = useAuth();

  const [connecting, setConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'reminders' | 'calendar' | 'tasks' | 'gmail'>('reminders');
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirmation | null>(null);
  const [executingConfirm, setExecutingConfirm] = useState(false);

  // Automated Reminders state
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [savingRules, setSavingRules] = useState(false);
  const [cycleSummary, setCycleSummary] = useState<{
    day: number;
    phase: string;
    nextPeriod: string;
    cycleLength: number;
    daysUntilNextPeriod: number | null;
    predictionNote: string;
  } | null>(null);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettingsState>({
    enabled: true,
    recipientEmail: '',
    cycleReminderEnabled: true,
    cycleLeadDays: 3,
    doctorReminderEnabled: true,
    doctorLeadHours: 48,
    calendarKeywords:
      'doctor,gynecologist,ob-gyn,obgyn,clinic,hospital,checkup,ultrasound,blood test,lab,sakhi,consultation,appointment',
  });
  const [detectedVisits, setDetectedVisits] = useState<DetectedDoctorVisit[]>([]);
  const [dueReminders, setDueReminders] = useState<DueReminderDraft[]>([]);
  const [selectedReminderKeys, setSelectedReminderKeys] = useState<Record<string, boolean>>({});
  const [reminderHistory, setReminderHistory] = useState<ReminderLogRow[]>([]);

  // Calendar state
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [loadingCal, setLoadingCal] = useState(false);
  const [eventTitle, setEventTitle] = useState('OB-GYN Consultation & Cycle Review');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDate, setEventDate] = useState(() => {
    const d = new Date(Date.now() + 1 * 24 * 3600 * 1000);
    return d.toISOString().slice(0, 10);
  });
  const [eventTime, setEventTime] = useState('10:30');
  const [eventNotes, setEventNotes] = useState('Bring recent SAKHI cycle and lab report summary.');

  // Tasks state
  const [taskLists, setTaskLists] = useState<TaskListItem[]>([]);
  const [activeListId, setActiveListId] = useState<string>('@default');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  // Gmail state
  const [messages, setMessages] = useState<GmailMessageItem[]>([]);
  const [loadingGmail, setLoadingGmail] = useState(false);
  const [gmailQuery, setGmailQuery] = useState('');
  const [mailTo, setMailTo] = useState('');
  const [mailSubject, setMailSubject] = useState('SAKHI Health Summary / Appointment Request');
  const [mailBody, setMailBody] = useState(
    'Hello,\n\nSharing my appointment / health follow-up note from SAKHI.\n\nBest regards,'
  );

  const authHeaders = useCallback(
    (token: string) => ({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    []
  );

  const loadReminders = useCallback(async (token: string | null) => {
    setLoadingReminders(true);
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch('/api/workspace/reminders', { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not evaluate reminders');

      if (data.settings) {
        setReminderSettings({
          enabled: Boolean(data.settings.enabled),
          recipientEmail: data.settings.recipientEmail || data.gmailEmail || '',
          cycleReminderEnabled: Boolean(data.settings.cycleReminderEnabled),
          cycleLeadDays: Number(data.settings.cycleLeadDays) || 3,
          doctorReminderEnabled: Boolean(data.settings.doctorReminderEnabled),
          doctorLeadHours: Number(data.settings.doctorLeadHours) || 48,
          calendarKeywords: data.settings.calendarKeywords || '',
        });
      }
      setCycleSummary(data.cycleInfo || null);
      setDetectedVisits(data.detectedDoctorVisits || []);
      const drafts: DueReminderDraft[] = data.dueReminders || [];
      setDueReminders(drafts);
      setReminderHistory(data.history || []);

      // Pre-select due unsent reminders within configured window
      const initialSelection: Record<string, boolean> = {};
      for (const d of drafts) {
        if (!d.alreadySent && d.withinWindow) {
          initialSelection[d.reminderKey] = true;
        }
      }
      setSelectedReminderKeys(initialSelection);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to inspect automated reminders');
    } finally {
      setLoadingReminders(false);
    }
  }, []);

  const loadCalendar = useCallback(
    async (token: string) => {
      setLoadingCal(true);
      try {
        const res = await fetch('/api/workspace/calendar', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.status === 401) {
          clearWorkspaceToken();
          return;
        }
        if (!res.ok) throw new Error(data.message);
        setEvents(data.events || []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not load Calendar events');
      } finally {
        setLoadingCal(false);
      }
    },
    [clearWorkspaceToken]
  );

  const loadTasks = useCallback(
    async (token: string, listId?: string) => {
      setLoadingTasks(true);
      try {
        const qs = listId ? `?listId=${encodeURIComponent(listId)}` : '';
        const res = await fetch(`/api/workspace/tasks${qs}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.status === 401) {
          clearWorkspaceToken();
          return;
        }
        if (!res.ok) throw new Error(data.message);
        setTaskLists(data.taskLists || []);
        setActiveListId(data.activeListId || '@default');
        setTasks(data.tasks || []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not load Google Tasks');
      } finally {
        setLoadingTasks(false);
      }
    },
    [clearWorkspaceToken]
  );

  const loadGmail = useCallback(
    async (token: string, query = '') => {
      setLoadingGmail(true);
      try {
        const qs = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : '';
        const res = await fetch(`/api/workspace/gmail${qs}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.status === 401) {
          clearWorkspaceToken();
          return;
        }
        if (!res.ok) throw new Error(data.message);
        setMessages(data.messages || []);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not load Gmail messages');
      } finally {
        setLoadingGmail(false);
      }
    },
    [clearWorkspaceToken]
  );

  useEffect(() => {
    loadReminders(workspaceAccessToken);
    if (!workspaceAccessToken) return;
    loadCalendar(workspaceAccessToken);
    loadTasks(workspaceAccessToken);
    loadGmail(workspaceAccessToken);
  }, [workspaceAccessToken, isAuthenticated, loadReminders, loadCalendar, loadTasks, loadGmail]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connectGoogleWorkspace();
    } finally {
      setConnecting(false);
    }
  };

  const handleSaveReminderRules = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Sign in to your SAKHI account to persist reminder automation rules.');
      return;
    }
    setSavingRules(true);
    try {
      const res = await fetch('/api/workspace/reminders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminderSettings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not save rules');
      toast.success('Reminder automation rules saved to PostgreSQL');
      loadReminders(workspaceAccessToken);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save rules');
    } finally {
      setSavingRules(false);
    }
  };

  const prefillPredictedCycleEvent = async () => {
    try {
      const res = await fetch('/api/health/cycle');
      const data = await res.json();
      const nextPeriod = data?.cycleInfo?.nextPeriod;
      if (nextPeriod && /^\d{4}-\d{2}-\d{2}/.test(nextPeriod)) {
        setEventDate(nextPeriod.slice(0, 10));
        setEventTitle('SAKHI Predicted Cycle Window Check-In');
        setEventNotes('Estimated cycle start window from SAKHI. Track cramps, mood, and hydration.');
        toast.success(`Prefilled date from your SAKHI cycle estimate (${nextPeriod.slice(0, 10)})`);
      } else {
        toast.success('Prefilled upcoming wellness check-in template');
      }
    } catch {
      toast.success('Prefilled upcoming wellness check-in template');
    }
  };

  const runConfirmedMutation = async () => {
    if (!pendingConfirm) return;
    setExecutingConfirm(true);
    try {
      await pendingConfirm.onConfirm();
      setPendingConfirm(null);
    } finally {
      setExecutingConfirm(false);
    }
  };

  // Dispatch selected reminder emails via Gmail WITH mandatory confirmation dialog
  const requestSendDueReminders = (specificDraft?: DueReminderDraft) => {
    if (!workspaceAccessToken) {
      toast.error('Connect Google Workspace first to send reminders via Gmail.');
      return;
    }

    const targets = specificDraft
      ? [specificDraft]
      : dueReminders.filter((d) => selectedReminderKeys[d.reminderKey]);

    if (targets.length === 0) {
      toast.error('Select at least one reminder draft to send.');
      return;
    }

    const missingRecipient = targets.some((t) => !t.recipientEmail.trim());
    if (missingRecipient) {
      toast.error('Enter a valid recipient email address in Reminder Rules.');
      return;
    }

    const previewSubjects = targets.map((t) => `• ${t.subject} → ${t.recipientEmail}`).join(' | ');

    setPendingConfirm({
      title: `Send ${targets.length} Automated Reminder Email(s) via Gmail?`,
      description: `Confirm sending ${targets.length} personalized reminder email(s): ${previewSubjects}`,
      confirmLabel: `Confirm & Send (${targets.length})`,
      onConfirm: async () => {
        const res = await fetch('/api/workspace/reminders', {
          method: 'POST',
          headers: authHeaders(workspaceAccessToken),
          body: JSON.stringify({ reminders: targets }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.message || 'Failed to send reminder email(s)');
          return;
        }
        toast.success(`Sent ${data.sentCount} reminder email(s) via Gmail`);
        loadReminders(workspaceAccessToken);
        loadGmail(workspaceAccessToken, gmailQuery);
      },
    });
  };

  // Mutating handlers — EVERY one opens explicit PendingConfirmation dialog first
  const requestCreateEvent = (e: FormEvent) => {
    e.preventDefault();
    if (!workspaceAccessToken || !eventTitle.trim()) return;

    const startLocal = new Date(`${eventDate}T${eventTime}:00`);
    const endLocal = new Date(startLocal.getTime() + 45 * 60 * 1000);

    setPendingConfirm({
      title: 'Create Google Calendar Event?',
      description: `Add "${eventTitle.trim()}" on ${eventDate} at ${eventTime} (45 min) to your primary Google Calendar.`,
      confirmLabel: 'Create Event',
      onConfirm: async () => {
        const res = await fetch('/api/workspace/calendar', {
          method: 'POST',
          headers: authHeaders(workspaceAccessToken),
          body: JSON.stringify({
            summary: eventTitle.trim(),
            location: eventLocation.trim(),
            description: eventNotes.trim(),
            startIso: startLocal.toISOString(),
            endIso: endLocal.toISOString(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.message || 'Failed to create event');
          return;
        }
        toast.success('Calendar event added');
        loadCalendar(workspaceAccessToken);
        loadReminders(workspaceAccessToken);
      },
    });
  };

  const requestDeleteEvent = (ev: CalendarEventItem) => {
    if (!workspaceAccessToken) return;
    setPendingConfirm({
      title: 'Delete Google Calendar Event?',
      description: `Permanently delete "${ev.summary || 'Untitled event'}" from your Google Calendar?`,
      confirmLabel: 'Delete Event',
      destructive: true,
      onConfirm: async () => {
        const res = await fetch(
          `/api/workspace/calendar?eventId=${encodeURIComponent(ev.id)}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${workspaceAccessToken}` },
          }
        );
        if (!res.ok) {
          toast.error('Failed to delete calendar event');
          return;
        }
        toast.success('Calendar event removed');
        loadCalendar(workspaceAccessToken);
        loadReminders(workspaceAccessToken);
      },
    });
  };

  const requestCreateTask = (e: FormEvent) => {
    e.preventDefault();
    if (!workspaceAccessToken || !newTaskTitle.trim()) return;
    const titleToAdd = newTaskTitle.trim();

    setPendingConfirm({
      title: 'Add Task to Google Tasks?',
      description: `Create Google Task "${titleToAdd}"${newTaskDue ? ` due ${newTaskDue}` : ''}?`,
      confirmLabel: 'Create Task',
      onConfirm: async () => {
        const res = await fetch('/api/workspace/tasks', {
          method: 'POST',
          headers: authHeaders(workspaceAccessToken),
          body: JSON.stringify({
            listId: activeListId,
            title: titleToAdd,
            notes: newTaskNotes.trim() || undefined,
            due: newTaskDue || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.message || 'Failed to create task');
          return;
        }
        toast.success('Task added to Google Tasks');
        setNewTaskTitle('');
        setNewTaskNotes('');
        loadTasks(workspaceAccessToken, activeListId);
      },
    });
  };

  const requestToggleTask = (task: TaskItem) => {
    if (!workspaceAccessToken) return;
    const nextStatus = task.status === 'completed' ? 'needsAction' : 'completed';

    setPendingConfirm({
      title: nextStatus === 'completed' ? 'Mark Task as Completed?' : 'Reopen Google Task?',
      description: `Update "${task.title}" in Google Tasks to "${nextStatus === 'completed' ? 'Completed' : 'Needs Action'}"?`,
      confirmLabel: 'Update Task',
      onConfirm: async () => {
        const res = await fetch('/api/workspace/tasks', {
          method: 'PATCH',
          headers: authHeaders(workspaceAccessToken),
          body: JSON.stringify({
            listId: activeListId,
            taskId: task.id,
            status: nextStatus,
          }),
        });
        if (!res.ok) {
          toast.error('Failed to update task');
          return;
        }
        toast.success('Task updated');
        loadTasks(workspaceAccessToken, activeListId);
      },
    });
  };

  const requestDeleteTask = (task: TaskItem) => {
    if (!workspaceAccessToken) return;
    setPendingConfirm({
      title: 'Delete Google Task?',
      description: `Permanently delete task "${task.title}" from Google Tasks?`,
      confirmLabel: 'Delete Task',
      destructive: true,
      onConfirm: async () => {
        const res = await fetch(
          `/api/workspace/tasks?listId=${encodeURIComponent(activeListId)}&taskId=${encodeURIComponent(task.id)}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${workspaceAccessToken}` },
          }
        );
        if (!res.ok) {
          toast.error('Failed to delete task');
          return;
        }
        toast.success('Task deleted');
        loadTasks(workspaceAccessToken, activeListId);
      },
    });
  };

  const requestSendEmail = (e: FormEvent) => {
    e.preventDefault();
    if (!workspaceAccessToken || !mailTo.trim() || !mailSubject.trim() || !mailBody.trim()) {
      toast.error('Recipient, subject, and message body are required.');
      return;
    }

    setPendingConfirm({
      title: 'Send Email via Gmail?',
      description: `Send email to "${mailTo.trim()}" with subject "${mailSubject.trim()}" from your Gmail account?`,
      confirmLabel: 'Confirm & Send Email',
      onConfirm: async () => {
        const res = await fetch('/api/workspace/gmail', {
          method: 'POST',
          headers: authHeaders(workspaceAccessToken),
          body: JSON.stringify({
            to: mailTo.trim(),
            subject: mailSubject.trim(),
            body: mailBody.trim(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.message || 'Failed to send email');
          return;
        }
        toast.success('Email sent via Gmail');
        setMailTo('');
        loadGmail(workspaceAccessToken, gmailQuery);
      },
    });
  };

  const requestTrashEmail = (msg: GmailMessageItem) => {
    if (!workspaceAccessToken) return;
    setPendingConfirm({
      title: 'Move Email to Gmail Trash?',
      description: `Move "${msg.subject}" (from ${msg.from}) to your Gmail Trash?`,
      confirmLabel: 'Move to Trash',
      destructive: true,
      onConfirm: async () => {
        const res = await fetch(`/api/workspace/gmail?id=${encodeURIComponent(msg.id)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${workspaceAccessToken}` },
        });
        if (!res.ok) {
          toast.error('Failed to move email to Trash');
          return;
        }
        toast.success('Email moved to Trash');
        loadGmail(workspaceAccessToken, gmailQuery);
      },
    });
  };

  const readyUnsentCount = dueReminders.filter((d) => !d.alreadySent && d.withinWindow).length;
  const selectedCount = dueReminders.filter((d) => selectedReminderKeys[d.reminderKey]).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              Google Workspace Sync · Automated Cycle & Doctor Visit Reminders
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Gmail, Calendar & Tasks Care Hub
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Detect upcoming period cycle dates and scheduled Google Calendar doctor visits to review and dispatch personalized Gmail reminders.
            </p>
          </div>

          {workspaceAccessToken && (
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 py-1 px-3">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Connected{workspaceUserEmail ? `: ${workspaceUserEmail}` : ''}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleConnect} disabled={connecting}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh Google Session
              </Button>
            </div>
          )}
        </div>

        {/* Ready Due Reminders Alert */}
        {workspaceAccessToken && readyUnsentCount > 0 && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm text-rose-950">
            <div className="flex items-center gap-2.5">
              <BellRing className="h-5 w-5 text-rose-600 shrink-0" />
              <span>
                <strong>{readyUnsentCount} automated reminder(s)</strong> matched your cycle window or upcoming Google Calendar doctor visits and are ready for your review.
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setActiveTab('reminders');
                requestSendDueReminders();
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Send className="h-3.5 w-3.5 mr-1.5" /> Review & Send Due Reminders
            </Button>
          </div>
        )}

        {!workspaceAccessToken && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Connect Your Google Workspace Account</CardTitle>
              <CardDescription>
                With your permission, SAKHI scans your Google Calendar for scheduled doctor visits and sends your confirmed period cycle & visit reminders via Gmail.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-rose-600" />
                  Auto-detect upcoming predicted period dates & scheduled Google Calendar doctor visits
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-indigo-600" />
                  Send confirmed Gmail reminder notifications with full audit & duplicate protection
                </li>
                <li className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-teal-600" />
                  Manage Google Calendar appointments & Google Tasks care checklists
                </li>
              </ul>

              <div className="pt-2">
                <GoogleSignInMaterialButton onClick={handleConnect} loading={connecting} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workspace Service Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('reminders')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold border transition-colors ${
              activeTab === 'reminders'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BellRing className="h-4 w-4" />
            Automated Gmail Reminders ({dueReminders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold border transition-colors ${
              activeTab === 'calendar'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Google Calendar ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold border transition-colors ${
              activeTab === 'tasks'
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            Google Tasks ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gmail')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold border transition-colors ${
              activeTab === 'gmail'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Mail className="h-4 w-4" />
            Gmail ({messages.length})
          </button>
        </div>

        {/* AUTOMATED REMINDERS TAB */}
        {activeTab === 'reminders' && (
          <div className="grid gap-6 lg:grid-cols-[390px_minmax(0,1fr)]">
            {/* Left: Rule Configuration */}
            <div className="space-y-6">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BellRing className="h-4 w-4 text-rose-600" />
                    Reminder Trigger Rules
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Saved per account in PostgreSQL. Emails always require your confirmation before sending.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveReminderRules} className="space-y-4">
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-3">
                      <div>
                        <p className="font-semibold text-slate-900">Enable Automated Detection</p>
                        <p className="text-slate-500">Scan cycle dates & calendar visits</p>
                      </div>
                      <Switch
                        checked={reminderSettings.enabled}
                        onCheckedChange={(v) => setReminderSettings((s) => ({ ...s, enabled: v }))}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Reminder Recipient Email
                      </label>
                      <Input
                        type="email"
                        value={reminderSettings.recipientEmail}
                        onChange={(e) =>
                          setReminderSettings((s) => ({ ...s, recipientEmail: e.target.value }))
                        }
                        placeholder={user?.email || workspaceUserEmail || 'you@gmail.com'}
                        required
                      />
                    </div>

                    <div className="rounded-lg border border-rose-100 bg-rose-50/40 p-3 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-rose-900">Period Cycle Date Reminders</span>
                        <Switch
                          checked={reminderSettings.cycleReminderEnabled}
                          onCheckedChange={(v) =>
                            setReminderSettings((s) => ({ ...s, cycleReminderEnabled: v }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">
                          Notify Days Before Predicted Period
                        </label>
                        <select
                          value={reminderSettings.cycleLeadDays}
                          onChange={(e) =>
                            setReminderSettings((s) => ({
                              ...s,
                              cycleLeadDays: Number(e.target.value),
                            }))
                          }
                          className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                        >
                          <option value={1}>1 day before</option>
                          <option value={2}>2 days before</option>
                          <option value={3}>3 days before (Recommended)</option>
                          <option value={5}>5 days before</option>
                          <option value={7}>7 days before</option>
                        </select>
                      </div>
                    </div>

                    <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-indigo-950">
                          Google Calendar Doctor Visit Reminders
                        </span>
                        <Switch
                          checked={reminderSettings.doctorReminderEnabled}
                          onCheckedChange={(v) =>
                            setReminderSettings((s) => ({ ...s, doctorReminderEnabled: v }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">
                          Notify Window Before Scheduled Visit
                        </label>
                        <select
                          value={reminderSettings.doctorLeadHours}
                          onChange={(e) =>
                            setReminderSettings((s) => ({
                              ...s,
                              doctorLeadHours: Number(e.target.value),
                            }))
                          }
                          className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                        >
                          <option value={12}>12 hours before</option>
                          <option value={24}>24 hours (1 day) before</option>
                          <option value={48}>48 hours (2 days) before</option>
                          <option value={72}>72 hours (3 days) before</option>
                          <option value={168}>7 days before</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">
                          Calendar Medical Event Keywords
                        </label>
                        <Textarea
                          value={reminderSettings.calendarKeywords}
                          onChange={(e) =>
                            setReminderSettings((s) => ({
                              ...s,
                              calendarKeywords: e.target.value,
                            }))
                          }
                          rows={2}
                          className="text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={savingRules}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
                      >
                        <Save className="h-4 w-4 mr-1.5" />
                        {savingRules ? 'Saving...' : 'Save Rules'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => loadReminders(workspaceAccessToken)}
                        disabled={loadingReminders}
                      >
                        <RefreshCw className={`h-4 w-4 ${loadingReminders ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Cycle Status Snapshot */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Predicted Period Window</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-1.5 text-slate-700">
                  {cycleSummary ? (
                    <>
                      <p>
                        <strong>Estimated Next Period:</strong> {cycleSummary.nextPeriod}
                      </p>
                      <p>
                        <strong>Current Cycle:</strong> Day {cycleSummary.day} ({cycleSummary.phase}) · Avg {cycleSummary.cycleLength}d
                      </p>
                      <p className="text-slate-500 leading-relaxed">{cycleSummary.predictionNote}</p>
                    </>
                  ) : (
                    <p className="text-slate-500">
                      Sign in and log period start dates on the Dashboard to generate automated cycle date reminders.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Detected Queue, Calendar Medical Visits & Audit Logs */}
            <div className="space-y-6">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-wrap flex-row items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">
                      Ready-to-Send Gmail Reminder Queue ({dueReminders.length})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Generated automatically from your cycle prediction and Google Calendar doctor visits.
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    disabled={!workspaceAccessToken || selectedCount === 0}
                    onClick={() => requestSendDueReminders()}
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                    size="sm"
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    Confirm & Send Selected ({selectedCount})
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loadingReminders ? (
                    <p className="text-sm text-slate-500">Scanning cycle predictions and Google Calendar...</p>
                  ) : dueReminders.length === 0 ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-xs text-slate-600 space-y-2">
                      <p className="font-semibold text-slate-800">No cycle or doctor visit reminders matched yet.</p>
                      <p>
                        Add a period log on the Dashboard or schedule a doctor/clinic appointment in the{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab('calendar')}
                          className="underline font-semibold text-rose-700"
                        >
                          Google Calendar tab
                        </button>{' '}
                        to see automated reminder drafts appear here.
                      </p>
                    </div>
                  ) : (
                    dueReminders.map((draft, idx) => {
                      const checked = Boolean(selectedReminderKeys[draft.reminderKey]);
                      return (
                        <div
                          key={draft.reminderKey}
                          className={`rounded-xl border p-4 space-y-3 ${
                            draft.withinWindow && !draft.alreadySent
                              ? 'border-rose-200 bg-rose-50/30'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) =>
                                  setSelectedReminderKeys((prev) => ({
                                    ...prev,
                                    [draft.reminderKey]: e.target.checked,
                                  }))
                                }
                                className="h-4 w-4 rounded border-slate-300 text-rose-600"
                                aria-label={`Select reminder ${draft.subject}`}
                              />
                              <Badge
                                variant="outline"
                                className={
                                  draft.type === 'cycle'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                }
                              >
                                {draft.type === 'cycle' ? 'Cycle Reminder' : 'Doctor Visit'}
                              </Badge>
                              <span className="text-xs font-medium text-slate-600">
                                {draft.sourceLabel}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {draft.alreadySent ? (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                                  Already Sent
                                </Badge>
                              ) : draft.withinWindow ? (
                                <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">
                                  Due Now
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px]">
                                  Upcoming (Outside Lead Window)
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Input
                              value={draft.subject}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDueReminders((prev) =>
                                  prev.map((d, i) => (i === idx ? { ...d, subject: val } : d))
                                );
                              }}
                              className="text-xs font-semibold bg-white"
                            />
                            <Textarea
                              value={draft.body}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDueReminders((prev) =>
                                  prev.map((d, i) => (i === idx ? { ...d, body: val } : d))
                                );
                              }}
                              rows={4}
                              className="text-xs bg-white"
                            />
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="text-slate-500">
                              To: <strong className="text-slate-800">{draft.recipientEmail || 'Set recipient email'}</strong>
                            </span>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={!workspaceAccessToken}
                              onClick={() => requestSendDueReminders(draft)}
                              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            >
                              <Send className="h-3 w-3 mr-1" />
                              {draft.alreadySent ? 'Send Again' : 'Send This Reminder'}
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              {/* Detected Calendar Doctor Visits */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-indigo-600" />
                    Scheduled Doctor Visits Detected in Google Calendar ({detectedVisits.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-slate-100 text-xs">
                  {!workspaceAccessToken ? (
                    <p className="text-slate-500 py-3">Connect Google Workspace above to scan your Google Calendar.</p>
                  ) : detectedVisits.length === 0 ? (
                    <p className="text-slate-500 py-3">
                      No upcoming calendar events matched your medical keywords in the next 30 days.
                    </p>
                  ) : (
                    detectedVisits.map((v) => (
                      <div key={v.eventId} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900">{v.summary}</p>
                          <p className="text-slate-500">
                            {new Date(v.startRaw).toLocaleString()}
                            {v.location ? ` · ${v.location}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px]">
                            Matched: {v.matchedKeywords.join(', ')}
                          </Badge>
                          {v.alreadySent && (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                              Sent
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Sent History */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Reminder Dispatch Audit History ({reminderHistory.length})</CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-slate-100 text-xs">
                  {reminderHistory.length === 0 ? (
                    <p className="text-slate-500 py-3">No Gmail reminders dispatched yet.</p>
                  ) : (
                    reminderHistory.map((log) => (
                      <div key={log.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900">{log.subject}</p>
                          <p className="text-slate-500">
                            To {log.recipientEmail} · Target: {log.targetDate}
                          </p>
                        </div>
                        <span className="text-slate-400">
                          {new Date(log.sentAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* CALENDAR TAB */}
        {workspaceAccessToken && activeTab === 'calendar' && (
          <div className="grid gap-6 lg:grid-cols-[390px_minmax(0,1fr)]">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Schedule Care Appointment</CardTitle>
                <CardDescription className="text-xs">
                  Scheduled medical appointments automatically trigger Gmail reminders inside your lead window.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={requestCreateEvent} className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={prefillPredictedCycleEvent}
                    className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 text-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Prefill Next Predicted Cycle Check-In
                  </Button>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Event Title
                    </label>
                    <Input
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                      <Input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Time</label>
                      <Input
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Clinic / Location (Optional)
                    </label>
                    <Input
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      placeholder="e.g., Shakti Women's Clinic"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
                    <Textarea
                      value={eventNotes}
                      onChange={(e) => setEventNotes(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white">
                    <Plus className="h-4 w-4 mr-1.5" /> Add to Google Calendar
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Upcoming Calendar Events</CardTitle>
                  <CardDescription className="text-xs">Primary Google Calendar</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadCalendar(workspaceAccessToken)}
                >
                  <RefreshCw className={`h-4 w-4 ${loadingCal ? 'animate-spin' : ''}`} />
                </Button>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100">
                {loadingCal ? (
                  <p className="text-sm text-slate-500 py-4">Loading calendar events...</p>
                ) : events.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">No upcoming events found.</p>
                ) : (
                  events.map((ev) => {
                    const startRaw = ev.start?.dateTime || ev.start?.date || '';
                    return (
                      <div key={ev.id} className="py-3 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-900">
                            {ev.summary || '(Untitled Event)'}
                          </p>
                          <p className="text-xs text-slate-600 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-rose-500" />
                            {startRaw ? new Date(startRaw).toLocaleString() : 'Scheduled'}
                          </p>
                          {ev.location && (
                            <p className="text-xs text-slate-500 flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {ev.location}
                            </p>
                          )}
                          {ev.description && (
                            <p className="text-xs text-slate-600 line-clamp-2">{ev.description}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-rose-700 hover:bg-rose-50"
                          onClick={() => requestDeleteEvent(ev)}
                          aria-label="Delete calendar event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* TASKS TAB */}
        {workspaceAccessToken && activeTab === 'tasks' && (
          <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Add Health Care Task</CardTitle>
                <CardDescription className="text-xs">
                  Sync medication refills, lab tests, or symptom follow-ups to Google Tasks.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {taskLists.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Task List
                    </label>
                    <select
                      value={activeListId}
                      onChange={(e) => {
                        setActiveListId(e.target.value);
                        loadTasks(workspaceAccessToken, e.target.value);
                      }}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      {taskLists.map((list) => (
                        <option key={list.id} value={list.id}>
                          {list.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Schedule fasting CBC & Thyroid blood test',
                    'Refill daily iron & Vitamin D3',
                    'Export SAKHI summary for doctor visit',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewTaskTitle(preset)}
                      className="rounded border border-teal-200 bg-teal-50 px-2 py-1 text-[11px] font-medium text-teal-800 hover:bg-teal-100 text-left"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                <form onSubmit={requestCreateTask} className="space-y-3">
                  <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task title..."
                    required
                  />
                  <Input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                  />
                  <Textarea
                    value={newTaskNotes}
                    onChange={(e) => setNewTaskNotes(e.target.value)}
                    placeholder="Optional notes..."
                    rows={2}
                  />
                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                    <Plus className="h-4 w-4 mr-1.5" /> Create Google Task
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Your Google Tasks</CardTitle>
                  <CardDescription className="text-xs">
                    Click a task status icon to toggle completion with confirmation.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadTasks(workspaceAccessToken, activeListId)}
                >
                  <RefreshCw className={`h-4 w-4 ${loadingTasks ? 'animate-spin' : ''}`} />
                </Button>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100">
                {loadingTasks ? (
                  <p className="text-sm text-slate-500 py-4">Loading tasks...</p>
                ) : tasks.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">No tasks in this list yet.</p>
                ) : (
                  tasks.map((task) => {
                    const done = task.status === 'completed';
                    return (
                      <div key={task.id} className="py-3 flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => requestToggleTask(task)}
                          className="flex items-start gap-2.5 text-left flex-1"
                        >
                          {done ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5 hover:text-teal-600" />
                          )}
                          <div>
                            <p
                              className={`text-sm font-medium ${
                                done ? 'line-through text-slate-400' : 'text-slate-900'
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.notes && (
                              <p className="text-xs text-slate-500 mt-0.5">{task.notes}</p>
                            )}
                            {task.due && (
                              <p className="text-[11px] text-teal-700 mt-0.5">
                                Due: {new Date(task.due).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-rose-700 hover:bg-rose-50"
                          onClick={() => requestDeleteTask(task)}
                          aria-label="Delete task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* GMAIL TAB */}
        {workspaceAccessToken && activeTab === 'gmail' && (
          <div className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Compose Care Email</CardTitle>
                <CardDescription className="text-xs">
                  Send clinic inquiries or share your consultation details via Gmail.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={requestSendEmail} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">To</label>
                    <Input
                      type="email"
                      value={mailTo}
                      onChange={(e) => setMailTo(e.target.value)}
                      placeholder="clinic@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Subject
                    </label>
                    <Input
                      value={mailSubject}
                      onChange={(e) => setMailSubject(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Message
                    </label>
                    <Textarea
                      value={mailBody}
                      onChange={(e) => setMailBody(e.target.value)}
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Send className="h-4 w-4 mr-1.5" /> Send via Gmail
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Recent Gmail Messages</CardTitle>
                    <CardDescription className="text-xs">
                      Search lab reports, appointment confirmations, or inbox threads.
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadGmail(workspaceAccessToken, gmailQuery)}
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingGmail ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    loadGmail(workspaceAccessToken, gmailQuery);
                  }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                    <Input
                      value={gmailQuery}
                      onChange={(e) => setGmailQuery(e.target.value)}
                      placeholder="Search Gmail (e.g., lab, clinic, prescription)..."
                      className="pl-9"
                    />
                  </div>
                  <Button type="submit" variant="outline">
                    Search
                  </Button>
                </form>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100">
                {loadingGmail ? (
                  <p className="text-sm text-slate-500 py-4">Loading Gmail inbox...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">No matching Gmail messages found.</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="py-3 flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {msg.subject}
                        </p>
                        <p className="text-xs text-indigo-700 truncate">{msg.from}</p>
                        <p className="text-xs text-slate-600 line-clamp-2">{msg.snippet}</p>
                        {msg.date && <p className="text-[11px] text-slate-400">{msg.date}</p>}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-rose-700 hover:bg-rose-50 shrink-0"
                        onClick={() => requestTrashEmail(msg)}
                        aria-label="Move email to Trash"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Explicit User Confirmation Dialog for ALL Workspace Mutations */}
      <AlertDialog
        open={Boolean(pendingConfirm)}
        onOpenChange={(open) => {
          if (!open && !executingConfirm) setPendingConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingConfirm?.title}</AlertDialogTitle>
            <AlertDialogDescription>{pendingConfirm?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={executingConfirm}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                runConfirmedMutation();
              }}
              disabled={executingConfirm}
              className={
                pendingConfirm?.destructive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }
            >
              {executingConfirm ? 'Processing...' : pendingConfirm?.confirmLabel || 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}
