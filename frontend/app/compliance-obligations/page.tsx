"use client";
import * as React from "react";
import { motion } from "framer-motion";
import {
  Search, Download, Bookmark, ChevronDown, ChevronUp, ArrowUpDown, ChevronLeft, ChevronRight,
  FileSpreadsheet, FileDown, Flame, X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge, riskVariant, statusVariant } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { obligations, departments } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type SortKey = "regNo" | "obligation" | "department" | "risk" | "status" | "deadline";

const PAGE_SIZE = 8;

export default function ComplianceObligationsPage() {
  const [search, setSearch] = React.useState("");
  const [dept, setDept] = React.useState("all");
  const [risk, setRisk] = React.useState("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("regNo");
  const [sortDir, setSortDir] = React.useState<1 | -1>(1);
  const [page, setPage] = React.useState(1);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [bookmarked, setBookmarked] = React.useState<Set<string>>(new Set());
  const [highlightHigh, setHighlightHigh] = React.useState(false);
  const [drawerId, setDrawerId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    let rows = obligations.filter((o) =>
      (o.obligation.toLowerCase().includes(search.toLowerCase()) || o.regNo.toLowerCase().includes(search.toLowerCase())) &&
      (dept === "all" || o.department === dept) &&
      (risk === "all" || o.risk === risk)
    );
    rows = [...rows].sort((a, b) => (a[sortKey] > b[sortKey] ? 1 : -1) * sortDir);
    return rows;
  }, [search, dept, risk, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const drawerItem = obligations.find((o) => o.id === drawerId);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(1); }
  }

  function toggleBookmark(id: string) {
    setBookmarked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => setPage(1), [search, dept, risk]);

  const columns: { key: SortKey; label: string }[] = [
    { key: "regNo", label: "Reg. No" }, { key: "obligation", label: "Obligation" }, { key: "department", label: "Department" },
    { key: "risk", label: "Risk" }, { key: "status", label: "Status" }, { key: "deadline", label: "Deadline" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Compliance Obligations</h1>
          <p className="mt-1 text-sm text-foreground-muted">{filtered.length} obligations across {departments.length} departments.</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline"><Download className="h-4 w-4" /> Export</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><FileDown className="h-4 w-4" /> Export as PDF</DropdownMenuItem>
              <DropdownMenuItem><FileSpreadsheet className="h-4 w-4" /> Export as CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
          <Input placeholder="Search by obligation or reg. no..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={dept} onValueChange={setDept}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={risk} onValueChange={setRisk}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Risk" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={highlightHigh ? "destructive" : "outline"}
          onClick={() => setHighlightHigh((v) => !v)}
          className="shrink-0"
        >
          <Flame className="h-4 w-4" /> Highlight High Risk
        </Button>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted/60 text-left text-[11.5px] font-semibold uppercase tracking-wide text-foreground-muted">
              <th className="w-8 px-4 py-3" />
              {columns.map((c) => (
                <th key={c.key} className="cursor-pointer select-none px-4 py-3" onClick={() => toggleSort(c.key)}>
                  <span className="inline-flex items-center gap-1">{c.label} <ArrowUpDown className="h-3 w-3 opacity-50" /></span>
                </th>
              ))}
              <th className="w-20 px-4 py-3">Bookmark</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((o) => (
              <React.Fragment key={o.id}>
                <tr
                  className={cn(
                    "cursor-pointer border-b border-border-soft transition-colors hover:bg-surface-muted",
                    highlightHigh && o.risk === "High" && "bg-danger-tint/50"
                  )}
                  onClick={() => setDrawerId(o.id)}
                >
                  <td className="px-4 py-3" onClick={(e) => { e.stopPropagation(); setExpanded(expanded === o.id ? null : o.id); }}>
                    {expanded === o.id ? <ChevronUp className="h-4 w-4 text-foreground-muted" /> : <ChevronDown className="h-4 w-4 text-foreground-muted" />}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{o.regNo}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-foreground">{o.obligation}</td>
                  <td className="px-4 py-3 text-foreground-muted">{o.department}</td>
                  <td className="px-4 py-3"><Badge variant={riskVariant(o.risk)}>{o.risk}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(o.status)}>{o.status}</Badge></td>
                  <td className="px-4 py-3 text-foreground-muted">{o.deadline}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => toggleBookmark(o.id)}>
                      <Bookmark className={cn("h-4 w-4", bookmarked.has(o.id) ? "fill-primary text-primary" : "text-foreground-subtle")} />
                    </button>
                  </td>
                </tr>
                {expanded === o.id && (
                  <tr className="border-b border-border-soft bg-surface-muted/40">
                    <td colSpan={8} className="px-8 py-4">
                      <div className="grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-4">
                        <div><p className="text-foreground-subtle">Category</p><p className="font-medium text-foreground">{o.category}</p></div>
                        <div><p className="text-foreground-subtle">Owner</p><p className="font-medium text-foreground">{o.owner}</p></div>
                        <div><p className="text-foreground-subtle">Frequency</p><p className="font-medium text-foreground">{o.frequency}</p></div>
                        <div><p className="text-foreground-subtle">Source Document</p><p className="font-medium text-foreground">{o.docName}</p></div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {pageRows.map((o) => (
          <button key={o.id} onClick={() => setDrawerId(o.id)} className="block w-full rounded-2xl border border-border bg-surface p-4 text-left">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-foreground-subtle">{o.regNo}</p>
              <Badge variant={riskVariant(o.risk)}>{o.risk}</Badge>
            </div>
            <p className="mt-1.5 text-sm font-medium text-foreground">{o.obligation}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-foreground-muted">{o.department}</span>
              <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-foreground-muted">Page {page} of {totalPages}</p>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <Sheet open={!!drawerId} onOpenChange={(v) => !v && setDrawerId(null)}>
        <SheetContent className="w-full max-w-md">
          <SheetHeader><SheetTitle>{drawerItem?.regNo}</SheetTitle></SheetHeader>
          {drawerItem && (
            <div className="space-y-4 p-6">
              <p className="text-sm font-medium text-foreground">{drawerItem.obligation}</p>
              <div className="grid grid-cols-2 gap-4 text-[13px]">
                <Field label="Department" value={drawerItem.department} />
                <Field label="Owner" value={drawerItem.owner} />
                <Field label="Category" value={drawerItem.category} />
                <Field label="Frequency" value={drawerItem.frequency} />
                <Field label="Deadline" value={drawerItem.deadline} />
                <Field label="Source" value={drawerItem.docName} />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={riskVariant(drawerItem.risk)}>{drawerItem.risk} Risk</Badge>
                <Badge variant={statusVariant(drawerItem.status)}>{drawerItem.status}</Badge>
              </div>
              <Button className="w-full">Mark as Compliant</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-foreground-subtle">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}
