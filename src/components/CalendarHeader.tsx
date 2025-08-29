import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Share, Eye, Edit, Plus, Building2, Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  organizations: Array<{ id: string; name: string }>;
  selectedOrgId: string;
  onOrgChange: (orgId: string) => void;
  accessMode?: 'full' | 'edit' | 'view';
  onOpenOrgModal: () => void;
  onOpenShareModal: () => void;
  onEditOrg?: () => void;
  canEditOrg?: boolean;
}

export function CalendarHeader({
  currentDate,
  onDateChange,
  organizations,
  selectedOrgId,
  onOrgChange,
  accessMode = 'full',
  onOpenOrgModal,
  onOpenShareModal,
  onEditOrg,
  canEditOrg = false
}: CalendarHeaderProps) {
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const selectedOrg = organizations.find(org => org.id === selectedOrgId);

  return (
    <div className="space-y-6 pb-6 border-b">
      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold">Social Media Calendar</h1>
          </div>
          
          {accessMode !== 'full' && (
            <div className="flex items-center gap-2">
              {accessMode === 'view' ? (
                <Eye className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Edit className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground capitalize">
                {accessMode} Access
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons - Desktop */}
        <div className="hidden lg:flex gap-3">
          {accessMode === 'full' && (
            <Button variant="outline" onClick={onOpenOrgModal} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Organization
            </Button>
          )}
          
          {selectedOrgId && accessMode === 'full' && (
            <Button variant="outline" onClick={onOpenShareModal} className="gap-2">
              <Share className="h-4 w-4" />
              Share
            </Button>
          )}
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
        {/* Organization Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
          {organizations.length > 0 ? (
            <div className="flex items-center gap-2 min-w-[200px]">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedOrgId} onValueChange={onOrgChange}>
                <SelectTrigger className="w-full">
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
              {canEditOrg && onEditOrg && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEditOrg}
                  className="h-8 w-8 p-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="text-sm">No organizations yet</span>
            </div>
          )}
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrevMonth}
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[140px] text-center px-3 py-2 bg-muted rounded-md">
            {formatMonthYear(currentDate)}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextMonth}
            className="h-9 w-9 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Action Buttons - Mobile */}
        <div className="flex lg:hidden gap-2 w-full sm:w-auto">
          {accessMode === 'full' && (
            <Button variant="outline" onClick={onOpenOrgModal} className="gap-2 flex-1 sm:flex-none">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Organization</span>
              <span className="sm:hidden">Add Org</span>
            </Button>
          )}
          
          {selectedOrgId && accessMode === 'full' && (
            <Button variant="outline" onClick={onOpenShareModal} className="gap-2 flex-1 sm:flex-none">
              <Share className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}