import React, { useState } from "react";
import {
  useGetEmployee,
  useGetTrainingRecordsByEmployee,
  useGetSicknessRecordsByEmployee,
  useGetAppraisalsByEmployee,
  useGetManagerNotesByEmployee,
  useAddTrainingRecord,
  useAddSicknessRecord,
  useAddAppraisalRecord,
  useUpdateAppraisalRecord,
  useAddManagerNote,
  useDeleteManagerNote,
  useIsCallerAdmin,
} from "../hooks/useQueries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, User, Plus, Trash2, AlertCircle } from "lucide-react";
import {
  formatDate,
  generateId,
  dateToNanoseconds,
  nanosecondsToDate,
  addMonths,
} from "../lib/utils";
import { TrainingStatus, AppraisalType, ManagerNoteType } from "../backend";
import type {
  TrainingRecord,
  SicknessRecord,
  AppraisalRecord,
  ManagerNote,
} from "../backend";
import { toast } from "sonner";

const EXPERIENCES = [
  "Milton General",
  "The Happy Institute",
  "The Dollhouse",
  "Wizard Of Oz",
  "St Georges General",
  "Break The Bank",
  "Marvellous Magic School",
  "Riddled",
  "Hell House",
  "The Don's Revenge",
  "Whodunit",
  "Battle Masters",
  "FEC General",
  "Time Raiders",
  "Laser Quest",
  "Retro Arcade",
  "7 Sins",
  "CSI Disco",
  "CSI Mafia",
  "Karaoke Lounge",
  "Karaoke Disco",
  "Like TV Game Show",
  "Splatter Room",
];

export type Page =
  | "dashboard"
  | "employees"
  | "employee-profile"
  | "scheduling"
  | "portal"
  | "stock-requests"
  | "inventory"
  | "eom"
  | "appraisals"
  | "training-summary"
  | "holiday-stats"
  | "payroll-export"
  | "approval-queue"
  | "documents"
  | "resources";

interface EmployeeProfilePageProps {
  employeeId: string;
  navigate: (page: Page) => void;
}

export default function EmployeeProfilePage({
  employeeId,
  navigate,
}: EmployeeProfilePageProps) {
  const { data: employee, isLoading } = useGetEmployee(employeeId);
  const { data: training } = useGetTrainingRecordsByEmployee(employeeId);
  const { data: sickness } = useGetSicknessRecordsByEmployee(employeeId);
  const { data: appraisals } = useGetAppraisalsByEmployee(employeeId);
  const { data: managerNotes } = useGetManagerNotesByEmployee(employeeId);
  const { data: isAdmin } = useIsCallerAdmin();

  const addTraining = useAddTrainingRecord();
  const addSickness = useAddSicknessRecord();
  const addAppraisal = useAddAppraisalRecord();
  const addNote = useAddManagerNote();
  const deleteNote = useDeleteManagerNote();

  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showSicknessModal, setShowSicknessModal] = useState(false);
  const [showAppraisalModal, setShowAppraisalModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const [trainingForm, setTrainingForm] = useState({
    title: "",
    description: "",
    experience: "",
    completionDate: "",
    expiryDate: "",
  });
  const [sicknessForm, setSicknessForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    returnNote: "",
  });
  const [appraisalForm, setAppraisalForm] = useState({
    scheduledDate: "",
    appraisalType: AppraisalType.annual,
    notes: "",
    isComplete: false,
  });
  const [noteForm, setNoteForm] = useState({
    noteType: ManagerNoteType.general,
    content: "",
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Employee not found</p>
        <Button
          onClick={() => navigate("employees")}
          variant="outline"
          className="mt-4 border-border text-foreground"
        >
          Back to Employees
        </Button>
      </div>
    );
  }

  // Calculate next appraisal due date
  const completedAppraisals = appraisals?.filter((a) => a.isComplete) || [];
  const lastAppraisal = completedAppraisals.sort(
    (a, b) => Number(b.scheduledDate - a.scheduledDate)
  )[0];
  const nextAppraisalDue = lastAppraisal
    ? addMonths(nanosecondsToDate(lastAppraisal.scheduledDate), 3)
    : null;
  const isAppraisalOverdue = nextAppraisalDue && nextAppraisalDue < new Date();

  const handleAddTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const record: TrainingRecord = {
        id: generateId(),
        employeeId,
        title: trainingForm.experience
          ? `${trainingForm.title} - ${trainingForm.experience}`
          : trainingForm.title,
        description: trainingForm.description,
        status: TrainingStatus.completed,
        completionDate: trainingForm.completionDate
          ? dateToNanoseconds(new Date(trainingForm.completionDate))
          : undefined,
        expiryDate: trainingForm.expiryDate
          ? dateToNanoseconds(new Date(trainingForm.expiryDate))
          : undefined,
      };
      await addTraining.mutateAsync(record);
      toast.success("Training record added");
      setShowTrainingModal(false);
      setTrainingForm({
        title: "",
        description: "",
        experience: "",
        completionDate: "",
        expiryDate: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to add training record");
    }
  };

  const handleAddSickness = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const record: SicknessRecord = {
        id: generateId(),
        employeeId,
        absenceStartDate: dateToNanoseconds(new Date(sicknessForm.startDate)),
        absenceEndDate: dateToNanoseconds(new Date(sicknessForm.endDate)),
        reason: sicknessForm.reason,
        returnNote: sicknessForm.returnNote,
      };
      await addSickness.mutateAsync(record);
      toast.success("Sickness record added");
      setShowSicknessModal(false);
      setSicknessForm({ startDate: "", endDate: "", reason: "", returnNote: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to add sickness record");
    }
  };

  const handleAddAppraisal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const record: AppraisalRecord = {
        id: generateId(),
        employeeId,
        scheduledDate: dateToNanoseconds(new Date(appraisalForm.scheduledDate)),
        appraisalType: appraisalForm.appraisalType,
        notes: appraisalForm.notes,
        isComplete: appraisalForm.isComplete,
      };
      await addAppraisal.mutateAsync(record);
      toast.success("Appraisal record added");
      setShowAppraisalModal(false);
      setAppraisalForm({
        scheduledDate: "",
        appraisalType: AppraisalType.annual,
        notes: "",
        isComplete: false,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to add appraisal");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const note: ManagerNote = {
        id: generateId(),
        employeeId,
        authorEmployeeId: "admin",
        noteType: noteForm.noteType,
        content: noteForm.content,
        createdAt: dateToNanoseconds(new Date()),
      };
      await addNote.mutateAsync(note);
      toast.success("Note added");
      setShowNoteModal(false);
      setNoteForm({ noteType: ManagerNoteType.general, content: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to add note");
    }
  };

  const NOTE_TYPE_COLORS: Record<string, string> = {
    general: "bg-secondary text-foreground",
    concern: "bg-yellow-500/20 text-yellow-400",
    sickness: "bg-blue-500/20 text-blue-400",
    performance: "bg-primary/20 text-primary",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("employees")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
      </div>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <User size={28} className="text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {employee.fullName}
                </h2>
                <p className="text-muted-foreground">
                  {employee.jobTitle} · {employee.department}
                </p>
              </div>
              <Badge
                className={
                  employee.isActive
                    ? "bg-green-600 text-white"
                    : "bg-secondary text-foreground"
                }
              >
                {employee.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p className="text-foreground">{employee.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Phone</p>
                <p className="text-foreground">{employee.phone || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Account Level</p>
                <p className="text-foreground capitalize">
                  {employee.accountLevel}
                </p>
              </div>
            </div>
            {nextAppraisalDue && (
              <div
                className={`mt-3 p-2 rounded-lg text-sm flex items-center gap-2 ${
                  isAppraisalOverdue
                    ? "bg-destructive/20 text-destructive"
                    : "bg-yellow-500/10 text-yellow-400"
                }`}
              >
                <AlertCircle size={14} />
                {isAppraisalOverdue
                  ? "Appraisal overdue!"
                  : "Next appraisal due:"}{" "}
                {nextAppraisalDue.toLocaleDateString("en-GB")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="training">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger
            value="training"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Training
          </TabsTrigger>
          <TabsTrigger
            value="sickness"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Sickness
          </TabsTrigger>
          <TabsTrigger
            value="appraisals"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Appraisals
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger
              value="notes"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Manager Notes
            </TabsTrigger>
          )}
        </TabsList>

        {/* Training Tab */}
        <TabsContent value="training" className="mt-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                Training & Knowledge Log
              </h3>
              {isAdmin && (
                <Button
                  size="sm"
                  onClick={() => setShowTrainingModal(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus size={14} className="mr-1" />
                  Add Training
                </Button>
              )}
            </div>
            {!training || training.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No training records
              </p>
            ) : (
              <div className="space-y-3">
                {training.map((record) => (
                  <div key={record.id} className="p-3 bg-secondary rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {record.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {record.description}
                        </p>
                      </div>
                      <Badge
                        className={
                          record.status === TrainingStatus.completed
                            ? "bg-green-600 text-white text-xs"
                            : "bg-yellow-500/20 text-yellow-400 text-xs"
                        }
                      >
                        {record.status}
                      </Badge>
                    </div>
                    {record.completionDate != null && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Completed: {formatDate(record.completionDate)}
                      </p>
                    )}
                    {record.expiryDate != null && (
                      <p className="text-xs text-muted-foreground">
                        Expires: {formatDate(record.expiryDate)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Sickness Tab */}
        <TabsContent value="sickness" className="mt-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                Sickness Records
              </h3>
              {isAdmin && (
                <Button
                  size="sm"
                  onClick={() => setShowSicknessModal(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus size={14} className="mr-1" />
                  Add Record
                </Button>
              )}
            </div>
            {!sickness || sickness.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No sickness records
              </p>
            ) : (
              <div className="space-y-3">
                {sickness.map((record) => (
                  <div key={record.id} className="p-3 bg-secondary rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground text-sm">
                        {record.reason}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(record.absenceStartDate)} –{" "}
                        {formatDate(record.absenceEndDate)}
                      </span>
                    </div>
                    {record.returnNote && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Return note: {record.returnNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Appraisals Tab */}
        <TabsContent value="appraisals" className="mt-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Appraisals</h3>
              {isAdmin && (
                <Button
                  size="sm"
                  onClick={() => setShowAppraisalModal(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus size={14} className="mr-1" />
                  Add Appraisal
                </Button>
              )}
            </div>
            {!appraisals || appraisals.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No appraisal records
              </p>
            ) : (
              <div className="space-y-3">
                {appraisals
                  .sort(
                    (a, b) => Number(b.scheduledDate) - Number(a.scheduledDate)
                  )
                  .map((record) => (
                    <div
                      key={record.id}
                      className="p-3 bg-secondary rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground text-sm capitalize">
                            {record.appraisalType} Appraisal
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(record.scheduledDate)}
                          </p>
                          {record.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {record.notes}
                            </p>
                          )}
                        </div>
                        <Badge
                          className={
                            record.isComplete
                              ? "bg-green-600 text-white text-xs"
                              : "bg-yellow-500/20 text-yellow-400 text-xs"
                          }
                        >
                          {record.isComplete ? "Complete" : "Scheduled"}
                        </Badge>
                      </div>
                      {record.isComplete && (
                        <p className="text-xs text-primary mt-2">
                          Next due:{" "}
                          {addMonths(
                            nanosecondsToDate(record.scheduledDate),
                            3
                          ).toLocaleDateString("en-GB")}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Manager Notes Tab (Admin only) */}
        {isAdmin && (
          <TabsContent value="notes" className="mt-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">
                  Manager Notes (Internal)
                </h3>
                <Button
                  size="sm"
                  onClick={() => setShowNoteModal(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus size={14} className="mr-1" />
                  Add Note
                </Button>
              </div>
              {!managerNotes || managerNotes.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No manager notes
                </p>
              ) : (
                <div className="space-y-3">
                  {managerNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-secondary rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              className={`text-xs ${
                                NOTE_TYPE_COLORS[note.noteType] ||
                                NOTE_TYPE_COLORS.general
                              }`}
                            >
                              {note.noteType}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(note.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">
                            {note.content}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            deleteNote.mutateAsync({
                              id: note.id,
                              employeeId,
                            })
                          }
                          className="text-muted-foreground hover:text-destructive ml-2"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Training Modal */}
      <Dialog open={showTrainingModal} onOpenChange={setShowTrainingModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Add Training Record
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTraining} className="space-y-4">
            <div>
              <Label className="text-foreground text-sm">Training Title</Label>
              <Input
                value={trainingForm.title}
                onChange={(e) =>
                  setTrainingForm({ ...trainingForm, title: e.target.value })
                }
                className="bg-input border-border text-foreground mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-foreground text-sm">
                Experience/Skill (optional)
              </Label>
              <Select
                value={trainingForm.experience}
                onValueChange={(v) =>
                  setTrainingForm({ ...trainingForm, experience: v })
                }
              >
                <SelectTrigger className="bg-input border-border text-foreground mt-1">
                  <SelectValue placeholder="Select experience..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {EXPERIENCES.map((exp) => (
                    <SelectItem key={exp} value={exp}>
                      {exp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground text-sm">Description</Label>
              <Textarea
                value={trainingForm.description}
                onChange={(e) =>
                  setTrainingForm({
                    ...trainingForm,
                    description: e.target.value,
                  })
                }
                className="bg-input border-border text-foreground mt-1"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground text-sm">
                  Completion Date
                </Label>
                <Input
                  type="date"
                  value={trainingForm.completionDate}
                  onChange={(e) =>
                    setTrainingForm({
                      ...trainingForm,
                      completionDate: e.target.value,
                    })
                  }
                  className="bg-input border-border text-foreground mt-1"
                />
              </div>
              <div>
                <Label className="text-foreground text-sm">Expiry Date</Label>
                <Input
                  type="date"
                  value={trainingForm.expiryDate}
                  onChange={(e) =>
                    setTrainingForm({
                      ...trainingForm,
                      expiryDate: e.target.value,
                    })
                  }
                  className="bg-input border-border text-foreground mt-1"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTrainingModal(false)}
                className="flex-1 border-border text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={addTraining.isPending}
              >
                {addTraining.isPending ? "Adding..." : "Add Training"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sickness Modal */}
      <Dialog open={showSicknessModal} onOpenChange={setShowSicknessModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Add Sickness Record
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSickness} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground text-sm">Start Date</Label>
                <Input
                  type="date"
                  value={sicknessForm.startDate}
                  onChange={(e) =>
                    setSicknessForm({
                      ...sicknessForm,
                      startDate: e.target.value,
                    })
                  }
                  className="bg-input border-border text-foreground mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-foreground text-sm">End Date</Label>
                <Input
                  type="date"
                  value={sicknessForm.endDate}
                  onChange={(e) =>
                    setSicknessForm({
                      ...sicknessForm,
                      endDate: e.target.value,
                    })
                  }
                  className="bg-input border-border text-foreground mt-1"
                  required
                />
              </div>
            </div>
            <div>
              <Label className="text-foreground text-sm">Reason</Label>
              <Input
                value={sicknessForm.reason}
                onChange={(e) =>
                  setSicknessForm({ ...sicknessForm, reason: e.target.value })
                }
                className="bg-input border-border text-foreground mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-foreground text-sm">
                Return to Work Note
              </Label>
              <Textarea
                value={sicknessForm.returnNote}
                onChange={(e) =>
                  setSicknessForm({
                    ...sicknessForm,
                    returnNote: e.target.value,
                  })
                }
                className="bg-input border-border text-foreground mt-1"
                rows={2}
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSicknessModal(false)}
                className="flex-1 border-border text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={addSickness.isPending}
              >
                {addSickness.isPending ? "Adding..." : "Add Record"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Appraisal Modal */}
      <Dialog open={showAppraisalModal} onOpenChange={setShowAppraisalModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Appraisal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAppraisal} className="space-y-4">
            <div>
              <Label className="text-foreground text-sm">
                Scheduled / Completed Date
              </Label>
              <Input
                type="date"
                value={appraisalForm.scheduledDate}
                onChange={(e) =>
                  setAppraisalForm({
                    ...appraisalForm,
                    scheduledDate: e.target.value,
                  })
                }
                className="bg-input border-border text-foreground mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-foreground text-sm">Appraisal Type</Label>
              <Select
                value={appraisalForm.appraisalType}
                onValueChange={(v) =>
                  setAppraisalForm({
                    ...appraisalForm,
                    appraisalType: v as AppraisalType,
                  })
                }
              >
                <SelectTrigger className="bg-input border-border text-foreground mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value={AppraisalType.annual}>Annual</SelectItem>
                  <SelectItem value={AppraisalType.midYear}>
                    Mid-Year
                  </SelectItem>
                  <SelectItem value={AppraisalType.probationary}>
                    Probationary
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground text-sm">Notes</Label>
              <Textarea
                value={appraisalForm.notes}
                onChange={(e) =>
                  setAppraisalForm({ ...appraisalForm, notes: e.target.value })
                }
                className="bg-input border-border text-foreground mt-1"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isComplete"
                checked={appraisalForm.isComplete}
                onChange={(e) =>
                  setAppraisalForm({
                    ...appraisalForm,
                    isComplete: e.target.checked,
                  })
                }
                className="accent-primary"
              />
              <Label
                htmlFor="isComplete"
                className="text-foreground text-sm cursor-pointer"
              >
                Mark as completed
              </Label>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAppraisalModal(false)}
                className="flex-1 border-border text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={addAppraisal.isPending}
              >
                {addAppraisal.isPending ? "Adding..." : "Add Appraisal"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manager Note Modal */}
      <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Add Manager Note
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddNote} className="space-y-4">
            <div>
              <Label className="text-foreground text-sm">Note Type</Label>
              <Select
                value={noteForm.noteType}
                onValueChange={(v) =>
                  setNoteForm({ ...noteForm, noteType: v as ManagerNoteType })
                }
              >
                <SelectTrigger className="bg-input border-border text-foreground mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value={ManagerNoteType.general}>
                    General
                  </SelectItem>
                  <SelectItem value={ManagerNoteType.concern}>
                    Concern
                  </SelectItem>
                  <SelectItem value={ManagerNoteType.sickness}>
                    Sickness
                  </SelectItem>
                  <SelectItem value={ManagerNoteType.performance}>
                    Performance
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground text-sm">Note Content</Label>
              <Textarea
                value={noteForm.content}
                onChange={(e) =>
                  setNoteForm({ ...noteForm, content: e.target.value })
                }
                className="bg-input border-border text-foreground mt-1"
                rows={4}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNoteModal(false)}
                className="flex-1 border-border text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={addNote.isPending}
              >
                {addNote.isPending ? "Adding..." : "Add Note"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
