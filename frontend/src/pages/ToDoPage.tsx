import React, { useState } from "react";
import { CheckSquare, Plus, Clock, User, RefreshCw, Check, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetTasks,
  useMarkTaskComplete,
  useGetAllEmployees,
} from "../hooks/useQueries";
import { ToDoTask, DayOfWeek, Employee } from "../backend";
import CreateTaskModal from "../components/todos/CreateTaskModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface ToDoPageProps {
  isAdmin: boolean;
}

function getDayLabel(day: DayOfWeek): string {
  const labels: Record<DayOfWeek, string> = {
    [DayOfWeek.monday]: "Monday",
    [DayOfWeek.tuesday]: "Tuesday",
    [DayOfWeek.wednesday]: "Wednesday",
    [DayOfWeek.thursday]: "Thursday",
    [DayOfWeek.friday]: "Friday",
    [DayOfWeek.saturday]: "Saturday",
    [DayOfWeek.sunday]: "Sunday",
  };
  return labels[day] ?? day;
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface TaskCardProps {
  task: ToDoTask;
  employees: Employee[];
  onMarkComplete: (id: string) => void;
  isCompleting: boolean;
  completingId: string | null;
}

function TaskCard({ task, employees, onMarkComplete, isCompleting, completingId }: TaskCardProps) {
  const isThisCompleting = isCompleting && completingId === task.id;
  const isCompleted = !!task.completedBy;

  const assigneeLabel =
    task.assignee.__kind__ === "everyone"
      ? "Everyone"
      : (() => {
          const emp = employees.find(
            (e) => e.id === (task.assignee as { __kind__: "employee"; employee: string }).employee
          );
          return emp ? emp.fullName : "Unknown";
        })();

  const recurrenceLabel =
    task.recurrence.__kind__ === "none"
      ? "One-off"
      : `Weekly – ${getDayLabel((task.recurrence as { __kind__: "weekly"; weekly: DayOfWeek }).weekly)}`;

  return (
    <div
      className={`bg-white rounded-lg border shadow-sm p-4 transition-all ${
        isCompleted ? "opacity-70 border-green-200" : "border-gray-200 hover:border-brand-red/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className={`font-semibold text-sm ${isCompleted ? "line-through text-gray-400" : "text-gray-900"}`}>
              {task.title}
            </h3>
            {isCompleted ? (
              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                <Check size={10} className="mr-1" /> Completed
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs border-brand-red/30 text-brand-red">
                Pending
              </Badge>
            )}
          </div>

          {task.description && (
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {Number(task.durationMins)} mins
            </span>
            <span className="flex items-center gap-1">
              <User size={12} />
              {assigneeLabel}
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw size={12} />
              {recurrenceLabel}
            </span>
          </div>

          {isCompleted && task.completedTimestamp && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <Check size={11} />
              Completed {formatTimestamp(task.completedTimestamp)}
            </p>
          )}
        </div>

        {!isCompleted && (
          <Button
            size="sm"
            onClick={() => onMarkComplete(task.id)}
            disabled={isThisCompleting}
            className="bg-brand-red hover:bg-brand-red/90 text-white text-xs flex-shrink-0"
          >
            {isThisCompleting ? (
              <span className="flex items-center gap-1">
                <RefreshCw size={12} className="animate-spin" /> Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Check size={12} /> Mark Done
              </span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ToDoPage({ isAdmin }: ToDoPageProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const { data: tasks = [], isLoading: tasksLoading } = useGetTasks();
  const { data: employees = [] } = useGetAllEmployees();
  const markComplete = useMarkTaskComplete();

  const pendingTasks = tasks.filter((t) => !t.completedBy);
  const completedTasks = tasks.filter((t) => !!t.completedBy);

  const handleMarkComplete = async (taskId: string) => {
    setCompletingId(taskId);
    try {
      await markComplete.mutateAsync(taskId);
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center">
            <CheckSquare size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display text-gray-900 tracking-wide">TO DO</h1>
            <p className="text-sm text-gray-500">
              {pendingTasks.length} pending · {completedTasks.length} completed
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-brand-red hover:bg-brand-red/90 text-white flex items-center gap-2"
          >
            <Plus size={16} />
            Create Task
          </Button>
        )}
      </div>

      {/* Pending Tasks */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Calendar size={14} />
          Pending Tasks
        </h2>
        {tasksLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : pendingTasks.length === 0 ? (
          <div className="bg-white rounded-lg border border-dashed border-gray-200 p-8 text-center">
            <CheckSquare size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No pending tasks</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                employees={employees}
                onMarkComplete={handleMarkComplete}
                isCompleting={markComplete.isPending}
                completingId={completingId}
              />
            ))}
          </div>
        )}
      </section>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Check size={14} />
            Completed Tasks
          </h2>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                employees={employees}
                onMarkComplete={handleMarkComplete}
                isCompleting={markComplete.isPending}
                completingId={completingId}
              />
            ))}
          </div>
        </section>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          employees={employees}
        />
      )}
    </div>
  );
}
