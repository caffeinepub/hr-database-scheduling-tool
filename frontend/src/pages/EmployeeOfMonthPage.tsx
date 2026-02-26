import React, { useState } from 'react';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useGetAllEmployees } from '../hooks/useQueries';
import { useGetAllEmployeeOfTheMonthNominations } from '../hooks/useQueries';
import { useSubmitEmployeeOfTheMonthNomination } from '../hooks/useQueries';
import { useGetWinnerByMonth, useSetMonthWinner, useMarkWinnerBonus } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Trophy, Star, Users, Award, Loader2, MessageSquare, User } from 'lucide-react';
import type { Employee, EmployeeOfTheMonthNomination } from '../backend';

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);

function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  const date = new Date(parseInt(year), parseInt(m) - 1, 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export default function EmployeeOfMonthPage() {
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: employees = [] } = useGetAllEmployees();
  const { data: nominations = [], isLoading: nominationsLoading } = useGetAllEmployeeOfTheMonthNominations();
  const { data: winner, isLoading: winnerLoading } = useGetWinnerByMonth(CURRENT_MONTH);
  const { data: userProfile } = useGetCallerUserProfile();

  const setMonthWinner = useSetMonthWinner();
  const markBonus = useMarkWinnerBonus();
  const submitNomination = useSubmitEmployeeOfTheMonthNomination();

  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
  const [nomineeId, setNomineeId] = useState('');
  const [comment, setComment] = useState('');
  const [winnerEmployeeId, setWinnerEmployeeId] = useState('');

  const activeEmployees = employees.filter((e) => e.isActive);

  const currentMonthNominations = nominations.filter(
    (n) => {
      // Group by month using timestamp
      const nomMonth = new Date(Number(n.timestamp) / 1_000_000).toISOString().slice(0, 7);
      return nomMonth === selectedMonth;
    }
  );

  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? emp.fullName : id;
  };

  const handleSubmitNomination = async () => {
    if (!nomineeId) {
      toast.error('Please select a nominee');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please add a comment for your nomination');
      return;
    }
    try {
      await submitNomination.mutateAsync({
        nomineeEmployeeId: nomineeId,
        comment: comment.trim(),
        submitterName: userProfile?.name ?? null,
      });
      toast.success('Nomination submitted successfully!');
      setNomineeId('');
      setComment('');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to submit nomination');
    }
  };

  const handleSetWinner = async () => {
    if (!winnerEmployeeId) {
      toast.error('Please select a winner');
      return;
    }
    try {
      await setMonthWinner.mutateAsync({ month: CURRENT_MONTH, employeeId: winnerEmployeeId });
      toast.success('Winner set successfully!');
      setWinnerEmployeeId('');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to set winner');
    }
  };

  const handleMarkBonus = async () => {
    try {
      await markBonus.mutateAsync(CURRENT_MONTH);
      toast.success('Bonus marked as received!');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to mark bonus');
    }
  };

  // Group nominations by nominee for summary
  const nominationsByNominee = currentMonthNominations.reduce<Record<string, EmployeeOfTheMonthNomination[]>>(
    (acc, nom) => {
      if (!acc[nom.nomineeEmployeeId]) acc[nom.nomineeEmployeeId] = [];
      acc[nom.nomineeEmployeeId].push(nom);
      return acc;
    },
    {}
  );

  const winnerEmployee = winner ? employees.find((e) => e.id === winner.employeeId) : null;

  // Generate month options (last 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().slice(0, 7);
  });

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Trophy className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-display text-foreground">Employee of the Month</h1>
          <p className="text-muted-foreground text-sm">Recognise outstanding team members</p>
        </div>
      </div>

      {/* Current Winner Banner */}
      {!winnerLoading && winnerEmployee && (
        <Card className="border-2 border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <Trophy className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                  {formatMonth(CURRENT_MONTH)} Winner
                </p>
                <h2 className="text-2xl font-display text-foreground">{winnerEmployee.fullName}</h2>
                <p className="text-muted-foreground text-sm">{winnerEmployee.jobTitle}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {winner?.hasReceivedBonus ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ✓ Bonus Received
                  </Badge>
                ) : (
                  isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleMarkBonus}
                      disabled={markBonus.isPending}
                    >
                      {markBonus.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <Award className="w-4 h-4 mr-1" />
                      )}
                      Mark Bonus Received
                    </Button>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nomination Form - visible to all authenticated users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Star className="w-5 h-5 text-primary" />
            Submit a Nomination
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nominee-select">Nominate an Employee</Label>
            <Select value={nomineeId} onValueChange={setNomineeId}>
              <SelectTrigger id="nominee-select">
                <SelectValue placeholder="Select an employee to nominate..." />
              </SelectTrigger>
              <SelectContent>
                {activeEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.fullName} — {emp.jobTitle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomination-comment">Why do they deserve it?</Label>
            <Textarea
              id="nomination-comment"
              placeholder="Tell us why this person deserves Employee of the Month..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleSubmitNomination}
            disabled={submitNomination.isPending || !nomineeId || !comment.trim()}
            className="w-full sm:w-auto"
          >
            {submitNomination.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Star className="w-4 h-4 mr-2" />
                Submit Nomination
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Admin Section */}
      {isAdmin && (
        <>
          {/* Month Selector */}
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium whitespace-nowrap">View nominations for:</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((m) => (
                  <SelectItem key={m} value={m}>
                    {formatMonth(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nominations Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Users className="w-5 h-5 text-primary" />
                Nominations — {formatMonth(selectedMonth)}
                <Badge variant="outline" className="ml-2">
                  {currentMonthNominations.length} total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nominationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : Object.keys(nominationsByNominee).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No nominations for {formatMonth(selectedMonth)} yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(nominationsByNominee)
                    .sort(([, a], [, b]) => b.length - a.length)
                    .map(([empId, noms]) => (
                      <div key={empId} className="border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-semibold text-foreground">
                              {getEmployeeName(empId)}
                            </span>
                          </div>
                          <Badge variant="default">
                            {noms.length} nomination{noms.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>

                        {/* Individual nomination comments with submitter info */}
                        <div className="space-y-2 pl-10">
                          {noms.map((nom) => (
                            <div
                              key={nom.id}
                              className="bg-muted/50 rounded-md p-3 space-y-1"
                            >
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                <p className="text-sm text-foreground">{nom.comment}</p>
                              </div>
                              {/* Admin sees submitter info */}
                              <div className="flex items-center gap-1 pl-5">
                                <span className="text-xs text-muted-foreground">
                                  Submitted by:{' '}
                                  <span className="font-medium text-foreground/70">
                                    {nom.submitterName ?? 'Anonymous'}
                                  </span>
                                </span>
                                <span className="text-xs text-muted-foreground mx-1">·</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(Number(nom.timestamp) / 1_000_000).toLocaleDateString('en-GB')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Set Winner */}
          {!winner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Trophy className="w-5 h-5 text-primary" />
                  Announce Winner for {formatMonth(CURRENT_MONTH)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Winner</Label>
                  <Select value={winnerEmployeeId} onValueChange={setWinnerEmployeeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose the winner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {activeEmployees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleSetWinner}
                  disabled={setMonthWinner.isPending || !winnerEmployeeId}
                >
                  {setMonthWinner.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Trophy className="w-4 h-4 mr-2" />
                  )}
                  Announce Winner
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
