import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type {
  Employee,
  TrainingRecord,
  SicknessRecord,
  AppraisalRecord,
  Shift,
  ShiftNote,
  HolidayRequest,
  Document,
  Resource,
  Nomination,
  ManagerNote,
  UserProfile,
  EmployeeId,
  ShiftId,
  HolidayRequestId,
  DocumentId,
  ResourceId,
  ManagerNoteId,
  UserApprovalInfo,
} from "../backend";
import {
  ApprovalStatus,
  HolidayRequestStatus,
  ResourceCategory,
  UserRole,
} from "../backend";
import type { Principal } from "@dfinity/principal";

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ─── User Role ────────────────────────────────────────────────────────────────

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ["callerUserRole"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerUserRole"] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Approval ─────────────────────────────────────────────────────────────────

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isCallerApproved"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.isCallerApproved();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRequestApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.requestApproval();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isCallerApproved"] });
    },
  });
}

export function useListApprovals() {
  const { actor, isFetching } = useActor();

  return useQuery<UserApprovalInfo[]>({
    queryKey: ["listApprovals"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      user,
      status,
    }: {
      user: Principal;
      status: ApprovalStatus;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listApprovals"] });
    },
  });
}

// ─── Employees ────────────────────────────────────────────────────────────────

export function useGetAllEmployees() {
  const { actor, isFetching } = useActor();

  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEmployees();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetEmployee(id: EmployeeId) {
  const { actor, isFetching } = useActor();

  return useQuery<Employee | null>({
    queryKey: ["employee", id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getEmployee(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useAddEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employee: Employee) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addEmployee(employee);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employee: Employee) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateEmployee(employee);
    },
    onSuccess: (_, employee) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", employee.id] });
    },
  });
}

// ─── Training Records ─────────────────────────────────────────────────────────

export function useGetTrainingRecordsByEmployee(employeeId: EmployeeId) {
  const { actor, isFetching } = useActor();

  return useQuery<TrainingRecord[]>({
    queryKey: ["trainingRecords", employeeId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrainingRecordsByEmployee(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

export function useAddTrainingRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: TrainingRecord) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addTrainingRecord(record);
    },
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({
        queryKey: ["trainingRecords", record.employeeId],
      });
    },
  });
}

export function useUpdateTrainingRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: TrainingRecord) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateTrainingRecord(record);
    },
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({
        queryKey: ["trainingRecords", record.employeeId],
      });
    },
  });
}

// Backward-compatible alias
export const useGetTrainingRecords = useGetTrainingRecordsByEmployee;

// ─── Sickness Records ─────────────────────────────────────────────────────────

export function useGetSicknessRecordsByEmployee(employeeId: EmployeeId) {
  const { actor, isFetching } = useActor();

  return useQuery<SicknessRecord[]>({
    queryKey: ["sicknessRecords", employeeId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSicknessRecordsByEmployee(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

export function useAddSicknessRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: SicknessRecord) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addSicknessRecord(record);
    },
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({
        queryKey: ["sicknessRecords", record.employeeId],
      });
    },
  });
}

// Backward-compatible alias
export const useGetSicknessRecords = useGetSicknessRecordsByEmployee;

// ─── Appraisal Records ────────────────────────────────────────────────────────

export function useGetAppraisalsByEmployee(employeeId: EmployeeId) {
  const { actor, isFetching } = useActor();

  return useQuery<AppraisalRecord[]>({
    queryKey: ["appraisals", employeeId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAppraisalsByEmployee(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

export function useAddAppraisalRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: AppraisalRecord) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addAppraisalRecord(record);
    },
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({
        queryKey: ["appraisals", record.employeeId],
      });
    },
  });
}

export function useUpdateAppraisalRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: AppraisalRecord) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateAppraisalRecord(record);
    },
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({
        queryKey: ["appraisals", record.employeeId],
      });
    },
  });
}

// Backward-compatible alias
export const useGetAppraisals = useGetAppraisalsByEmployee;

// ─── Shifts ───────────────────────────────────────────────────────────────────

export function useGetAllShifts() {
  const { actor, isFetching } = useActor();

  return useQuery<Shift[]>({
    queryKey: ["shifts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllShifts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetShiftsByEmployee(employeeId: EmployeeId) {
  const { actor, isFetching } = useActor();

  return useQuery<Shift[]>({
    queryKey: ["shifts", "employee", employeeId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getShiftsByEmployee(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

export function useAddShift() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shift: Shift) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addShift(shift);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
    },
  });
}

export function useUpdateShift() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shift: Shift) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateShift(shift);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
    },
  });
}

export function useDeleteShift() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: ShiftId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteShift(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
    },
  });
}

// ─── Shift Notes ──────────────────────────────────────────────────────────────

export function useGetShiftNotesByShift(shiftId: ShiftId) {
  const { actor, isFetching } = useActor();

  return useQuery<ShiftNote[]>({
    queryKey: ["shiftNotes", shiftId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getShiftNotesByShift(shiftId);
    },
    enabled: !!actor && !isFetching && !!shiftId,
  });
}

export function useAddShiftNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: ShiftNote) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addShiftNote(note);
    },
    onSuccess: (_, note) => {
      queryClient.invalidateQueries({ queryKey: ["shiftNotes", note.shiftId] });
    },
  });
}

// Backward-compatible alias
export const useGetShiftNotes = useGetShiftNotesByShift;

// ─── Holiday Requests ─────────────────────────────────────────────────────────

export function useGetAllHolidayRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<HolidayRequest[]>({
    queryKey: ["holidayRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllHolidayRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetHolidayRequestsByEmployee(employeeId: EmployeeId) {
  const { actor, isFetching } = useActor();

  return useQuery<HolidayRequest[]>({
    queryKey: ["holidayRequests", "employee", employeeId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHolidayRequestsByEmployee(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

export function useSubmitHolidayRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: HolidayRequest) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitHolidayRequest(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidayRequests"] });
    },
  });
}

export function useUpdateHolidayRequestStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: HolidayRequestId;
      status: HolidayRequestStatus;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateHolidayRequestStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidayRequests"] });
    },
  });
}

// ─── Documents ────────────────────────────────────────────────────────────────

export function useGetAllDocuments() {
  const { actor, isFetching } = useActor();

  return useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDocuments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (document: Document) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addDocument(document);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useUpdateDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (document: Document) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateDocument(document);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useDeleteDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: DocumentId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteDocument(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

// ─── Resources ────────────────────────────────────────────────────────────────

export function useGetResources(category?: ResourceCategory) {
  const { actor, isFetching } = useActor();

  return useQuery<Resource[]>({
    queryKey: ["resources", category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getResources(category ?? null);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddResource() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resource: Resource) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addResource(resource);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}

export function useUpdateResource() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resource: Resource) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateResource(resource);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}

export function useDeleteResource() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: ResourceId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteResource(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}

// ─── Nominations ──────────────────────────────────────────────────────────────

export function useGetNominationsByMonth(month: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Nomination[]>({
    queryKey: ["nominations", month],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNominationsByMonth(month);
    },
    enabled: !!actor && !isFetching && !!month,
  });
}

export function useGetWinnerByMonth(month: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["nominationWinner", month],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getWinnerByMonth(month);
    },
    enabled: !!actor && !isFetching && !!month,
  });
}

export function useSubmitNomination() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nomination: import("../backend").Nomination) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitNomination(nomination);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nominations"] });
    },
  });
}

export function useSetMonthWinner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      month,
      employeeId,
    }: {
      month: string;
      employeeId: EmployeeId;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setMonthWinner(month, employeeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nominationWinner"] });
    },
  });
}

export function useMarkWinnerBonus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (month: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markWinnerBonus(month);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nominationWinner"] });
    },
  });
}

// ─── Manager Notes ────────────────────────────────────────────────────────────

export function useGetManagerNotesByEmployee(employeeId: EmployeeId) {
  const { actor, isFetching } = useActor();

  return useQuery<ManagerNote[]>({
    queryKey: ["managerNotes", employeeId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getManagerNotesByEmployee(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

export function useAddManagerNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: ManagerNote) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addManagerNote(note);
    },
    onSuccess: (_, note) => {
      queryClient.invalidateQueries({
        queryKey: ["managerNotes", note.employeeId],
      });
    },
  });
}

export function useUpdateManagerNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: ManagerNote) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateManagerNote(note);
    },
    onSuccess: (_, note) => {
      queryClient.invalidateQueries({
        queryKey: ["managerNotes", note.employeeId],
      });
    },
  });
}

export function useDeleteManagerNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      employeeId,
    }: {
      id: ManagerNoteId;
      employeeId: EmployeeId;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteManagerNote(id);
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({
        queryKey: ["managerNotes", employeeId],
      });
    },
  });
}
