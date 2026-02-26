import { useState } from 'react';
import {
  useGetWinnerByMonth,
  useGetNominationsByMonth,
  useSubmitNomination,
  useSetMonthWinner,
  useMarkWinnerBonus,
  useGetAllEmployees,
  useGetCallerUserProfile,
  useIsCallerAdmin,
} from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Trophy, Award, Loader2, CheckCircle } from 'lucide-react';
import { generateId, dateToNanoseconds, getCurrentMonth } from '../lib/utils';
import type { Nomination } from '../backend';
import { toast } from 'sonner';

export default function EmployeeOfMonthPage() {
  const currentMonth = getCurrentMonth();
  const [nomineeId, setNomineeId] = useState('');
  const [reason, setReason] = useState('');
  const [selectedWinnerId, setSelectedWinnerId] = useState('');

  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: employees } = useGetAllEmployees();
  const { data: winner, isLoading: winnerLoading } = useGetWinnerByMonth(currentMonth);
  const { data: nominations, isLoading: nominationsLoading } = useGetNominationsByMonth(currentMonth);

  const submitNomination = useSubmitNomination();
  const setMonthWinner = useSetMonthWinner();
  const markBonus = useMarkWinnerBonus();

  const myEmployeeId = userProfile?.employeeId ?? '';

  // Check if current user already nominated this month
  const alreadyNominated = (nominations || []).some(
    (n) => n.nominatorEmployeeId === myEmployeeId
  );

  // Tally nominations
  const tally = (nominations || []).reduce((acc, n) => {
    acc[n.nomineeEmployeeId] = (acc[n.nomineeEmployeeId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tallyEntries = Object.entries(tally).sort((a, b) => b[1] - a[1]);

  const getEmployeeName = (id: string) =>
    employees?.find((e) => e.id === id)?.fullName ?? id;

  const winnerEmployee = winner ? employees?.find((e) => e.id === winner.employeeId) : null;

  const handleSubmitNomination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myEmployeeId) {
      toast.error('Your account is not linked to an employee record.');
      return;
    }
    if (nomineeId === myEmployeeId) {
      toast.error('You cannot nominate yourself.');
      return;
    }

    const nomination: Nomination = {
      id: generateId(),
      nominatorEmployeeId: myEmployeeId,
      nomineeEmployeeId: nomineeId,
      reason,
      month: currentMonth,
      submittedAt: dateToNanoseconds(new Date()),
    };

    try {
      await submitNomination.mutateAsync(nomination);
      toast.success('Nomination submitted!');
      setNomineeId('');
      setReason('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit nomination');
    }
  };

  const handleSetWinner = async () => {
    if (!selectedWinnerId) return;
    try {
      await setMonthWinner.mutateAsync({ month: currentMonth, employeeId: selectedWinnerId });
      toast.success('Winner declared!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to set winner');
    }
  };

  const handleMarkBonus = async () => {
    try {
      await markBonus.mutateAsync(currentMonth);
      toast.success('Bonus marked as received!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to mark bonus');
    }
  };

  const monthLabel = new Date(currentMonth + '-01').toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Employee of the Month</h1>
        <p className="text-muted-foreground">{monthLabel} — Winner receives a £50 bonus!</p>
      </div>

      {/* Winner Display */}
      <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <CardTitle className="text-yellow-800">This Month's Winner</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {winnerLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : winnerEmployee ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-yellow-200 flex items-center justify-center text-2xl font-bold text-yellow-700">
                {winnerEmployee.fullName.charAt(0)}
              </div>
              <div>
                <p className="text-xl font-bold text-yellow-900">{winnerEmployee.fullName}</p>
                <p className="text-yellow-700 text-sm">{winnerEmployee.jobTitle} — {winnerEmployee.department}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-200 text-yellow-800 border border-yellow-300">
                    <Award className="w-3 h-3" />
                    £50 Bonus
                  </span>
                  {winner?.hasReceivedBonus && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                      <CheckCircle className="w-3 h-3" />
                      Bonus Received
                    </span>
                  )}
                </div>
              </div>
              {isAdmin && !winner?.hasReceivedBonus && (
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto"
                  onClick={handleMarkBonus}
                  disabled={markBonus.isPending}
                >
                  {markBonus.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Mark Bonus Paid'}
                </Button>
              )}
            </div>
          ) : (
            <p className="text-yellow-700 text-sm py-2">No winner declared yet for this month.</p>
          )}
        </CardContent>
      </Card>

      {/* Nomination Form */}
      {!alreadyNominated && myEmployeeId ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Submit Your Nomination</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitNomination} className="space-y-4">
              <div className="space-y-2">
                <Label>Nominate a Colleague</Label>
                <Select value={nomineeId} onValueChange={setNomineeId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(employees || [])
                      .filter((e) => e.id !== myEmployeeId && e.isActive)
                      .map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.fullName} — {e.jobTitle}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reason for Nomination</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why do you think this person deserves Employee of the Month?"
                  rows={3}
                  required
                />
              </div>
              <Button type="submit" disabled={submitNomination.isPending || !nomineeId}>
                {submitNomination.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                ) : (
                  <><Star className="w-4 h-4 mr-2" />Submit Nomination</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : alreadyNominated ? (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 text-sm font-medium">You have already submitted your nomination for this month.</p>
          </CardContent>
        </Card>
      ) : null}

      {/* Admin: Nomination Tallies & Set Winner */}
      {isAdmin && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Nomination Tallies (Admin)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {nominationsLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : tallyEntries.length === 0 ? (
              <p className="text-muted-foreground text-sm">No nominations yet this month.</p>
            ) : (
              <div className="space-y-2">
                {tallyEntries.map(([empId, count]) => (
                  <div key={empId} className="flex items-center justify-between p-2 bg-muted/40 rounded-lg">
                    <span className="font-medium text-sm">{getEmployeeName(empId)}</span>
                    <span className="text-sm font-bold text-primary">{count} vote{count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            )}

            {!winner && (
              <div className="border-t border-border pt-4 space-y-3">
                <Label>Declare Winner</Label>
                <div className="flex gap-2">
                  <Select value={selectedWinnerId} onValueChange={setSelectedWinnerId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select winner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(employees || []).filter((e) => e.isActive).map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleSetWinner}
                    disabled={!selectedWinnerId || setMonthWinner.isPending}
                  >
                    {setMonthWinner.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Declare'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
