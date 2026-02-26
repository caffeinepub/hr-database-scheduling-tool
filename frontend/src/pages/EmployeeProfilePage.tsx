import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, Building2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetEmployee, useGetAllEmployees } from '../hooks/useQueries';
import TrainingTab from '../components/profile/TrainingTab';
import SicknessTab from '../components/profile/SicknessTab';
import AppraisalsTab from '../components/profile/AppraisalsTab';
import ManagerNotesTab from '../components/profile/ManagerNotesTab';
import BadgesTab from '../components/profile/BadgesTab';

export type Page =
  | 'dashboard'
  | 'employees'
  | 'employee-profile'
  | 'scheduling'
  | 'portal'
  | 'stock-requests'
  | 'inventory'
  | 'eom'
  | 'appraisals'
  | 'training-summary'
  | 'holiday-stats'
  | 'payroll-export'
  | 'approval-queue'
  | 'documents'
  | 'resources';

interface EmployeeProfilePageProps {
  employeeId: string;
  navigate: (page: Page, employeeId?: string) => void;
  isAdmin?: boolean;
  currentUserEmployeeId?: string;
}

function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp));
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getRoleStyle(role: string): { bg: string; text: string } {
  switch (role) {
    case 'admin':
      return { bg: 'oklch(0.48 0.22 27)', text: 'white' };
    case 'manager':
      return { bg: 'oklch(0.25 0.005 0)', text: 'white' };
    default:
      return { bg: 'oklch(0.88 0.003 0)', text: 'oklch(0.3 0.005 0)' };
  }
}

export default function EmployeeProfilePage({
  employeeId,
  navigate,
  isAdmin = false,
  currentUserEmployeeId,
}: EmployeeProfilePageProps) {
  const { data: employee, isLoading } = useGetEmployee(employeeId);
  const { data: allEmployees = [] } = useGetAllEmployees();
  const [activeTab, setActiveTab] = useState('training');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div
            className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: 'oklch(0.48 0.22 27)', borderTopColor: 'transparent' }}
          />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Employee not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('employees')}>
          Back to Staff
        </Button>
      </div>
    );
  }

  const roleStyle = getRoleStyle(employee.role as string);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('employees')}
        className="gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to Staff
      </Button>

      {/* Profile Header Card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: 'white',
          border: '1px solid oklch(0.88 0.003 0)',
          boxShadow: '0 2px 8px oklch(0.1 0.005 0 / 0.08)',
        }}
      >
        {/* Red accent bar */}
        <div className="h-2" style={{ backgroundColor: 'oklch(0.48 0.22 27)' }} />

        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl font-bold flex-shrink-0"
              style={{ backgroundColor: 'oklch(0.48 0.22 27)', color: 'white' }}
            >
              {employee.fullName.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">{employee.fullName}</h2>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide"
                  style={{ backgroundColor: roleStyle.bg, color: roleStyle.text }}
                >
                  {employee.role as string}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    employee.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {employee.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-3">{employee.jobTitle}</p>

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 size={14} style={{ color: 'oklch(0.48 0.22 27)' }} />
                  <span>{employee.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} style={{ color: 'oklch(0.48 0.22 27)' }} />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} style={{ color: 'oklch(0.48 0.22 27)' }} />
                  <span>{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} style={{ color: 'oklch(0.48 0.22 27)' }} />
                  <span>Started {formatDate(employee.startDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className="w-full justify-start rounded-xl p-1 h-auto flex-wrap gap-1"
          style={{ backgroundColor: 'oklch(0.94 0.003 0)' }}
        >
          {[
            { value: 'training', label: 'Training' },
            { value: 'sickness', label: 'Sickness' },
            { value: 'appraisals', label: 'Appraisals' },
            { value: 'badges', label: '🏅 Badges' },
            ...(isAdmin ? [{ value: 'notes', label: 'Manager Notes' }] : []),
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div
          className="mt-4 rounded-xl overflow-hidden"
          style={{
            backgroundColor: 'white',
            border: '1px solid oklch(0.88 0.003 0)',
            boxShadow: '0 2px 8px oklch(0.1 0.005 0 / 0.08)',
          }}
        >
          <TabsContent value="training" className="m-0 p-4">
            <TrainingTab employeeId={employeeId} />
          </TabsContent>
          <TabsContent value="sickness" className="m-0 p-4">
            <SicknessTab employeeId={employeeId} />
          </TabsContent>
          <TabsContent value="appraisals" className="m-0 p-4">
            <AppraisalsTab employeeId={employeeId} />
          </TabsContent>
          <TabsContent value="badges" className="m-0">
            <BadgesTab
              employeeId={employeeId}
              isAdmin={isAdmin}
              employees={allEmployees}
              currentUserEmployeeId={currentUserEmployeeId}
            />
          </TabsContent>
          {isAdmin && (
            <TabsContent value="notes" className="m-0">
              <ManagerNotesTab
                employeeId={employeeId}
                isAdmin={isAdmin}
                employees={allEmployees}
              />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}
