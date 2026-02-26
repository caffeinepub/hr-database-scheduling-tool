import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import Nat8 "mo:core/Nat8";
import MixinAuthorization "authorization/MixinAuthorization";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";

// Persist authorization state across upgrades
actor {
  include MixinStorage();

  // Types
  type EmployeeId = Text;
  type RecordId = Text;
  type ShiftId = Text;
  type HolidayRequestId = Text;
  type DocumentId = Text;
  type ResourceId = Text;
  type NominationId = Text;
  type ManagerNoteId = Text;

  // Roles
  public type EmployeeRole = {
    #admin;
    #manager;
    #employee;
  };

  // State for user system, initialized on upgrade to new actor
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User approval state
  let approvalState = UserApproval.initState(accessControlState);

  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  // User Profile Type
  public type UserProfile = {
    name : Text;
    employeeId : ?EmployeeId;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Employee Type
  type Employee = {
    id : EmployeeId;
    fullName : Text;
    jobTitle : Text;
    department : Text;
    email : Text;
    phone : Text;
    startDate : Int;
    isActive : Bool;
    role : EmployeeRole;
    accountLevel : EmployeeRole;
  };

  module Employee {
    public func compareByName(a : Employee, b : Employee) : Order.Order {
      Text.compare(a.fullName, b.fullName);
    };
  };

  // Training Record Type
  type TrainingRecord = {
    id : RecordId;
    employeeId : EmployeeId;
    title : Text;
    description : Text;
    completionDate : ?Int;
    expiryDate : ?Int;
    status : TrainingStatus;
  };

  type TrainingStatus = {
    #completed;
    #inProgress;
    #pending;
  };

  // Sickness Record Type
  type SicknessRecord = {
    id : RecordId;
    employeeId : EmployeeId;
    absenceStartDate : Int;
    absenceEndDate : Int;
    reason : Text;
    returnNote : Text;
  };

  // Appraisal Record Type
  type AppraisalRecord = {
    id : RecordId;
    employeeId : EmployeeId;
    scheduledDate : Int;
    appraisalType : AppraisalType;
    notes : Text;
    isComplete : Bool;
  };

  type AppraisalType = {
    #annual;
    #probationary;
    #midYear;
  };

  // Shift Type
  type Shift = {
    id : ShiftId;
    date : Int;
    startTime : Int;
    endTime : Int;
    department : Text;
    assignedEmployees : [EmployeeId];
  };

  // Shift Note Type
  type ShiftNote = {
    id : RecordId;
    shiftId : ShiftId;
    employeeId : ?EmployeeId;
    noteText : Text;
    createdTimestamp : Int;
  };

  // Holiday Request Type
  type HolidayRequest = {
    id : HolidayRequestId;
    employeeId : EmployeeId;
    startDate : Int;
    endDate : Int;
    reason : ?Text;
    status : HolidayRequestStatus;
    createdAt : Int;
  };

  type HolidayRequestStatus = {
    #pending;
    #approved;
    #declined;
  };

  // Document Type
  type Document = {
    id : DocumentId;
    title : Text;
    description : Text;
    category : DocumentCategory;
    fileUrl : ?Text;
    content : ?Text;
    uploadedAt : Int;
    isVisible : Bool;
  };

  type DocumentCategory = {
    #handbook;
    #policy;
    #form;
    #other;
  };

  // Resource Type
  type Resource = {
    id : ResourceId;
    title : Text;
    category : ResourceCategory;
    content : Text;
    isRestricted : Bool;
    createdAt : Int;
  };

  type ResourceCategory = {
    #logins;
    #prices;
    #forms;
    #other;
  };

  // Nomination Type
  type Nomination = {
    id : NominationId;
    nominatorEmployeeId : EmployeeId;
    nomineeEmployeeId : EmployeeId;
    reason : Text;
    month : Text;
    submittedAt : Int;
  };

  // Nomination Winner Type
  type NominationWinner = {
    month : Text;
    employeeId : EmployeeId;
    hasReceivedBonus : Bool;
  };

  // Manager Note Type
  type ManagerNote = {
    id : ManagerNoteId;
    employeeId : EmployeeId;
    authorEmployeeId : EmployeeId;
    noteType : ManagerNoteType;
    content : Text;
    createdAt : Int;
  };

  type ManagerNoteType = {
    #general;
    #concern;
    #sickness;
    #performance;
  };

  // Storage
  let employeeMap = Map.empty<EmployeeId, Employee>();
  let trainingMap = Map.empty<RecordId, TrainingRecord>();
  let sicknessMap = Map.empty<RecordId, SicknessRecord>();
  let appraisalMap = Map.empty<RecordId, AppraisalRecord>();
  let shiftMap = Map.empty<ShiftId, Shift>();
  let shiftNoteMap = Map.empty<RecordId, ShiftNote>();
  let holidayRequestMap = Map.empty<HolidayRequestId, HolidayRequest>();
  let documentMap = Map.empty<DocumentId, Document>();
  let resourceMap = Map.empty<ResourceId, Resource>();
  let nominationMap = Map.empty<NominationId, Nomination>();
  let nominationWinnerMap = Map.empty<Text, NominationWinner>();
  let managerNoteMap = Map.empty<ManagerNoteId, ManagerNote>();

  // ─── Employees ───────────────────────────────────────────────────────────────
  // Admin only for mutations; any authenticated user can read (Staff Dashboard
  // is visible to Admin, Management, Supervisors — all of whom are #user or #admin).

  public shared ({ caller }) func addEmployee(employee : Employee) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add employees");
    };
    if (employeeMap.containsKey(employee.id)) {
      Runtime.trap("Employee already exists!");
    };
    employeeMap.add(employee.id, employee);
  };

  public shared ({ caller }) func updateEmployee(employee : Employee) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update employees");
    };
    switch (employeeMap.get(employee.id)) {
      case (null) { Runtime.trap("Employee does not exist!") };
      case (?_) { employeeMap.add(employee.id, employee) };
    };
  };

  public query ({ caller }) func getEmployee(id : EmployeeId) : async ?Employee {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view employees");
    };
    employeeMap.get(id);
  };

  public query ({ caller }) func getAllEmployees() : async [Employee] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view employees");
    };
    employeeMap.values().toArray().sort(Employee.compareByName);
  };

  // ─── Training Records ─────────────────────────────────────────────────────────
  // Mutations: admin only (plan: "assign training or knowledge records to staff").
  // Reads: any authenticated user (training records visible on employee profile).

  public shared ({ caller }) func addTrainingRecord(record : TrainingRecord) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add training records");
    };
    if (trainingMap.containsKey(record.id)) {
      Runtime.trap("Training record already exists!");
    };
    trainingMap.add(record.id, record);
  };

  public shared ({ caller }) func updateTrainingRecord(record : TrainingRecord) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update training records");
    };
    switch (trainingMap.get(record.id)) {
      case (null) { Runtime.trap("Training record does not exist!") };
      case (?_) { trainingMap.add(record.id, record) };
    };
  };

  public query ({ caller }) func getTrainingRecordsByEmployee(employeeId : EmployeeId) : async [TrainingRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view training records");
    };
    let iter = trainingMap.values().filter(
      func(record) { record.employeeId == employeeId }
    );
    iter.toArray();
  };

  // ─── Sickness Records ─────────────────────────────────────────────────────────
  // Mutations: admin only.
  // Reads: any authenticated user (statistics visible to Supervisors/Management).

  public shared ({ caller }) func addSicknessRecord(record : SicknessRecord) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add sickness records");
    };
    if (sicknessMap.containsKey(record.id)) {
      Runtime.trap("Sickness record already exists!");
    };
    sicknessMap.add(record.id, record);
  };

  public query ({ caller }) func getSicknessRecordsByEmployee(employeeId : EmployeeId) : async [SicknessRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view sickness records");
    };
    let iter = sicknessMap.values().filter(
      func(record) { record.employeeId == employeeId }
    );
    iter.toArray();
  };

  // ─── Appraisal Records ────────────────────────────────────────────────────────
  // Plan: "Admin and Management can add and edit appraisal records."
  // Represented as admin-only in the access-control module.

  public shared ({ caller }) func addAppraisalRecord(record : AppraisalRecord) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add appraisal records");
    };
    if (appraisalMap.containsKey(record.id)) {
      Runtime.trap("Appraisal record already exists!");
    };
    appraisalMap.add(record.id, record);
  };

  public shared ({ caller }) func updateAppraisalRecord(record : AppraisalRecord) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update appraisal records");
    };
    switch (appraisalMap.get(record.id)) {
      case (null) { Runtime.trap("Appraisal record does not exist!") };
      case (?_) { appraisalMap.add(record.id, record) };
    };
  };

  public query ({ caller }) func getAppraisalsByEmployee(employeeId : EmployeeId) : async [AppraisalRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view appraisal records");
    };
    let iter = appraisalMap.values().filter(
      func(record) { record.employeeId == employeeId }
    );
    iter.toArray();
  };

  // ─── Shifts ───────────────────────────────────────────────────────────────────
  // Plan: "Supervisors and Management can create/edit shifts."
  // In the 3-tier model these are #user; admin can also manage shifts.

  public shared ({ caller }) func addShift(shift : Shift) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only supervisors, management, or admins can add shifts");
    };
    if (shiftMap.containsKey(shift.id)) {
      Runtime.trap("Shift already exists!");
    };
    shiftMap.add(shift.id, shift);
  };

  public shared ({ caller }) func updateShift(shift : Shift) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only supervisors, management, or admins can update shifts");
    };
    switch (shiftMap.get(shift.id)) {
      case (null) { Runtime.trap("Shift does not exist!") };
      case (?_) { shiftMap.add(shift.id, shift) };
    };
  };

  public shared ({ caller }) func deleteShift(id : ShiftId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only supervisors, management, or admins can delete shifts");
    };
    if (not shiftMap.containsKey(id)) {
      Runtime.trap("Shift does not exist!");
    };
    shiftMap.remove(id);
  };

  public query ({ caller }) func getShiftsByEmployee(employeeId : EmployeeId) : async [Shift] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view shifts");
    };
    let result = List.empty<Shift>();
    for (shift in shiftMap.values()) {
      if (shift.assignedEmployees.values().any(func(eId) { eId == employeeId })) {
        result.add(shift);
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getAllShifts() : async [Shift] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view shifts");
    };
    shiftMap.values().toArray();
  };

  // ─── Shift Notes ──────────────────────────────────────────────────────────────
  // Mutations: supervisors/management/admin (#user and above).
  // Reads: any authenticated user.

  public shared ({ caller }) func addShiftNote(note : ShiftNote) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only supervisors, management, or admins can add shift notes");
    };
    if (shiftNoteMap.containsKey(note.id)) {
      Runtime.trap("Shift note already exists!");
    };
    shiftNoteMap.add(note.id, note);
  };

  public query ({ caller }) func getShiftNotesByShift(shiftId : ShiftId) : async [ShiftNote] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view shift notes");
    };
    let iter = shiftNoteMap.values().filter(
      func(note) { note.shiftId == shiftId }
    );
    iter.toArray();
  };

  // ─── Holiday Requests ─────────────────────────────────────────────────────────
  // Submit: any authenticated user (employees submit their own requests).
  // View own requests: any authenticated user.
  // View ALL requests / approve / reject: admin only
  //   (plan: "only Supervisors or Management (and Admin) can approve or reject").
  //   In the 3-tier model this maps to #admin.

  public shared ({ caller }) func submitHolidayRequest(request : HolidayRequest) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit holiday requests");
    };
    if (holidayRequestMap.containsKey(request.id)) {
      Runtime.trap("Holiday request already exists!");
    };
    holidayRequestMap.add(request.id, request);
  };

  // Any authenticated user can view requests for a specific employee
  // (employees view their own; supervisors/management view others).
  public query ({ caller }) func getHolidayRequestsByEmployee(employeeId : EmployeeId) : async [HolidayRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view holiday requests");
    };
    let iter = holidayRequestMap.values().filter(
      func(request) { request.employeeId == employeeId }
    );
    iter.toArray();
  };

  // Only admins (representing Supervisors/Management/Admin) can view the full queue.
  public query ({ caller }) func getAllHolidayRequests() : async [HolidayRequest] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only supervisors, management, or admins can view all holiday requests");
    };
    holidayRequestMap.values().toArray();
  };

  // Only admins (representing Supervisors/Management/Admin) can approve or reject.
  public shared ({ caller }) func updateHolidayRequestStatus(id : HolidayRequestId, status : HolidayRequestStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only supervisors, management, or admins can update holiday request status");
    };
    switch (holidayRequestMap.get(id)) {
      case (null) { Runtime.trap("Holiday request does not exist!") };
      case (?request) {
        let updatedRequest : HolidayRequest = { request with status };
        holidayRequestMap.add(id, updatedRequest);
      };
    };
  };

  // ─── Documents ────────────────────────────────────────────────────────────────
  // Mutations: admin only.
  // Reads: authenticated users see visible documents; admins see all.

  public shared ({ caller }) func addDocument(document : Document) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add documents");
    };
    if (documentMap.containsKey(document.id)) {
      Runtime.trap("Document already exists!");
    };
    documentMap.add(document.id, document);
  };

  public shared ({ caller }) func updateDocument(document : Document) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update documents");
    };
    switch (documentMap.get(document.id)) {
      case (null) { Runtime.trap("Document does not exist!") };
      case (?_) { documentMap.add(document.id, document) };
    };
  };

  public shared ({ caller }) func deleteDocument(id : DocumentId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete documents");
    };
    if (not documentMap.containsKey(id)) {
      Runtime.trap("Document does not exist!");
    };
    documentMap.remove(id);
  };

  public query ({ caller }) func getAllDocuments() : async [Document] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view documents");
    };
    if (AccessControl.isAdmin(accessControlState, caller)) {
      documentMap.values().toArray();
    } else {
      documentMap.values().filter(func(doc) { doc.isVisible }).toArray();
    };
  };

  // ─── Resources ────────────────────────────────────────────────────────────────
  // Mutations: admin only.
  // Reads: authenticated users see all resources; guests see only non-restricted.

  public shared ({ caller }) func addResource(resource : Resource) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add resources");
    };
    if (resourceMap.containsKey(resource.id)) {
      Runtime.trap("Resource already exists!");
    };
    resourceMap.add(resource.id, resource);
  };

  public shared ({ caller }) func updateResource(resource : Resource) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update resources");
    };
    switch (resourceMap.get(resource.id)) {
      case (null) { Runtime.trap("Resource does not exist!") };
      case (?_) { resourceMap.add(resource.id, resource) };
    };
  };

  public shared ({ caller }) func deleteResource(id : ResourceId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete resources");
    };
    if (not resourceMap.containsKey(id)) {
      Runtime.trap("Resource does not exist!");
    };
    resourceMap.remove(id);
  };

  public query ({ caller }) func getResources(category : ?ResourceCategory) : async [Resource] {
    let isUser = AccessControl.hasPermission(accessControlState, caller, #user);
    let allResources = switch (category) {
      case (null) { resourceMap.values().toArray() };
      case (?cat) {
        resourceMap.values().filter(func(resource) { resource.category == cat }).toArray();
      };
    };
    if (isUser) {
      // Authenticated users (including admins) see all resources
      allResources;
    } else {
      // Guests only see non-restricted resources
      allResources.filter(func(r : Resource) : Bool { not r.isRestricted });
    };
  };

  // ─── Nominations (Employee of the Month) ─────────────────────────────────────
  // Plan: "Any employee can submit a recommendation."
  //       "Submissions are visible only to Admin."
  //       "Admin can declare a winner and mark that the £50 bonus has been noted/awarded."

  public shared ({ caller }) func submitNomination(nomination : Nomination) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit nominations");
    };
    if (nominationMap.containsKey(nomination.id)) {
      Runtime.trap("Nomination already exists!");
    };
    // Enforce one nomination per nominator per month
    let existingNomination = nominationMap.values().filter(
      func(n) {
        n.nominatorEmployeeId == nomination.nominatorEmployeeId and n.month == nomination.month
      }
    ).next();
    switch (existingNomination) {
      case (?_) { Runtime.trap("Employee has already submitted a nomination for this month!") };
      case (null) { nominationMap.add(nomination.id, nomination) };
    };
  };

  // Admin only: nominations are visible only to Admin per the plan.
  public query ({ caller }) func getNominationsByMonth(month : Text) : async [Nomination] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view nominations");
    };
    let iter = nominationMap.values().filter(
      func(nomination) { nomination.month == month }
    );
    iter.toArray();
  };

  // Winner announcement is public to all authenticated users.
  public query ({ caller }) func getWinnerByMonth(month : Text) : async ?NominationWinner {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view winners");
    };
    nominationWinnerMap.get(month);
  };

  // Admin only: set the winner for a month.
  public shared ({ caller }) func setMonthWinner(month : Text, employeeId : EmployeeId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set the winner");
    };
    if (not employeeMap.containsKey(employeeId)) {
      Runtime.trap("Employee does not exist!");
    };
    let winner : NominationWinner = {
      month;
      employeeId;
      hasReceivedBonus = false;
    };
    nominationWinnerMap.add(month, winner);
  };

  // Admin only: mark bonus as received.
  public shared ({ caller }) func markWinnerBonus(month : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can mark winner bonus");
    };
    switch (nominationWinnerMap.get(month)) {
      case (null) { Runtime.trap("Winner does not exist!") };
      case (?winner) {
        let updatedWinner : NominationWinner = { winner with hasReceivedBonus = true };
        nominationWinnerMap.add(month, updatedWinner);
      };
    };
  };

  // ─── Manager Notes ────────────────────────────────────────────────────────────
  // Plan: "manager-only internal notes section that is hidden from the employee."
  // These must be admin-only so that regular employees (Team Members) cannot
  // read or write notes about themselves or others.

  public shared ({ caller }) func addManagerNote(note : ManagerNote) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add manager notes");
    };
    if (managerNoteMap.containsKey(note.id)) {
      Runtime.trap("Manager note already exists!");
    };
    managerNoteMap.add(note.id, note);
  };

  public query ({ caller }) func getManagerNotesByEmployee(employeeId : EmployeeId) : async [ManagerNote] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view manager notes");
    };
    let iter = managerNoteMap.values().filter(
      func(note) { note.employeeId == employeeId }
    );
    iter.toArray();
  };

  public shared ({ caller }) func updateManagerNote(note : ManagerNote) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update manager notes");
    };
    switch (managerNoteMap.get(note.id)) {
      case (null) { Runtime.trap("Manager note does not exist!") };
      case (?_) { managerNoteMap.add(note.id, note) };
    };
  };

  public shared ({ caller }) func deleteManagerNote(id : ManagerNoteId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete manager notes");
    };
    if (not managerNoteMap.containsKey(id)) {
      Runtime.trap("Manager note does not exist!");
    };
    managerNoteMap.remove(id);
  };
};
