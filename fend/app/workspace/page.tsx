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
  Calendar,
  CheckCircle2,
  CheckSquare,
  Circle,
  Clock,
  Mail,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
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
  const { workspaceAccessToken, workspaceUserEmail, connectGoogleWorkspace, clearWorkspaceToken } =
    useAuth();

  const [connecting, setConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'tasks' | 'gmail'>('calendar');
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirmation | null>(null);
  const [executingConfirm, setExecutingConfirm] = useState(false);

  // Calendar state
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [loadingCal, setLoadingCal] = useState(false);
  const [eventTitle, setEventTitle] = useState('OB-GYN Consultation & Cycle Review');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDate, setEventDate] = useState(() => {
    const d = new Date(Date.now() + 2 * 24 * 3600 * 1000);
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
    if (!workspaceAccessToken) return;
    loadCalendar(workspaceAccessToken);
    loadTasks(workspaceAccessToken);
    loadGmail(workspaceAccessToken);
  }, [workspaceAccessToken, loadCalendar, loadTasks, loadGmail]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connectGoogleWorkspace();
    } finally {
      setConnecting(false);
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              Google Workspace Sync · In-Memory Session Token
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Gmail, Calendar & Tasks Care Hub
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage OB-GYN appointments, daily medication/checkup tasks, and clinic emails directly with explicit confirmation controls.
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

        {!workspaceAccessToken ? (
          <Card className="border-slate-200 shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Connect Your Google Workspace Account</CardTitle>
              <CardDescription>
                With your permission, SAKHI connects to Gmail, Google Calendar, and Google Tasks using a temporary in-memory access token that automatically clears when you sign out.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-rose-600" />
                  View & schedule doctor appointments and predicted cycle check-ins in Google Calendar
                </li>
                <li className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-teal-600" />
                  Create, complete, and organize lab/medication checklists in Google Tasks
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-indigo-600" />
                  Search clinic emails and send appointment follow-ups via Gmail
                </li>
              </ul>

              <div className="pt-2">
                <GoogleSignInMaterialButton onClick={handleConnect} loading={connecting} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Workspace Service Tabs */}
            <div className="flex flex-wrap gap-2">
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

            {/* CALENDAR TAB */}
            {activeTab === 'calendar' && (
              <div className="grid gap-6 lg:grid-cols-[390px_minmax(0,1fr)]">
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Schedule Care Appointment</CardTitle>
                    <CardDescription className="text-xs">
                      You will review and confirm details before adding to Google Calendar.
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
            {activeTab === 'tasks' && (
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
            {activeTab === 'gmail' && (
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
