import React, { useState } from 'react';
import { Award, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useGetStaffBadges, useGetBadges, useRemoveBadgeFromStaff } from '../../hooks/useQueries';
import type { Employee, StaffBadge as StaffBadgeType } from '../../backend';
import AssignBadgeModal from './AssignBadgeModal';

interface BadgesTabProps {
  employeeId: string;
  isAdmin: boolean;
  employees: Employee[];
  currentUserEmployeeId?: string;
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  Attendance: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  Performance: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Experience: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Team: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  Milestone: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
};

function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp));
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BadgesTab({ employeeId, isAdmin, employees, currentUserEmployeeId }: BadgesTabProps) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const { data: staffBadges, isLoading: badgesLoading } = useGetStaffBadges(employeeId);
  const { data: allBadges } = useGetBadges();
  const removeBadge = useRemoveBadgeFromStaff();

  const getBadgeDefinition = (badgeId: string) =>
    allBadges?.find((b) => b.id === badgeId);

  const getEmployeeName = (empId: string) =>
    employees.find((e) => e.id === empId)?.fullName ?? empId;

  const handleRemove = (assignment: StaffBadgeType) => {
    if (!confirm('Remove this badge from the employee?')) return;
    removeBadge.mutate({ assignmentId: assignment.id, employeeId });
  };

  if (badgesLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award size={20} style={{ color: 'oklch(0.48 0.22 27)' }} />
          <h3 className="font-semibold text-gray-900">
            Achievement Badges
            {staffBadges && staffBadges.length > 0 && (
              <span
                className="ml-2 text-sm font-normal px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'oklch(0.48 0.22 27)', color: 'white' }}
              >
                {staffBadges.length}
              </span>
            )}
          </h3>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            onClick={() => setShowAssignModal(true)}
            className="gap-2"
            style={{ backgroundColor: 'oklch(0.48 0.22 27)', color: 'white' }}
          >
            <Plus size={16} />
            Assign Badge
          </Button>
        )}
      </div>

      {/* Empty state */}
      {(!staffBadges || staffBadges.length === 0) && (
        <div className="text-center py-12 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-3">🏅</div>
          <p className="text-gray-500 font-medium">No badges assigned yet</p>
          <p className="text-gray-400 text-sm mt-1">
            {isAdmin ? 'Click "Assign Badge" to recognise this employee.' : 'Badges will appear here when assigned by a manager.'}
          </p>
        </div>
      )}

      {/* Badge grid */}
      {staffBadges && staffBadges.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {staffBadges.map((assignment) => {
            const badgeDef = getBadgeDefinition(assignment.badgeId);
            const category = badgeDef?.category ?? 'Other';
            const colors = categoryColors[category] ?? { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };

            return (
              <div
                key={assignment.id}
                className={`relative rounded-xl border-2 p-4 ${colors.bg} ${colors.border} transition-shadow hover:shadow-md`}
              >
                {/* Remove button */}
                {isAdmin && (
                  <button
                    onClick={() => handleRemove(assignment)}
                    disabled={removeBadge.isPending}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-red-100"
                    title="Remove badge"
                  >
                    <Trash2 size={14} className="text-red-400 hover:text-red-600" />
                  </button>
                )}

                {/* Badge content */}
                <div className="flex items-start gap-3 pr-8">
                  <div className="text-3xl leading-none flex-shrink-0">
                    {badgeDef?.iconKey ?? '🏅'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">
                        {badgeDef?.name ?? assignment.badgeId}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.text} border ${colors.border}`}>
                        {category}
                      </span>
                    </div>
                    {badgeDef?.description && (
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                        {badgeDef.description}
                      </p>
                    )}
                    {assignment.note && (
                      <p className="text-xs text-gray-500 mt-1 italic">
                        "{assignment.note}"
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <span>Awarded by {getEmployeeName(assignment.assignedBy)}</span>
                      <span>·</span>
                      <span>{formatDate(assignment.assignedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Badge Modal */}
      {showAssignModal && (
        <AssignBadgeModal
          open={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          employeeId={employeeId}
          assignedBy={currentUserEmployeeId ?? ''}
        />
      )}
    </div>
  );
}
