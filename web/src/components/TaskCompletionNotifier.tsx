// 全局后台任务完成提醒：只做轻量轮询，不渲染 DOM，也不打扰首次进入时的历史任务。
import { useEffect } from 'react';
import { api, type TaskInfo } from '../api';
import { hasPerm } from '../userAuth';
import { message } from '../ui';

const POLL_INTERVAL_MS = 5_000;
const MAX_RETRY_INTERVAL_MS = 60_000;
const ACTIVE_STATUSES = new Set([
  'queued',
  'deferred',
  'in_progress',
  // 兼容不同队列实现可能返回的同义运行态。
  'pending',
  'running',
  'started',
  'retrying',
]);

function normalizedStatus(status: string | undefined): string {
  return (status || '').trim().toLowerCase();
}

function employeeLabel(employeeKey?: string): string {
  return employeeKey?.trim()
    ? `数字员工「${employeeKey.trim()}」`
    : '数字员工';
}

function inputSummary(userInput?: string): string {
  const normalized = (userInput || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '你交代的任务';
  const shortened = normalized.length > 36
    ? `${normalized.slice(0, 36)}…`
    : normalized;
  return `“${shortened}”`;
}

function showCompletion(task: TaskInfo): void {
  const employee = employeeLabel(task.employee_key);
  const summary = inputSummary(task.user_input);
  if (task.result?.success === false) {
    message.error(`${employee}没有完成${summary}，可前往任务中心查看并重试`);
    return;
  }
  message.success(`${employee}已完成${summary}`);
}

/**
 * 轮询当前账号最近的后台任务，并在任务完成时给出页内提示。
 *
 * 初次载入与接口故障恢复后都只重建基线；只有连续成功轮询之间观察到的
 * 新完成任务或“运行中 → 完成”迁移才提示，避免登录或服务恢复时轰炸历史消息。
 */
export default function TaskCompletionNotifier() {
  const canUseWorkbench = hasPerm('workbench:use');

  useEffect(() => {
    if (!canUseWorkbench || typeof document === 'undefined') return;

    let disposed = false;
    let timer: number | undefined;
    let inFlight = false;
    let needsBaseline = true;
    let failureCount = 0;
    let statuses = new Map<string, string>();
    const notified = new Set<string>();

    const isVisible = () => document.visibilityState !== 'hidden';

    const clearTimer = () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
        timer = undefined;
      }
    };

    const replaceBaseline = (tasks: TaskInfo[]) => {
      statuses = new Map(
        tasks
          .filter(task => Boolean(task.job_id))
          .map(task => [task.job_id, normalizedStatus(task.status)]),
      );
      // 历史完成任务即使日后短暂重入列表，也不应再提醒。
      tasks.forEach(task => {
        if (normalizedStatus(task.status) === 'complete') {
          notified.add(task.job_id);
        }
      });
      needsBaseline = false;
    };

    const reconcile = (tasks: TaskInfo[]) => {
      const nextStatuses = new Map<string, string>();
      tasks.forEach(task => {
        if (!task.job_id) return;
        const current = normalizedStatus(task.status);
        const previous = statuses.get(task.job_id);
        nextStatuses.set(task.job_id, current);

        if (
          current === 'complete'
          && !notified.has(task.job_id)
          // 新任务可能在两次轮询之间很快完成；它同样属于本次会话的新完成事件。
          && (previous === undefined || ACTIVE_STATUSES.has(previous))
        ) {
          notified.add(task.job_id);
          showCompletion(task);
        }
      });
      statuses = nextStatuses;
    };

    const schedule = (poll: () => Promise<void>, delay = POLL_INTERVAL_MS) => {
      clearTimer();
      if (disposed || !isVisible()) return;
      timer = window.setTimeout(() => {
        timer = undefined;
        void poll();
      }, delay);
    };

    const poll = async (): Promise<void> => {
      if (disposed || inFlight || !isVisible()) return;
      inFlight = true;
      let nextDelay = POLL_INTERVAL_MS;
      try {
        const tasks = await api.listTasks(50);
        if (disposed || !isVisible()) return;
        failureCount = 0;
        if (needsBaseline) replaceBaseline(tasks);
        else reconcile(tasks);
      } catch {
        // 队列服务是可选依赖：失败时静默，恢复后的首个成功结果只作为新基线。
        if (!disposed) {
          needsBaseline = true;
          failureCount = Math.min(failureCount + 1, 4);
          nextDelay = Math.min(
            POLL_INTERVAL_MS * 2 ** failureCount,
            MAX_RETRY_INTERVAL_MS,
          );
        }
      } finally {
        inFlight = false;
        schedule(poll, nextDelay);
      }
    };

    const handleVisibilityChange = () => {
      clearTimer();
      if (isVisible()) void poll();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    void poll();

    return () => {
      disposed = true;
      clearTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [canUseWorkbench]);

  return null;
}
