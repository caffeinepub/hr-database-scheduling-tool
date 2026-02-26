import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TrainingRecord {
    id: RecordId;
    status: TrainingStatus;
    title: string;
    completionDate?: bigint;
    expiryDate?: bigint;
    description: string;
    employeeId: EmployeeId;
}
export type StaffBadgeId = string;
export type CategoryId = string;
export interface Document {
    id: DocumentId;
    title: string;
    content?: string;
    description: string;
    isVisible: boolean;
    category: DocumentCategory;
    uploadedAt: bigint;
    fileUrl?: string;
}
export interface Shift {
    id: ShiftId;
    startTime: bigint;
    endTime: bigint;
    date: bigint;
    department: string;
    assignedEmployees: Array<EmployeeId>;
}
export type BadgeId = string;
export interface Badge {
    id: BadgeId;
    name: string;
    createdAt: bigint;
    description: string;
    category: string;
    iconKey: string;
}
export type NominationId = string;
export type RecordId = string;
export interface ShiftNote {
    id: RecordId;
    noteText: string;
    employeeId?: EmployeeId;
    createdTimestamp: bigint;
    shiftId: ShiftId;
}
export type Recurrence = {
    __kind__: "none";
    none: null;
} | {
    __kind__: "weekly";
    weekly: DayOfWeek;
};
export type TaskAssignee = {
    __kind__: "everyone";
    everyone: null;
} | {
    __kind__: "employee";
    employee: EmployeeId;
};
export type ShiftId = string;
export interface InventoryItem {
    categoryId: CategoryId;
    itemId: InventoryItemId;
    lastStocktakeBy?: string;
    expectedDeliveryDate?: bigint;
    orderStatus: OrderStatus;
    supplier: string;
    expiryDate?: bigint;
    name: string;
    size?: string;
    currentStockCount: bigint;
    lastStocktakeDate?: bigint;
    minimumStockLevel: bigint;
    price?: number;
    orderFrequency: string;
}
export interface InventoryCategory {
    categoryId: CategoryId;
    name: string;
    description: string;
}
export interface NominationWinner {
    month: string;
    hasReceivedBonus: boolean;
    employeeId: EmployeeId;
}
export type StockRequestId = bigint;
export interface EmployeeOfTheMonthNomination {
    id: string;
    submitterName?: string;
    nomineeEmployeeId: EmployeeId;
    submitterPrincipal?: Principal;
    comment: string;
    timestamp: bigint;
}
export type EmployeeId = string;
export interface StaffBadge {
    id: StaffBadgeId;
    assignedAt: bigint;
    assignedBy: EmployeeId;
    note?: string;
    badgeId: BadgeId;
    employeeId: EmployeeId;
}
export interface Employee {
    id: EmployeeId;
    role: EmployeeRole;
    fullName: string;
    isActive: boolean;
    email: string;
    jobTitle: string;
    phone: string;
    department: string;
    startDate: bigint;
    accountLevel: EmployeeRole;
}
export type DocumentId = string;
export interface HolidayRequest {
    id: HolidayRequestId;
    status: HolidayRequestStatus;
    endDate: bigint;
    createdAt: bigint;
    employeeId: EmployeeId;
    startDate: bigint;
    reason?: string;
}
export interface ToDoTask {
    id: TaskId;
    durationMins: bigint;
    completedBy?: Principal;
    assignee: TaskAssignee;
    title: string;
    creator: Principal;
    date?: bigint;
    description: string;
    recurrence: Recurrence;
    completedTimestamp?: bigint;
    createdTimestamp: bigint;
}
export type ManagerNoteId = string;
export interface ManagerNote {
    id: ManagerNoteId;
    content: string;
    createdAt: bigint;
    noteType: ManagerNoteType;
    authorEmployeeId: EmployeeId;
    employeeId: EmployeeId;
}
export interface AppraisalRecord {
    id: RecordId;
    scheduledDate: bigint;
    appraisalType: AppraisalType;
    employeeId: EmployeeId;
    notes: string;
    isComplete: boolean;
}
export type InventoryItemId = string;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export type TaskId = string;
export interface StockRequest {
    id: StockRequestId;
    status: StockRequestStatus;
    submitterName: string;
    experience: string;
    notes: string;
    createdTimestamp: bigint;
    itemName: string;
    quantity: bigint;
    deliveredTimestamp?: bigint;
}
export interface SicknessRecord {
    id: RecordId;
    absenceStartDate: bigint;
    absenceEndDate: bigint;
    employeeId: EmployeeId;
    returnNote: string;
    reason: string;
}
export interface Resource {
    id: ResourceId;
    title: string;
    content: string;
    createdAt: bigint;
    isRestricted: boolean;
    category: ResourceCategory;
}
export type HolidayRequestId = string;
export type ResourceId = string;
export interface Nomination {
    id: NominationId;
    month: string;
    nomineeEmployeeId: EmployeeId;
    submittedAt: bigint;
    nominatorEmployeeId: EmployeeId;
    reason: string;
}
export interface UserProfile {
    name: string;
    employeeId?: EmployeeId;
}
export enum AppraisalType {
    annual = "annual",
    midYear = "midYear",
    probationary = "probationary"
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum DayOfWeek {
    tuesday = "tuesday",
    wednesday = "wednesday",
    saturday = "saturday",
    thursday = "thursday",
    sunday = "sunday",
    friday = "friday",
    monday = "monday"
}
export enum DocumentCategory {
    other = "other",
    form = "form",
    handbook = "handbook",
    policy = "policy"
}
export enum EmployeeRole {
    manager = "manager",
    admin = "admin",
    employee = "employee"
}
export enum HolidayRequestStatus {
    pending = "pending",
    approved = "approved",
    declined = "declined"
}
export enum ManagerNoteType {
    concern = "concern",
    sickness = "sickness",
    performance = "performance",
    general = "general"
}
export enum OrderStatus {
    ok = "ok",
    orderRequired = "orderRequired",
    ordered = "ordered"
}
export enum ResourceCategory {
    forms = "forms",
    other = "other",
    logins = "logins",
    prices = "prices"
}
export enum StockRequestStatus {
    requested = "requested",
    ordered = "ordered",
    delivered = "delivered",
    archived = "archived"
}
export enum TrainingStatus {
    pending = "pending",
    completed = "completed",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAppraisalRecord(record: AppraisalRecord): Promise<void>;
    addBadge(badge: Badge): Promise<void>;
    addCategory(category: InventoryCategory): Promise<void>;
    addDocument(document: Document): Promise<void>;
    addEmployee(employee: Employee): Promise<void>;
    addItem(item: InventoryItem): Promise<void>;
    addManagerNote(note: ManagerNote): Promise<void>;
    addResource(resource: Resource): Promise<void>;
    addShift(shift: Shift): Promise<void>;
    addShiftNote(note: ShiftNote): Promise<void>;
    addSicknessRecord(record: SicknessRecord): Promise<void>;
    addTrainingRecord(record: TrainingRecord): Promise<void>;
    archiveOldDeliveredRequests(): Promise<void>;
    assignBadgeToStaff(assignment: StaffBadge): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createStockRequest(itemName: string, experience: string, quantity: bigint, notes: string, submitterName: string): Promise<StockRequestId>;
    createTask(task: ToDoTask): Promise<void>;
    deleteDocument(id: DocumentId): Promise<void>;
    deleteItem(itemId: InventoryItemId): Promise<void>;
    deleteManagerNote(id: ManagerNoteId): Promise<void>;
    deleteResource(id: ResourceId): Promise<void>;
    deleteShift(id: ShiftId): Promise<void>;
    deleteTrainingRecord(recordId: RecordId): Promise<void>;
    getAllCategories(): Promise<Array<InventoryCategory>>;
    getAllDocuments(): Promise<Array<Document>>;
    getAllEmployeeOfTheMonthNominations(): Promise<Array<EmployeeOfTheMonthNomination>>;
    getAllEmployees(): Promise<Array<Employee>>;
    getAllHolidayRequests(): Promise<Array<HolidayRequest>>;
    getAllItems(): Promise<Array<InventoryItem>>;
    getAllShifts(): Promise<Array<Shift>>;
    getAppraisalsByEmployee(employeeId: EmployeeId): Promise<Array<AppraisalRecord>>;
    getBadges(): Promise<Array<Badge>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEmployee(id: EmployeeId): Promise<Employee | null>;
    getEmployeeOfTheMonthNominationsByEmployee(employeeId: EmployeeId): Promise<Array<EmployeeOfTheMonthNomination>>;
    getHolidayRequestsByEmployee(employeeId: EmployeeId): Promise<Array<HolidayRequest>>;
    getItemsByCategory(categoryId: CategoryId): Promise<Array<InventoryItem>>;
    getManagerNotesByEmployee(employeeId: EmployeeId): Promise<Array<ManagerNote>>;
    getNominationsByMonth(month: string): Promise<Array<Nomination>>;
    getResources(category: ResourceCategory | null): Promise<Array<Resource>>;
    getShiftNotesByShift(shiftId: ShiftId): Promise<Array<ShiftNote>>;
    getShiftsByEmployee(employeeId: EmployeeId): Promise<Array<Shift>>;
    getSicknessRecordsByEmployee(employeeId: EmployeeId): Promise<Array<SicknessRecord>>;
    getStaffBadges(employeeId: EmployeeId): Promise<Array<StaffBadge>>;
    getStockRequestById(id: StockRequestId): Promise<StockRequest | null>;
    getStockRequestsByStatus(status: StockRequestStatus): Promise<Array<StockRequest>>;
    getTasks(): Promise<Array<ToDoTask>>;
    getTasksForToday(dayOfWeek: DayOfWeek): Promise<Array<ToDoTask>>;
    getTrainingRecordsByEmployee(employeeId: EmployeeId): Promise<Array<TrainingRecord>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWinnerByMonth(month: string): Promise<NominationWinner | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    markAdminLoggedInSuccessfully(): Promise<boolean>;
    markTaskComplete(taskId: TaskId): Promise<void>;
    markWinnerBonus(month: string): Promise<void>;
    removeBadgeFromStaff(assignmentId: StaffBadgeId): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setMonthWinner(month: string, employeeId: EmployeeId): Promise<void>;
    submitEmployeeOfTheMonthNomination(nomineeEmployeeId: EmployeeId, comment: string, submitterName: string | null): Promise<string>;
    submitHolidayRequest(request: HolidayRequest): Promise<void>;
    submitNomination(nomination: Nomination): Promise<void>;
    updateAppraisalRecord(record: AppraisalRecord): Promise<void>;
    updateDocument(document: Document): Promise<void>;
    updateEmployee(employee: Employee): Promise<void>;
    updateHolidayRequestStatus(id: HolidayRequestId, status: HolidayRequestStatus): Promise<void>;
    updateItem(item: InventoryItem): Promise<void>;
    updateManagerNote(note: ManagerNote): Promise<void>;
    updateResource(resource: Resource): Promise<void>;
    updateShift(shift: Shift): Promise<void>;
    updateStockRequestStatus(id: StockRequestId, newStatus: StockRequestStatus): Promise<void>;
    updateTrainingRecord(record: TrainingRecord): Promise<void>;
}
