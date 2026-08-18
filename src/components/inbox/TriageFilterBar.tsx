import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Filter,
  X,
  CalendarIcon,
  Check,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useEmailAccounts } from "@/hooks/useEmailAccounts";

export interface FilterState {
  accountIds: string[];
  statuses: string[];
  categories: string[];
  priorities: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  slaState: 'due_soon' | 'breached' | 'on_track' | null;
  dateRange: { from: Date | undefined; to: Date | undefined } | null;
}

interface TriageFilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultCount: number;
  availableCategories: string[];
  availableStatuses: string[];
  availablePriorities: string[];
  viewMode: "tickets" | "emails";
}

export function TriageFilterBar({
  filters,
  onFiltersChange,
  resultCount,
  availableCategories,
  availableStatuses,
  availablePriorities,
  viewMode,
}: TriageFilterBarProps) {
  const { accounts } = useEmailAccounts();

  const resetFilters = () => {
    onFiltersChange({
      accountIds: [],
      statuses: [],
      categories: [],
      priorities: [],
      sentiment: null,
      slaState: null,
      dateRange: null,
    });
  };

  const toggleValue = (field: keyof FilterState, value: string) => {
    const current = filters[field] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [field]: updated });
  };

  const setSingleValue = (field: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [field]: filters[field] === value ? null : value });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.accountIds.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (filters.priorities.length > 0) count++;
    if (filters.sentiment) count++;
    if (filters.slaState) count++;
    if (filters.dateRange) count++;
    return count;
  }, [filters]);

  const removeFilter = (field: keyof FilterState, value?: string) => {
    if (Array.isArray(filters[field])) {
      const current = filters[field] as string[];
      onFiltersChange({ ...filters, [field]: current.filter((v) => v !== value) });
    } else {
      onFiltersChange({ ...filters, [field]: null });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search filters..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                
                <CommandGroup heading="Account">
                  {accounts.map((acc) => (
                    <CommandItem
                      key={acc.id}
                      onSelect={() => toggleValue("accountIds", acc.id)}
                    >
                      <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", filters.accountIds.includes(acc.id) ? "bg-primary text-primary-foreground" : "opacity-50")}>
                        {filters.accountIds.includes(acc.id) && <Check className="h-3 w-3" />}
                      </div>
                      <span className="truncate">{acc.email_address}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Status">
                  {availableStatuses.map((status) => (
                    <CommandItem
                      key={status}
                      onSelect={() => toggleValue("statuses", status)}
                    >
                      <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", filters.statuses.includes(status) ? "bg-primary text-primary-foreground" : "opacity-50")}>
                        {filters.statuses.includes(status) && <Check className="h-3 w-3" />}
                      </div>
                      <span className="capitalize">{status.replace("_", " ")}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>

                {availableCategories.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading="Category">
                      {availableCategories.map((cat) => (
                        <CommandItem
                          key={cat}
                          onSelect={() => toggleValue("categories", cat)}
                        >
                          <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", filters.categories.includes(cat) ? "bg-primary text-primary-foreground" : "opacity-50")}>
                            {filters.categories.includes(cat) && <Check className="h-3 w-3" />}
                          </div>
                          <span className="capitalize">{cat.replace("_", " ")}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}

                {availablePriorities.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading="Priority">
                      {availablePriorities.map((p) => (
                        <CommandItem
                          key={p}
                          onSelect={() => toggleValue("priorities", p)}
                        >
                          <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", filters.priorities.includes(p) ? "bg-primary text-primary-foreground" : "opacity-50")}>
                            {filters.priorities.includes(p) && <Check className="h-3 w-3" />}
                          </div>
                          <span className="capitalize">{p}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}

                <CommandSeparator />
                <CommandGroup heading="Sentiment">
                  {['positive', 'neutral', 'negative'].map((s) => (
                    <CommandItem
                      key={s}
                      onSelect={() => setSingleValue("sentiment", s as any)}
                    >
                      <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", filters.sentiment === s ? "bg-primary text-primary-foreground" : "opacity-50")}>
                        {filters.sentiment === s && <Check className="h-3 w-3" />}
                      </div>
                      <span className="capitalize">{s}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>

                {viewMode === "tickets" && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading="SLA State">
                      {['breached', 'due_soon', 'on_track'].map((s) => (
                        <CommandItem
                          key={s}
                          onSelect={() => setSingleValue("slaState", s as any)}
                        >
                          <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", filters.slaState === s ? "bg-primary text-primary-foreground" : "opacity-50")}>
                            {filters.slaState === s && <Check className="h-3 w-3" />}
                          </div>
                          <span className="capitalize">{s.replace("_", " ")}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 justify-start text-left font-normal gap-1.5",
                !filters.dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              {filters.dateRange?.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, "LLL dd")} -{" "}
                    {format(filters.dateRange.to, "LLL dd")}
                  </>
                ) : (
                  format(filters.dateRange.from, "LLL dd")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={filters.dateRange?.from}
              selected={filters.dateRange || undefined}
              onSelect={(range) => onFiltersChange({ ...filters, dateRange: range || null })}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <RotateCcw className="ml-2 h-3.5 w-3.5" />
          </Button>
        )}

        <div className="ml-auto text-xs text-muted-foreground">
          {resultCount} {viewMode === "tickets" ? "tickets" : "emails"} found
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.accountIds.map((id) => (
            <Badge key={id} variant="secondary" className="h-6 gap-1 pr-1">
              {accounts.find(a => a.id === id)?.email_address}
              <button onClick={() => removeFilter("accountIds", id)} className="ml-1 rounded-full p-0.5 hover:bg-muted">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.statuses.map((s) => (
            <Badge key={s} variant="secondary" className="h-6 gap-1 pr-1 capitalize">
              {s.replace("_", " ")}
              <button onClick={() => removeFilter("statuses", s)} className="ml-1 rounded-full p-0.5 hover:bg-muted">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.categories.map((c) => (
            <Badge key={c} variant="secondary" className="h-6 gap-1 pr-1 capitalize">
              {c.replace("_", " ")}
              <button onClick={() => removeFilter("categories", c)} className="ml-1 rounded-full p-0.5 hover:bg-muted">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.priorities.map((p) => (
            <Badge key={p} variant="secondary" className="h-6 gap-1 pr-1 capitalize">
              {p}
              <button onClick={() => removeFilter("priorities", p)} className="ml-1 rounded-full p-0.5 hover:bg-muted">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.sentiment && (
            <Badge variant="secondary" className="h-6 gap-1 pr-1 capitalize">
              Sentiment: {filters.sentiment}
              <button onClick={() => removeFilter("sentiment")} className="ml-1 rounded-full p-0.5 hover:bg-muted">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.slaState && (
            <Badge variant="secondary" className="h-6 gap-1 pr-1 capitalize">
              SLA: {filters.slaState.replace("_", " ")}
              <button onClick={() => removeFilter("slaState")} className="ml-1 rounded-full p-0.5 hover:bg-muted">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.dateRange && filters.dateRange.from && (
            <Badge variant="secondary" className="h-6 gap-1 pr-1">
              Date: {format(filters.dateRange.from, "MMM dd")}
              {filters.dateRange.to && ` - ${format(filters.dateRange.to, "MMM dd")}`}
              <button onClick={() => removeFilter("dateRange")} className="ml-1 rounded-full p-0.5 hover:bg-muted">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
