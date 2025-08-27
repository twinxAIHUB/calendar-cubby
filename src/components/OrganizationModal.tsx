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
import { Building2, Trash2 } from "lucide-react";

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

  useEffect(() => {
    if (organization) {
      setName(organization.name);
    } else {
      setName('');
    }
  }, [organization, isOpen]);

  const handleSave = () => {
    if (name.trim()) {
      if (organization && onUpdate) {
        onUpdate(organization.id, name.trim());
      } else {
        onSave(name.trim());
      }
      setName('');
      onClose();
    }
  };

  const handleDelete = () => {
    if (organization && onDelete) {
      onDelete(organization.id);
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {organization ? 'Edit Organization' : 'Add New Organization'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              placeholder="Enter organization or client name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
              autoFocus
            />
          </div>
          
          <p className="text-sm text-muted-foreground">
            {organization 
              ? 'Update the name of this organization.'
              : 'This will create a new calendar for managing social media posts for this organization.'
            }
          </p>
        </div>

        <div className="flex justify-between">
          <div>
            {organization && onDelete && (
              <Button variant="destructive" onClick={handleDelete} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              {organization ? 'Update' : 'Create'} Organization
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}