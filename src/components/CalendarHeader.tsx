import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Share, Eye, Edit } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarHeaderProps {
  currentDate: Date;
  organizations: Array<{ id: string; name: string }>;
  selectedOrganization: string;
  onMonthChange: (direction: 'prev' | 'next') => void;
  onOrganizationChange?: (orgId: string) => void;
  onShare: () => void;
  displayName?: string;
  accessMode?: 'full' | 'edit' | 'view';
}

export function CalendarHeader({
  currentDate,
  organizations,
  selectedOrganization,
  onMonthChange,
  onOrganizationChange,
  onShare,
  displayName,
  accessMode = 'full'
}: CalendarHeaderProps) {
  const monthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-calendar-header">
                Social Calendar
              </h1>
            </div>
            {accessMode !== 'full' && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs font-medium">
                {accessMode === 'view' ? (
                  <>
                    <Eye className="h-3 w-3" />
                    View Only
                  </>
                ) : (
                  <>
                    <Edit className="h-3 w-3" />
                    Edit Access
                  </>
                )}
              </div>
            )}
          </div>
          
          {onOrganizationChange ? (
            <Select value={selectedOrganization} onValueChange={onOrganizationChange}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="px-3 py-2 rounded-md border bg-muted text-sm font-medium min-w-64">
              {displayName}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMonthChange('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h2 className="text-lg font-semibold text-calendar-header min-w-48 text-center">
              {monthYear}
            </h2>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMonthChange('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="default" onClick={onShare} className="gap-2">
            <Share className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </header>
  );
}