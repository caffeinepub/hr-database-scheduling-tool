import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
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
  ResourceCategory,
  Nomination,
  ManagerNote,
  InventoryCategory,
  InventoryItem,
  Badge,
  StaffBadge,
  UserProfile,
  ToDoTask,
  StockRequest,
  StockRequestStatus,
  StockRequestId,
  EmployeeId,
  RecordId,
  ManagerNoteId,
  InventoryItemId,
  DocumentId,
  ResourceId,
  ShiftId,
  HolidayRequestId,
  BadgeId,
  StaffBadgeId,
  TaskId,
  UserApprovalInfo,
  ApprovalStatus,
  HolidayRequestStatus,
  EmployeeOfTheMonthNomination,
} from '../backend';
import { UserRole, StockRequestStatus as StockRequestStatusEnum } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// ─── Auth / Admin ────────────────────────────────────────────────────────────

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
  return useMutation<void, Error, UserProfile>({
    mutationFn: async (profile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
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
  return useMutation<void, Error, { user: Principal; status: ApprovalStatus }>({
    mutationFn: async ({ user, status }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
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

// ─── Employees ───────────────────────────────────────────────────────────────

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

export function useGetEmployee(id: EmployeeId) {
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
  return useMutation<void, Error, Employee>({
    mutationFn: async (employee) => {
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
  return useMutation<void, Error, Employee>({
    mutationFn: async (employee) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateEmployee(employee);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

// ─── Training Records ────────────────────────────────────────────────────────

export function useGetTrainingRecordsByEmployee(employeeId: EmployeeId) {
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

// Aliases
export const useGetTrainingRecords = useGetTrainingRecordsByEmployee;
export const useGetTrainingByEmployee = useGetTrainingRecordsByEmployee;

export function useAddTrainingRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, TrainingRecord>({
    mutationFn: async (record) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTrainingRecord(record);
    },
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({ queryKey: ['trainingRecords', record.employeeId] });
    },
  });
}

export function useUpdateTrainingRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, TrainingRecord>({
    mutationFn: async (record) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTrainingRecord(record);
    },
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({ queryKey: ['trainingRecords', record.employeeId] });
    },
  });
}

export function useDeleteTrainingRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { recordId: RecordId; employeeId: EmployeeId }>({
    mutationFn: async ({ recordId }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTrainingRecord(recordId);
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: ['trainingRecords', employeeId] });
    },
  });
}

// ─── Sickness Records ────────────────────────────────────────────────────────

export function useGetSicknessRecordsByEmployee(employeeId: EmployeeId) {
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

// Aliases
export const useGetSicknessRecords = useGetSicknessRecordsByEmployee;
export const useGetSicknessByEmployee = useGetSicknessRecordsByEmployee;

export function useAddSicknessRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, SicknessRecord>({
    mutationFn: async (record) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSicknessRecord(record);
    },
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({ queryKey: ['sicknessRecords', record.employeeId] });
    },
  });
}

// ─── Appraisal Records ───────────────────────────────────────────────────────

export function useGetAppraisalRecordsByEmployee(employeeId: EmployeeId) {
  const { actor, isFetching } = useActor();
  return useQuery<AppraisalRecord[]>({
    queryKey: ['appraisalRecords', employeeId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAppraisalsByEmployee(employeeId);
    },
    enabled: !!actor && !isFetching && !!employeeId,
  });
}

// Aliases
export const useGetAppraisals = useGetAppraisalRecordsByEmployee;
export const useGetAppraisalsByEmployee = useGetAppraisalRecordsByEmployee;

export function useAddAppraisalRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, AppraisalRecord>({
    mutationFn: async (record) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAppraisalRecord(record);
    },
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({ queryKey: ['appraisalRecords', record.employeeId] });
    },
  });
}

export function useUpdateAppraisalRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, AppraisalRecord>({
    mutationFn: async (record) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAppraisalRecord(record);
    },
    onSuccess: (_, record) => {
      queryClient.invalidateQueries({ queryKey: ['appraisalRecords', record.employeeId] });
    },
  });
}

// ─── Shifts ──────────────────────────────────────────────────────────────────

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

export function useGetShiftsByEmployee(employeeId: EmployeeId) {
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
  return useMutation<void, Error, Shift>({
    mutationFn: async (shift) => {
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
  return useMutation<void, Error, Shift>({
    mutationFn: async (shift) => {
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
  return useMutation<void, Error, ShiftId>({
    mutationFn: async (id) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteShift(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });
}

// ─── Shift Notes ─────────────────────────────────────────────────────────────

export function useGetShiftNotesByShift(shiftId: ShiftId) {
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
  return useMutation<void, Error, ShiftNote>({
    mutationFn: async (note) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addShiftNote(note);
    },
    onSuccess: (_, note) => {
      queryClient.invalidateQueries({ queryKey: ['shiftNotes', note.shiftId] });
    },
  });
}

// ─── Holiday Requests ────────────────────────────────────────────────────────

export function useGetAllHolidayRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<HolidayRequest[]>({
    queryKey: ['holidayRequests'],
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
  return useMutation<void, Error, HolidayRequest>({
    mutationFn: async (request) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitHolidayRequest(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidayRequests'] });
    },
  });
}

export function useUpdateHolidayRequestStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: HolidayRequestId; status: HolidayRequestStatus }>({
    mutationFn: async ({ id, status }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHolidayRequestStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidayRequests'] });
    },
  });
}

// ─── Documents ───────────────────────────────────────────────────────────────

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
  return useMutation<void, Error, Document>({
    mutationFn: async (document) => {
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
  return useMutation<void, Error, Document>({
    mutationFn: async (document) => {
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
  return useMutation<void, Error, DocumentId>({
    mutationFn: async (id) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteDocument(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

// ─── Resources ───────────────────────────────────────────────────────────────

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
  return useMutation<void, Error, Resource>({
    mutationFn: async (resource) => {
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
  return useMutation<void, Error, Resource>({
    mutationFn: async (resource) => {
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
  return useMutation<void, Error, ResourceId>({
    mutationFn: async (id) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteResource(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

// ─── Nominations (Employee of the Month) ─────────────────────────────────────

export function useGetAllEmployeeOfTheMonthNominations() {
  const { actor, isFetching } = useActor();
  return useQuery<EmployeeOfTheMonthNomination[]>({
    queryKey: ['employeeOfTheMonthNominations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEmployeeOfTheMonthNominations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitEmployeeOfTheMonthNomination() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<
    string,
    Error,
    { nomineeEmployeeId: EmployeeId; comment: string; submitterName: string | null }
  >({
    mutationFn: async ({ nomineeEmployeeId, comment, submitterName }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitEmployeeOfTheMonthNomination(nomineeEmployeeId, comment, submitterName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeOfTheMonthNominations'] });
    },
  });
}

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
    queryKey: ['nominationWinner', month],
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
  return useMutation<void, Error, { month: string; employeeId: EmployeeId }>({
    mutationFn: async ({ month, employeeId }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setMonthWinner(month, employeeId);
    },
    onSuccess: (_, { month }) => {
      queryClient.invalidateQueries({ queryKey: ['nominationWinner', month] });
    },
  });
}

export function useMarkWinnerBonus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (month) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markWinnerBonus(month);
    },
    onSuccess: (_, month) => {
      queryClient.invalidateQueries({ queryKey: ['nominationWinner', month] });
    },
  });
}

export function useSubmitNomination() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, Nomination>({
    mutationFn: async (nomination) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitNomination(nomination);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nominations'] });
    },
  });
}

// ─── Manager Notes ───────────────────────────────────────────────────────────

export function useGetManagerNotesByEmployee(employeeId: EmployeeId) {
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

export function useAddManagerNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, ManagerNote>({
    mutationFn: async (note) => {
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
  return useMutation<void, Error, ManagerNote>({
    mutationFn: async (note) => {
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
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteManagerNote(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managerNotes'] });
    },
  });
}

// ─── Inventory ───────────────────────────────────────────────────────────────

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

export function useGetAllItems() {
  const { actor, isFetching } = useActor();
  return useQuery<InventoryItem[]>({
    queryKey: ['inventoryItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllItems();
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
  return useMutation<void, Error, InventoryCategory>({
    mutationFn: async (category) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCategory(category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryCategories'] });
    },
  });
}

export function useAddItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, InventoryItem>({
    mutationFn: async (item) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addItem(item);
    },
    onSuccess: (_, item) => {
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryItems', item.categoryId] });
    },
  });
}

export function useUpdateInventoryItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, InventoryItem>({
    mutationFn: async (item) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateItem(item);
    },
    onSuccess: (_, item) => {
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryItems', item.categoryId] });
    },
  });
}

export function useDeleteItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, InventoryItemId>({
    mutationFn: async (itemId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteItem(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
    },
  });
}

// ─── Badges ──────────────────────────────────────────────────────────────────

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
  return useMutation<void, Error, Badge>({
    mutationFn: async (badge) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBadge(badge);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
    },
  });
}

export function useGetStaffBadges(employeeId: EmployeeId) {
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
  return useMutation<void, Error, StaffBadge>({
    mutationFn: async (assignment) => {
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
  return useMutation<void, Error, { assignmentId: StaffBadgeId; employeeId: EmployeeId }>({
    mutationFn: async ({ assignmentId }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeBadgeFromStaff(assignmentId);
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: ['staffBadges', employeeId] });
    },
  });
}

// ─── To-Do Tasks ─────────────────────────────────────────────────────────────

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

export function useGetTasksForToday(dayOfWeek: import('../backend').DayOfWeek) {
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
  return useMutation<void, Error, ToDoTask>({
    mutationFn: async (task) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTask(task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasksForToday'] });
    },
  });
}

export function useMarkTaskComplete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, TaskId>({
    mutationFn: async (taskId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markTaskComplete(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasksForToday'] });
    },
  });
}

// ─── Stock Requests ──────────────────────────────────────────────────────────

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

// Alias used by StockRequestArchivePage
export function useGetArchivedStockRequests() {
  return useGetStockRequestsByStatus(StockRequestStatusEnum.archived);
}

export function useCreateStockRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<
    StockRequestId,
    Error,
    {
      itemName: string;
      experience: string;
      quantity: bigint;
      notes: string;
      submitterName: string;
    }
  >({
    mutationFn: async ({ itemName, experience, quantity, notes, submitterName }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createStockRequest(itemName, experience, quantity, notes, submitterName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockRequests'] });
    },
  });
}

export function useUpdateStockRequestStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: StockRequestId; newStatus: StockRequestStatus }>({
    mutationFn: async ({ id, newStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStockRequestStatus(id, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockRequests'] });
    },
  });
}

export function useArchiveOldDeliveredRequests() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.archiveOldDeliveredRequests();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockRequests'] });
    },
  });
}

// Alias used by StockRequestsPage
export const useArchiveDeliveredRequests = useArchiveOldDeliveredRequests;

export function useGetStockRequestById(id: StockRequestId) {
  const { actor, isFetching } = useActor();
  return useQuery<StockRequest | null>({
    queryKey: ['stockRequest', id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStockRequestById(id);
    },
    enabled: !!actor && !isFetching,
  });
}
