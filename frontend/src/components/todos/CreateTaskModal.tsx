import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { useCreateTask } from "../../hooks/useQueries";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { Employee, DayOfWeek, ToDoTask, Recurrence, TaskAssignee } from "../../backend";

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  employees: Employee[];
}

const DAY_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: DayOfWeek.monday, label: "Monday" },
  { value: DayOfWeek.tuesday, label: "Tuesday" },
  { value: DayOfWeek.wednesday, label: "Wednesday" },
  { value: DayOfWeek.thursday, label: "Thursday" },
  { value: DayOfWeek.friday, label: "Friday" },
  { value: DayOfWeek.saturday, label: "Saturday" },
  { value: DayOfWeek.sunday, label: "Sunday" },
];

export default function CreateTaskModal({
  open,
  onClose,
  employees,
}: CreateTaskModalProps) {
  const { identity } = useInternetIdentity();
  const createTask = useCreateTask();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMins, setDurationMins] = useState("15");
  const [assigneeType, setAssigneeType] = useState<"everyone" | "employee">("everyone");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [recurrenceType, setRecurrenceType] = useState<"none" | "weekly">("none");
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(DayOfWeek.monday);
  const [oneOffDate, setOneOffDate] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (assigneeType === "employee" && !selectedEmployeeId) {
      newErrors.assignee = "Please select an employee";
    }
    if (recurrenceType === "none" && !oneOffDate) {
      newErrors.date = "Please select a date for one-off tasks";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!identity) return;

    const assignee: TaskAssignee =
      assigneeType === "everyone"
        ? { __kind__: "everyone", everyone: null }
        : { __kind__: "employee", employee: selectedEmployeeId };

    const recurrence: Recurrence =
      recurrenceType === "weekly"
        ? { __kind__: "weekly", weekly: selectedDay }
        : { __kind__: "none", none: null };

    const dateValue: bigint | undefined =
      recurrenceType === "none" && oneOffDate
        ? BigInt(new Date(oneOffDate).getTime() * 1_000_000)
        : undefined;

    const task: ToDoTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      description: description.trim(),
      durationMins: BigInt(parseInt(durationMins, 10) || 15),
      assignee,
      recurrence,
      date: dateValue,
      creator: identity.getPrincipal(),
      createdTimestamp: BigInt(Date.now() * 1_000_000),
      completedBy: undefined,
      completedTimestamp: undefined,
    };

    await createTask.mutateAsync(task);
    onClose();
  };

  const activeEmployees = employees.filter((e) => e.isActive);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-wide text-gray-900">
            CREATE TASK
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1">
            <Label htmlFor="task-title" className="text-sm font-medium text-gray-700">
              Title <span className="text-brand-red">*</span>
            </Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fire Alarm Check"
              className={errors.title ? "border-red-400" : ""}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="task-desc" className="text-sm font-medium text-gray-700">
              Comments / Description
            </Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any notes or instructions..."
              rows={3}
            />
          </div>

          {/* Duration */}
          <div className="space-y-1">
            <Label htmlFor="task-duration" className="text-sm font-medium text-gray-700">
              Estimated Duration (minutes)
            </Label>
            <Input
              id="task-duration"
              type="number"
              min="1"
              value={durationMins}
              onChange={(e) => setDurationMins(e.target.value)}
              className="w-32"
            />
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Assign To <span className="text-brand-red">*</span>
            </Label>
            <RadioGroup
              value={assigneeType}
              onValueChange={(v) => setAssigneeType(v as "everyone" | "employee")}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="everyone" id="assign-everyone" />
                <Label htmlFor="assign-everyone" className="cursor-pointer font-normal">
                  Everyone
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="employee" id="assign-employee" />
                <Label htmlFor="assign-employee" className="cursor-pointer font-normal">
                  Specific Employee
                </Label>
              </div>
            </RadioGroup>

            {assigneeType === "employee" && (
              <div className="mt-2">
                <Select
                  value={selectedEmployeeId}
                  onValueChange={setSelectedEmployeeId}
                >
                  <SelectTrigger className={`bg-white ${errors.assignee ? "border-red-400" : ""}`}>
                    <SelectValue placeholder="Select employee..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {activeEmployees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assignee && (
                  <p className="text-xs text-red-500 mt-1">{errors.assignee}</p>
                )}
              </div>
            )}
          </div>

          {/* Recurrence */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Recurrence</Label>
            <RadioGroup
              value={recurrenceType}
              onValueChange={(v) => setRecurrenceType(v as "none" | "weekly")}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="none" id="recur-none" />
                <Label htmlFor="recur-none" className="cursor-pointer font-normal">
                  One-off
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="weekly" id="recur-weekly" />
                <Label htmlFor="recur-weekly" className="cursor-pointer font-normal">
                  Weekly
                </Label>
              </div>
            </RadioGroup>

            {recurrenceType === "none" && (
              <div className="mt-2">
                <Label htmlFor="task-date" className="text-xs text-gray-500 mb-1 block">
                  Task Date <span className="text-brand-red">*</span>
                </Label>
                <Input
                  id="task-date"
                  type="date"
                  value={oneOffDate}
                  onChange={(e) => setOneOffDate(e.target.value)}
                  className={`w-48 ${errors.date ? "border-red-400" : ""}`}
                />
                {errors.date && (
                  <p className="text-xs text-red-500 mt-1">{errors.date}</p>
                )}
              </div>
            )}

            {recurrenceType === "weekly" && (
              <div className="mt-2">
                <Label className="text-xs text-gray-500 mb-1 block">Day of Week</Label>
                <Select
                  value={selectedDay}
                  onValueChange={(v) => setSelectedDay(v as DayOfWeek)}
                >
                  <SelectTrigger className="bg-white w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {DAY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={createTask.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createTask.isPending}
            className="bg-brand-red hover:bg-brand-red/90 text-white"
          >
            {createTask.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Creating...
              </span>
            ) : (
              "Create Task"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
