import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Organization {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  onUpdate?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
  organization?: Organization;
}

export function OrganizationModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  organization
}: OrganizationModalProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (organization) {
      setName(organization.name);
    } else {
      setName('');
    }
    setError('');
  }, [organization, isOpen]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Organization name is required');
      return;
    }

    if (name.trim().length < 2) {
      setError('Organization name must be at least 2 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (organization && onUpdate) {
        await onUpdate(organization.id, name.trim());
      } else {
        await onSave(name.trim());
      }
      setName('');
      onClose();
    } catch (err) {
      setError('Failed to save organization. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!organization || !onDelete) return;
    
    if (confirm(`Are you sure you want to delete "${organization.name}"? This action cannot be undone.`)) {
      setIsSubmitting(true);
      try {
        await onDelete(organization.id);
        onClose();
      } catch (err) {
        setError('Failed to delete organization. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName('');
      setError('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            {organization ? 'Edit Organization' : 'Add New Organization'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="orgName" className="text-sm font-medium">
              Organization Name
            </Label>
            <Input
              id="orgName"
              placeholder="Enter organization or client name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              className="h-10"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              This will create a new calendar for managing social media posts.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          <div className="order-2 sm:order-1">
            {organization && onDelete && (
              <Button 
                variant="destructive" 
                onClick={handleDelete} 
                disabled={isSubmitting}
                className="gap-2 w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                Delete Organization
              </Button>
            )}
          </div>
          
          <div className="flex gap-2 order-1 sm:order-2">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!name.trim() || isSubmitting}
              className="flex-1 sm:flex-none"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {organization ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                organization ? 'Update Organization' : 'Create Organization'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}