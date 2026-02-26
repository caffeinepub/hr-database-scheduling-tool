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
export type RecordId = string;
export interface ShiftNote {
    id: RecordId;
    noteText: string;
    employeeId?: EmployeeId;
    createdTimestamp: bigint;
    shiftId: ShiftId;
}
export type NominationId = string;
export type EmployeeId = string;
export type ShiftId = string;
export type DocumentId = string;
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
export interface NominationWinner {
    month: string;
    hasReceivedBonus: boolean;
    employeeId: EmployeeId;
}
export interface HolidayRequest {
    id: HolidayRequestId;
    status: HolidayRequestStatus;
    endDate: bigint;
    createdAt: bigint;
    employeeId: EmployeeId;
    startDate: bigint;
    reason?: string;
}
export interface ManagerNote {
    id: ManagerNoteId;
    content: string;
    createdAt: bigint;
    noteType: ManagerNoteType;
    authorEmployeeId: EmployeeId;
    employeeId: EmployeeId;
}
export type ManagerNoteId = string;
export interface AppraisalRecord {
    id: RecordId;
    scheduledDate: bigint;
    appraisalType: AppraisalType;
    employeeId: EmployeeId;
    notes: string;
    isComplete: boolean;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export type HolidayRequestId = string;
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
export enum ResourceCategory {
    forms = "forms",
    other = "other",
    logins = "logins",
    prices = "prices"
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
    addDocument(document: Document): Promise<void>;
    addEmployee(employee: Employee): Promise<void>;
    addManagerNote(note: ManagerNote): Promise<void>;
    addResource(resource: Resource): Promise<void>;
    addShift(shift: Shift): Promise<void>;
    addShiftNote(note: ShiftNote): Promise<void>;
    addSicknessRecord(record: SicknessRecord): Promise<void>;
    addTrainingRecord(record: TrainingRecord): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteDocument(id: DocumentId): Promise<void>;
    deleteManagerNote(id: ManagerNoteId): Promise<void>;
    deleteResource(id: ResourceId): Promise<void>;
    deleteShift(id: ShiftId): Promise<void>;
    getAllDocuments(): Promise<Array<Document>>;
    getAllEmployees(): Promise<Array<Employee>>;
    getAllHolidayRequests(): Promise<Array<HolidayRequest>>;
    getAllShifts(): Promise<Array<Shift>>;
    getAppraisalsByEmployee(employeeId: EmployeeId): Promise<Array<AppraisalRecord>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEmployee(id: EmployeeId): Promise<Employee | null>;
    getHolidayRequestsByEmployee(employeeId: EmployeeId): Promise<Array<HolidayRequest>>;
    getManagerNotesByEmployee(employeeId: EmployeeId): Promise<Array<ManagerNote>>;
    getNominationsByMonth(month: string): Promise<Array<Nomination>>;
    getResources(category: ResourceCategory | null): Promise<Array<Resource>>;
    getShiftNotesByShift(shiftId: ShiftId): Promise<Array<ShiftNote>>;
    getShiftsByEmployee(employeeId: EmployeeId): Promise<Array<Shift>>;
    getSicknessRecordsByEmployee(employeeId: EmployeeId): Promise<Array<SicknessRecord>>;
    getTrainingRecordsByEmployee(employeeId: EmployeeId): Promise<Array<TrainingRecord>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWinnerByMonth(month: string): Promise<NominationWinner | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    markWinnerBonus(month: string): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setMonthWinner(month: string, employeeId: EmployeeId): Promise<void>;
    submitHolidayRequest(request: HolidayRequest): Promise<void>;
    submitNomination(nomination: Nomination): Promise<void>;
    updateAppraisalRecord(record: AppraisalRecord): Promise<void>;
    updateDocument(document: Document): Promise<void>;
    updateEmployee(employee: Employee): Promise<void>;
    updateHolidayRequestStatus(id: HolidayRequestId, status: HolidayRequestStatus): Promise<void>;
    updateManagerNote(note: ManagerNote): Promise<void>;
    updateResource(resource: Resource): Promise<void>;
    updateShift(shift: Shift): Promise<void>;
    updateTrainingRecord(record: TrainingRecord): Promise<void>;
}
