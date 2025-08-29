import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Share, Eye, Edit, Plus } from "lucide-react";
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
}

export function CalendarHeader({
  currentDate,
  onDateChange,
  organizations,
  selectedOrgId,
  onOrgChange,
  accessMode = 'full',
  onOpenOrgModal,
  onOpenShareModal
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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Social Media Calendar</h1>
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Organization Selector */}
        {organizations.length > 0 && (
          <Select value={selectedOrgId} onValueChange={onOrgChange}>
            <SelectTrigger className="w-[200px]">
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
        )}

        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {formatMonthYear(currentDate)}
          </span>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {accessMode === 'full' && (
            <>
              <Button variant="outline" size="sm" onClick={onOpenOrgModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Organization
              </Button>
            </>
          )}
          
          {selectedOrgId && accessMode === 'full' && (
            <Button variant="outline" size="sm" onClick={onOpenShareModal}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}