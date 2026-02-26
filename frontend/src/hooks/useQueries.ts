import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import type {
  Employee,
  TrainingRecord,
  SicknessRecord,
  AppraisalRecord,
  Shift,
  ShiftNote,
  HolidayRequest,
  HolidayRequestStatus,
  Document,
  Resource,
  ResourceCategory,
  Nomination,
  ManagerNote,
  InventoryCategory,
  InventoryItem,
  Badge,
  StaffBadge,
  UserProfile,
  UserApprovalInfo,
} from '../backend';
import { ApprovalStatus, UserRole } from '../backend';
import type { Principal } from '@dfinity/principal';

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── User Role ────────────────────────────────────────────────────────────────

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
    },
  });
}

// ─── Approval ─────────────────────────────────────────────────────────────────

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerApproved'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
      if (!actor) throw new Error('Actor not available');
      return actor.requestApproval();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerApproved'] });
    },
  });
}

export function useListApprovals() {
  const { actor, isFetching } = useActor();

  return useQuery<UserApprovalInfo[]>({
    queryKey: ['listApprovals'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, status }: { user: Principal; status: ApprovalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listApprovals'] });
    },
  });
}

// ─── Employees ────────────────────────────────────────────────────────────────

export function useGetAllEmployees() {
  const { actor, isFetching } = useActor();
  return useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEmployees();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetEmployee(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Employee | null>({
    queryKey: ['employee', id],
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
      if (!actor) throw new Error('Actor not available');
      return actor.addEmployee(employee);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employee: Employee) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateEmployee(employee);
    },
    onSuccess: (_, employee) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', employee.id] });
    },
  });
}

// ─── Training ─────────────────────────────────────────────────────────────────

export function useGetTrainingRecords(employeeId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<TrainingRecord[]>({
    queryKey: ['training', employeeId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrainingRecordsByEmployee(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

// Alias for backward compatibility
export const useGetTrainingRecordsByEmployee = useGetTrainingRecords;

export function useAddTrainingRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: TrainingRecord) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTrainingRecord(record);
    },
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({ queryKey: ['training', record.employeeId] });
    },
  });
}

export function useUpdateTrainingRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: TrainingRecord) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTrainingRecord(record);
    },
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({ queryKey: ['training', record.employeeId] });
    },
  });
}

// ─── Sickness ─────────────────────────────────────────────────────────────────

export function useGetSicknessRecords(employeeId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<SicknessRecord[]>({
    queryKey: ['sickness', employeeId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSicknessRecordsByEmployee(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

// Alias for backward compatibility
export const useGetSicknessRecordsByEmployee = useGetSicknessRecords;

export function useAddSicknessRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: SicknessRecord) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSicknessRecord(record);
    },
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({ queryKey: ['sickness', record.employeeId] });
    },
  });
}

// ─── Appraisals ───────────────────────────────────────────────────────────────

export function useGetAppraisals(employeeId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AppraisalRecord[]>({
    queryKey: ['appraisals', employeeId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAppraisalsByEmployee(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

// Alias for backward compatibility
export const useGetAppraisalsByEmployee = useGetAppraisals;

export function useAddAppraisalRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: AppraisalRecord) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAppraisalRecord(record);
    },
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({ queryKey: ['appraisals', record.employeeId] });
    },
  });
}

export function useUpdateAppraisalRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: AppraisalRecord) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAppraisalRecord(record);
    },
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({ queryKey: ['appraisals', record.employeeId] });
    },
  });
}

// ─── Shifts ───────────────────────────────────────────────────────────────────

export function useGetAllShifts() {
  const { actor, isFetching } = useActor();
  return useQuery<Shift[]>({
    queryKey: ['shifts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllShifts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetShiftsByEmployee(employeeId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Shift[]>({
    queryKey: ['shifts', 'employee', employeeId],
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
      if (!actor) throw new Error('Actor not available');
      return actor.addShift(shift);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
}

export function useUpdateShift() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (shift: Shift) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateShift(shift);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
}

export function useDeleteShift() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteShift(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
}

// ─── Shift Notes ──────────────────────────────────────────────────────────────

export function useGetShiftNotes(shiftId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ShiftNote[]>({
    queryKey: ['shiftNotes', shiftId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getShiftNotesByShift(shiftId);
    },
    enabled: !!actor && !isFetching && !!shiftId,
  });
}

// Alias for backward compatibility
export const useGetShiftNotesByShift = useGetShiftNotes;

export function useAddShiftNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (note: ShiftNote) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addShiftNote(note);
    },
    onSuccess: (_, note) => {
      queryClient.invalidateQueries({ queryKey: ['shiftNotes', note.shiftId] });
    },
  });
}

// ─── Holiday Requests ─────────────────────────────────────────────────────────

export function useGetHolidayRequestsByEmployee(employeeId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<HolidayRequest[]>({
    queryKey: ['holidayRequests', employeeId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHolidayRequestsByEmployee(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

export function useGetAllHolidayRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<HolidayRequest[]>({
    queryKey: ['holidayRequests', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllHolidayRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitHolidayRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: HolidayRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitHolidayRequest(request);
    },
    onSuccess: (_, request) => {
      queryClient.invalidateQueries({ queryKey: ['holidayRequests', request.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['holidayRequests', 'all'] });
    },
  });
}

export function useUpdateHolidayRequestStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: HolidayRequestStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHolidayRequestStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidayRequests'] });
    },
  });
}

// ─── Documents ────────────────────────────────────────────────────────────────

export function useGetAllDocuments() {
  const { actor, isFetching } = useActor();
  return useQuery<Document[]>({
    queryKey: ['documents'],
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
      if (!actor) throw new Error('Actor not available');
      return actor.addDocument(document);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useUpdateDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (document: Document) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDocument(document);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteDocument(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

// ─── Resources ────────────────────────────────────────────────────────────────

export function useGetResources(category?: ResourceCategory) {
  const { actor, isFetching } = useActor();
  return useQuery<Resource[]>({
    queryKey: ['resources', category],
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
      if (!actor) throw new Error('Actor not available');
      return actor.addResource(resource);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useUpdateResource() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (resource: Resource) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateResource(resource);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

export function useDeleteResource() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteResource(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

// ─── Nominations ──────────────────────────────────────────────────────────────

export function useGetNominationsByMonth(month: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Nomination[]>({
    queryKey: ['nominations', month],
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
    queryKey: ['winner', month],
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
    mutationFn: async (nomination: Nomination) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitNomination(nomination);
    },
    onSuccess: (_, nomination) => {
      queryClient.invalidateQueries({ queryKey: ['nominations', nomination.month] });
    },
  });
}

export function useSetMonthWinner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ month, employeeId }: { month: string; employeeId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setMonthWinner(month, employeeId);
    },
    onSuccess: (_, { month }) => {
      queryClient.invalidateQueries({ queryKey: ['winner', month] });
    },
  });
}

export function useMarkWinnerBonus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (month: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markWinnerBonus(month);
    },
    onSuccess: (_, month) => {
      queryClient.invalidateQueries({ queryKey: ['winner', month] });
    },
  });
}

// ─── Manager Notes ────────────────────────────────────────────────────────────

export function useGetManagerNotes(employeeId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ManagerNote[]>({
    queryKey: ['managerNotes', employeeId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getManagerNotesByEmployee(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

// Alias for backward compatibility
export const useGetManagerNotesByEmployee = useGetManagerNotes;

export function useAddManagerNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (note: ManagerNote) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addManagerNote(note);
    },
    onSuccess: (_, note) => {
      queryClient.invalidateQueries({ queryKey: ['managerNotes', note.employeeId] });
    },
  });
}

export function useUpdateManagerNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (note: ManagerNote) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateManagerNote(note);
    },
    onSuccess: (_, note) => {
      queryClient.invalidateQueries({ queryKey: ['managerNotes', note.employeeId] });
    },
  });
}

export function useDeleteManagerNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, employeeId }: { id: string; employeeId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteManagerNote(id);
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: ['managerNotes', employeeId] });
    },
  });
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export function useGetAllCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<InventoryCategory[]>({
    queryKey: ['inventoryCategories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetItemsByCategory(categoryId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<InventoryItem[]>({
    queryKey: ['inventoryItems', categoryId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getItemsByCategory(categoryId);
    },
    enabled: !!actor && !isFetching && !!categoryId,
  });
}

// ─── Badges ───────────────────────────────────────────────────────────────────

export function useGetBadges() {
  const { actor, isFetching } = useActor();
  return useQuery<Badge[]>({
    queryKey: ['badges'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBadges();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetStaffBadges(employeeId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<StaffBadge[]>({
    queryKey: ['staffBadges', employeeId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStaffBadges(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

export function useAssignBadgeToStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assignment: StaffBadge) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignBadgeToStaff(assignment);
    },
    onSuccess: (_, assignment) => {
      queryClient.invalidateQueries({ queryKey: ['staffBadges', assignment.employeeId] });
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      toast.success('Badge assigned successfully! 🏆');
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign badge: ${error.message}`);
    },
  });
}

export function useRemoveBadgeFromStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ assignmentId, employeeId }: { assignmentId: string; employeeId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeBadgeFromStaff(assignmentId);
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: ['staffBadges', employeeId] });
      toast.success('Badge removed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove badge: ${error.message}`);
    },
  });
}
