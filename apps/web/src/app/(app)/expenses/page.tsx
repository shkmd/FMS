"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { useFarms, useExpenses, usePettyCash, useExpenseMutations } from "@/lib/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

const STATUS_VARIANT: Record<string, any> = { PENDING: "warning", APPROVED: "success", REJECTED: "destructive", REIMBURSED: "secondary" };

function NewExpenseDialog({ farmId }: { farmId: string }) {
  const { createExpense } = useExpenseMutations();
  const [open, setOpen] = React.useState(false);
  const [category, setCategory] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await createExpense.mutateAsync({ farmId, category, amount: Number(amount) });
      setOpen(false);
      setCategory(""); setAmount("");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>New expense</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New expense</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1"><Label>Category</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Fuel, Repairs" /></div>
          <div className="space-y-1"><Label>Amount (₹)</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <p className="text-xs text-muted-foreground">No receipt attached yet — this will flag a missing-receipt alert, matching spec §5.18.</p>
        </div>
        <DialogFooter><Button onClick={submit} disabled={!category || !amount}>Submit</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PettyCashTab({ farmId }: { farmId: string }) {
  const { data: transactions } = usePettyCash(farmId);
  const { recordPettyCash } = useExpenseMutations();
  const [type, setType] = React.useState("expense");
  const [amount, setAmount] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const currentBalance = transactions?.[0]?.balanceAfter ?? 0;

  return (
    <div className="space-y-3">
      <Card><CardContent className="p-4"><div className="text-2xl font-semibold">₹{Number(currentBalance).toLocaleString()}</div><div className="text-xs text-muted-foreground">Current petty cash balance</div></CardContent></Card>
      {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="opening">Opening</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="reimbursement">Reimbursement</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Button
          onClick={async () => {
            setError(null);
            try {
              await recordPettyCash.mutateAsync({ farmId, type, amount: Number(amount) });
              setAmount("");
            } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
          }}
          disabled={!amount}
        >
          Record
        </Button>
      </div>
      <div className="space-y-1">
        {transactions?.map((t: any) => (
          <div key={t.id} className="flex justify-between rounded-md border p-2 text-sm">
            <span>{t.type}: ₹{Number(t.amount).toLocaleString()}</span>
            <span className="text-muted-foreground">Balance: ₹{Number(t.balanceAfter).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const { hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: expenses, isLoading } = useExpenses();
  const { decideExpense } = useExpenseMutations();
  const canManage = hasPermission(PERMISSIONS.EXPENSES_MANAGE);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>

      <Tabs defaultValue="expenses">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="pettycash">Petty Cash</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-3">
          {canManage && farmId && <NewExpenseDialog farmId={farmId} />}
          <div className="space-y-2">
            {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {expenses?.map((e: any) => (
              <Card key={e.id}>
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <div className="font-medium">{e.category} — ₹{Number(e.amount).toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{e.expenseNumber} · {new Date(e.date).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!e.receiptMediaId && <Badge variant="warning">No receipt</Badge>}
                    <Badge variant={STATUS_VARIANT[e.financeStatus]}>{e.financeStatus}</Badge>
                    {e.financeStatus === "PENDING" && hasPermission(PERMISSIONS.EXPENSES_APPROVE) && (
                      <>
                        <Button size="sm" onClick={() => decideExpense.mutate({ id: e.id, approve: true })}>Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => decideExpense.mutate({ id: e.id, approve: false })}>Reject</Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {!expenses?.length && !isLoading && <p className="text-sm text-muted-foreground">No expenses recorded yet.</p>}
          </div>
        </TabsContent>

        <TabsContent value="pettycash">{farmId && <PettyCashTab farmId={farmId} />}</TabsContent>
      </Tabs>
    </div>
  );
}
