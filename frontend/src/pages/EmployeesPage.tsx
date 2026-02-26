import React, { useState } from "react";
import { useGetAllEmployees, useAddEmployee, useUpdateEmployee, useIsCallerAdmin } from "../hooks/useQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, User, Edit, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateId, dateToNanoseconds } from "../lib/utils";
import { EmployeeRole } from "../backend";
import type { Employee } from "../backend";
import { toast } from "sonner";

type Page = "dashboard" | "employees" | "employee-profile" | "scheduling" | "portal" | "stock-requests" | "inventory" | "eom" | "appraisals" | "training-summary" | "holiday-stats" | "payroll-export" | "approval-queue" | "documents" | "resources";

interface EmployeesPageProps {
  navigate: (page: Page, employeeId?: string) => void;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Management",
  employee: "Team Member",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-primary text-primary-foreground",
  manager: "bg-blue-600 text-white",
  employee: "bg-secondary text-foreground",
};

export default function EmployeesPage({ navigate }: EmployeesPageProps) {
  const { data: employees, isLoading } = useGetAllEmployees();
  const { data: isAdmin } = useIsCallerAdmin();
  const addEmployee = useAddEmployee();
  const updateEmployee = useUpdateEmployee();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    jobTitle: "",
    department: "",
    phone: "",
    role: "employee" as EmployeeRole,
    accountLevel: "employee" as EmployeeRole,
  });

  const filtered = employees?.filter((e) =>
    e.fullName.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.jobTitle.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const resetForm = () => {
    setForm({ fullName: "", email: "", jobTitle: "", department: "", phone: "", role: EmployeeRole.employee, accountLevel: EmployeeRole.employee });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const employee: Employee = {
        id: generateId(),
        fullName: form.fullName,
        email: form.email,
        jobTitle: form.jobTitle,
        department: form.department,
        phone: form.phone,
        role: form.role,
        accountLevel: form.accountLevel,
        isActive: true,
        startDate: dateToNanoseconds(new Date()),
      };
      await addEmployee.mutateAsync(employee);
      toast.success("Employee added successfully");
      setShowAddModal(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to add employee");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmployee) return;
    try {
      await updateEmployee.mutateAsync({
        ...editEmployee,
        fullName: form.fullName,
        email: form.email,
        jobTitle: form.jobTitle,
        department: form.department,
        phone: form.phone,
        role: form.role,
        accountLevel: form.accountLevel,
      });
      toast.success("Employee updated successfully");
      setEditEmployee(null);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to update employee");
    }
  };

  const openEdit = (emp: Employee) => {
    setEditEmployee(emp);
    setForm({
      fullName: emp.fullName,
      email: emp.email,
      jobTitle: emp.jobTitle,
      department: emp.department,
      phone: emp.phone,
      role: emp.role,
      accountLevel: emp.accountLevel,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">All Employees</h2>
          <p className="text-muted-foreground">{employees?.length || 0} staff members</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus size={16} className="mr-2" />
            Add Employee
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employees..."
          className="pl-9 bg-input border-border text-foreground"
        />
      </div>

      {/* Employee List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((emp) => (
            <div key={emp.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{emp.fullName}</p>
                    <p className="text-xs text-muted-foreground">{emp.jobTitle}</p>
                  </div>
                </div>
                <Badge className={`text-xs ${ROLE_COLORS[emp.accountLevel] || ROLE_COLORS.employee}`}>
                  {ROLE_LABELS[emp.accountLevel] || emp.accountLevel}
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground mb-4">
                <p>{emp.email}</p>
                <p>{emp.department}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-secondary"
                  onClick={() => navigate("employee-profile", emp.id)}
                >
                  <Eye size={14} className="mr-1" />
                  View
                </Button>
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border text-foreground hover:bg-secondary"
                    onClick={() => openEdit(emp)}
                  >
                    <Edit size={14} />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              No employees found
            </div>
          )}
        </div>
      )}

      {/* Add Employee Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add New Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground text-sm">Full Name</Label>
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="bg-input border-border text-foreground mt-1" required />
              </div>
              <div>
                <Label className="text-foreground text-sm">Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-input border-border text-foreground mt-1" required />
              </div>
              <div>
                <Label className="text-foreground text-sm">Job Title</Label>
                <Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className="bg-input border-border text-foreground mt-1" required />
              </div>
              <div>
                <Label className="text-foreground text-sm">Department</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="bg-input border-border text-foreground mt-1" />
              </div>
              <div>
                <Label className="text-foreground text-sm">Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-input border-border text-foreground mt-1" />
              </div>
              <div>
                <Label className="text-foreground text-sm">Account Level</Label>
                <Select value={form.accountLevel} onValueChange={(v) => setForm({ ...form, accountLevel: v as EmployeeRole, role: v as EmployeeRole })}>
                  <SelectTrigger className="bg-input border-border text-foreground mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value={EmployeeRole.employee}>Team Member</SelectItem>
                    <SelectItem value={EmployeeRole.manager}>Management/Supervisor</SelectItem>
                    <SelectItem value={EmployeeRole.admin}>Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1 border-border text-foreground">Cancel</Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={addEmployee.isPending}>
                {addEmployee.isPending ? "Adding..." : "Add Employee"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Modal */}
      <Dialog open={!!editEmployee} onOpenChange={(o) => !o && setEditEmployee(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground text-sm">Full Name</Label>
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="bg-input border-border text-foreground mt-1" required />
              </div>
              <div>
                <Label className="text-foreground text-sm">Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-input border-border text-foreground mt-1" required />
              </div>
              <div>
                <Label className="text-foreground text-sm">Job Title</Label>
                <Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className="bg-input border-border text-foreground mt-1" required />
              </div>
              <div>
                <Label className="text-foreground text-sm">Department</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="bg-input border-border text-foreground mt-1" />
              </div>
              <div>
                <Label className="text-foreground text-sm">Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-input border-border text-foreground mt-1" />
              </div>
              <div>
                <Label className="text-foreground text-sm">Account Level</Label>
                <Select value={form.accountLevel} onValueChange={(v) => setForm({ ...form, accountLevel: v as EmployeeRole, role: v as EmployeeRole })}>
                  <SelectTrigger className="bg-input border-border text-foreground mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value={EmployeeRole.employee}>Team Member</SelectItem>
                    <SelectItem value={EmployeeRole.manager}>Management/Supervisor</SelectItem>
                    <SelectItem value={EmployeeRole.admin}>Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditEmployee(null)} className="flex-1 border-border text-foreground">Cancel</Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={updateEmployee.isPending}>
                {updateEmployee.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
