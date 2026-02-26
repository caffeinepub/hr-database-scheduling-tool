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
  Document,
  Resource,
  Nomination,
  NominationWinner,
  ManagerNote,
  UserProfile,
  UserApprovalInfo,
  InventoryCategory,
  InventoryItem,
  Badge,
  StaffBadge,
  ToDoTask,
  StockRequest,
  StockRequestStatus,
} from '../backend';
import {
  ResourceCategory,
  HolidayRequestStatus,
  UserRole,
  DayOfWeek,
  ApprovalStatus,
  StockRequestStatus as StockRequestStatusEnum,
} from '../backend';
import type { Principal } from '@dfinity/principal';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

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

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
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

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isCallerApproved'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerApproved();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListApprovals() {
  const { actor, isFetching } = useActor();
  return useQuery<UserApprovalInfo[]>({
    queryKey: ['approvals'],
    queryFn: async () => {
      if (!actor) return [];
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
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
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

// ─── User Profile lookup ──────────────────────────────────────────────────────

export function useGetUserProfile(user: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !isFetching && !!user,
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
      toast.success('Employee added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add employee');
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update employee');
    },
  });
}

// ─── Training ─────────────────────────────────────────────────────────────────

export function useGetTrainingRecordsByEmployee(employeeId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<TrainingRecord[]>({
    queryKey: ['trainingRecords', employeeId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrainingRecordsByEmployee(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

// Aliases used by various components
export const useGetTrainingRecords = useGetTrainingRecordsByEmployee;
export const useGetTrainingByEmployee = useGetTrainingRecordsByEmployee;

export function useAddTrainingRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: TrainingRecord) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTrainingRecord(record);
    },
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({ queryKey: ['trainingRecords', record.employeeId] });
      toast.success('Training record added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add training record');
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
      queryClient.invalidateQueries({ queryKey: ['trainingRecords', record.employeeId] });
      toast.success('Training record updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update training record');
    },
  });
}

// ─── Sickness ─────────────────────────────────────────────────────────────────

export function useGetSicknessRecordsByEmployee(employeeId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<SicknessRecord[]>({
    queryKey: ['sicknessRecords', employeeId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSicknessRecordsByEmployee(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

// Aliases used by various components
export const useGetSicknessRecords = useGetSicknessRecordsByEmployee;
export const useGetSicknessByEmployee = useGetSicknessRecordsByEmployee;

export function useAddSicknessRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: SicknessRecord) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSicknessRecord(record);
    },
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({ queryKey: ['sicknessRecords', record.employeeId] });
      toast.success('Sickness record added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add sickness record');
    },
  });
}

// ─── Appraisals ───────────────────────────────────────────────────────────────

export function useGetAppraisalsByEmployee(employeeId: string) {
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

// Alias used by AppraisalsTab and AppraisalsDashboardPage
export const useGetAppraisals = useGetAppraisalsByEmployee;

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
      toast.success('Appraisal record added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add appraisal record');
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
      toast.success('Appraisal updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update appraisal');
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
      toast.success('Shift added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add shift');
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
      toast.success('Shift updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update shift');
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
      toast.success('Shift deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete shift');
    },
  });
}

// ─── Shift Notes ──────────────────────────────────────────────────────────────

export function useGetShiftNotesByShift(shiftId: string) {
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

// Alias used by ShiftDetailModal
export const useGetShiftNotes = useGetShiftNotesByShift;

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
      toast.success('Note added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add note');
    },
  });
}

// ─── Holiday Requests ─────────────────────────────────────────────────────────

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

export function useSubmitHolidayRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: HolidayRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitHolidayRequest(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidayRequests'] });
      toast.success('Holiday request submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit holiday request');
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
      toast.success('Holiday request status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update holiday request status');
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
      toast.success('Document added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add document');
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
      toast.success('Document updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update document');
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
      toast.success('Document deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete document');
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
      toast.success('Resource added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add resource');
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
      toast.success('Resource updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update resource');
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
      toast.success('Resource deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete resource');
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

export function useSubmitNomination() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (nomination: Nomination) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitNomination(nomination);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nominations'] });
      toast.success('Nomination submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit nomination');
    },
  });
}

export function useGetWinnerByMonth(month: string) {
  const { actor, isFetching } = useActor();
  return useQuery<NominationWinner | null>({
    queryKey: ['winner', month],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getWinnerByMonth(month);
    },
    enabled: !!actor && !isFetching && !!month,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['winner'] });
      toast.success('Winner set successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to set winner');
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['winner'] });
      toast.success('Bonus marked as received');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark bonus');
    },
  });
}

// ─── Manager Notes ────────────────────────────────────────────────────────────

export function useGetManagerNotesByEmployee(employeeId: string) {
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

// Alias
export const useGetManagerNotes = useGetManagerNotesByEmployee;

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
      toast.success('Note added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add note');
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
      toast.success('Note updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update note');
    },
  });
}

export function useDeleteManagerNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteManagerNote(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managerNotes'] });
      toast.success('Note deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete note');
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

export function useAddCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: InventoryCategory) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCategory(category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryCategories'] });
    },
  });
}

export function useAddInventoryItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: InventoryItem) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addItem(item);
    },
    onSuccess: (_, item) => {
      queryClient.invalidateQueries({ queryKey: ['inventoryItems', item.categoryId] });
    },
  });
}

export function useUpdateInventoryItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: InventoryItem) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateItem(item);
    },
    onSuccess: (_, item) => {
      queryClient.invalidateQueries({ queryKey: ['inventoryItems', item.categoryId] });
    },
  });
}

export function useDeleteInventoryItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, categoryId }: { itemId: string; categoryId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteItem(itemId);
    },
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: ['inventoryItems', categoryId] });
    },
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

export function useAddBadge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (badge: Badge) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBadge(badge);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
    },
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
    },
  });
}

// ─── To-Do Tasks ──────────────────────────────────────────────────────────────

export function useGetTasks() {
  const { actor, isFetching } = useActor();
  return useQuery<ToDoTask[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTasksForToday(dayOfWeek: DayOfWeek) {
  const { actor, isFetching } = useActor();
  return useQuery<ToDoTask[]>({
    queryKey: ['tasksForToday', dayOfWeek],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasksForToday(dayOfWeek);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: ToDoTask) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTask(task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasksForToday'] });
      toast.success('Task created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create task');
    },
  });
}

export function useMarkTaskComplete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markTaskComplete(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasksForToday'] });
      toast.success('Task marked as complete');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark task complete');
    },
  });
}

// ─── Stock Requests ───────────────────────────────────────────────────────────

export function useGetStockRequestsByStatus(status: StockRequestStatus) {
  const { actor, isFetching } = useActor();
  return useQuery<StockRequest[]>({
    queryKey: ['stockRequests', status],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStockRequestsByStatus(status);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetArchivedStockRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<StockRequest[]>({
    queryKey: ['stockRequests', StockRequestStatusEnum.archived],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStockRequestsByStatus(StockRequestStatusEnum.archived);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateStockRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemName,
      experience,
      quantity,
      notes,
      submitterName,
    }: {
      itemName: string;
      experience: string;
      quantity: bigint;
      notes: string;
      submitterName: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createStockRequest(itemName, experience, quantity, notes, submitterName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockRequests'] });
      toast.success('Stock request submitted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit stock request');
    },
  });
}

export function useUpdateStockRequestStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, newStatus }: { id: bigint; newStatus: StockRequestStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStockRequestStatus(id, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockRequests'] });
      toast.success('Status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });
}

export function useArchiveDeliveredRequests() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.archiveOldDeliveredRequests();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockRequests'] });
    },
  });
}
