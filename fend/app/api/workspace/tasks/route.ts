import { NextRequest, NextResponse } from 'next/server';

const TASKS_BASE = 'https://tasks.googleapis.com/tasks/v1';

function getBearerHeader(req: NextRequest): string | null {
  const auth = req.headers.get('Authorization');
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) return null;
  return auth;
}

export async function GET(req: NextRequest) {
  const auth = getBearerHeader(req);
  if (!auth) {
    return NextResponse.json({ message: 'Google Workspace authorization token required' }, { status: 401 });
  }

  try {
    const listsRes = await fetch(`${TASKS_BASE}/users/@me/lists`, {
      headers: { Authorization: auth },
    });
    const listsData = await listsRes.json();

    if (!listsRes.ok) {
      return NextResponse.json(
        { message: listsData?.error?.message || 'Failed to fetch Google Task lists' },
        { status: listsRes.status }
      );
    }

    const taskLists: Array<{ id: string; title: string }> = Array.isArray(listsData.items)
      ? listsData.items
      : [];

    const requestedListId = req.nextUrl.searchParams.get('listId');
    const activeListId = requestedListId || taskLists[0]?.id || '@default';

    const tasksRes = await fetch(
      `${TASKS_BASE}/lists/${encodeURIComponent(activeListId)}/tasks?showCompleted=true&showHidden=false&maxResults=40`,
      { headers: { Authorization: auth } }
    );
    const tasksData = await tasksRes.json();

    if (!tasksRes.ok) {
      return NextResponse.json(
        { message: tasksData?.error?.message || 'Failed to fetch tasks' },
        { status: tasksRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      taskLists,
      activeListId,
      tasks: Array.isArray(tasksData.items) ? tasksData.items : [],
    });
  } catch (error) {
    console.error('Tasks GET proxy error:', error);
    return NextResponse.json({ message: 'Failed to communicate with Google Tasks API' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getBearerHeader(req);
  if (!auth) {
    return NextResponse.json({ message: 'Google Workspace authorization token required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const listId = typeof body.listId === 'string' && body.listId ? body.listId : '@default';
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const notes = typeof body.notes === 'string' ? body.notes.trim() : undefined;
    const due = typeof body.due === 'string' && body.due ? new Date(body.due).toISOString() : undefined;

    if (!title) {
      return NextResponse.json({ message: 'Task title is required.' }, { status: 400 });
    }

    const res = await fetch(`${TASKS_BASE}/lists/${encodeURIComponent(listId)}/tasks`, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, notes, due }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { message: data?.error?.message || 'Failed to create Google Task' },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, task: data }, { status: 201 });
  } catch (error) {
    console.error('Tasks POST proxy error:', error);
    return NextResponse.json({ message: 'Failed to create Google Task' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = getBearerHeader(req);
  if (!auth) {
    return NextResponse.json({ message: 'Google Workspace authorization token required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const listId = typeof body.listId === 'string' && body.listId ? body.listId : '@default';
    const taskId = typeof body.taskId === 'string' ? body.taskId : '';
    const status = body.status === 'completed' ? 'completed' : 'needsAction';

    if (!taskId) {
      return NextResponse.json({ message: 'taskId is required' }, { status: 400 });
    }

    const res = await fetch(
      `${TASKS_BASE}/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(taskId)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          completed: status === 'completed' ? new Date().toISOString() : null,
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { message: data?.error?.message || 'Failed to update Google Task' },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, task: data });
  } catch (error) {
    console.error('Tasks PATCH proxy error:', error);
    return NextResponse.json({ message: 'Failed to update Google Task' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = getBearerHeader(req);
  if (!auth) {
    return NextResponse.json({ message: 'Google Workspace authorization token required' }, { status: 401 });
  }

  try {
    const listId = req.nextUrl.searchParams.get('listId') || '@default';
    const taskId = req.nextUrl.searchParams.get('taskId');
    if (!taskId) {
      return NextResponse.json({ message: 'taskId is required' }, { status: 400 });
    }

    const res = await fetch(
      `${TASKS_BASE}/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(taskId)}`,
      {
        method: 'DELETE',
        headers: { Authorization: auth },
      }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { message: data?.error?.message || 'Failed to delete Google Task' },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tasks DELETE proxy error:', error);
    return NextResponse.json({ message: 'Failed to delete Google Task' }, { status: 500 });
  }
}
