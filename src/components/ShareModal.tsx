import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, Edit, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  organizationName: string;
}

export function ShareModal({
  isOpen,
  onClose,
  organizationId,
  organizationName
}: ShareModalProps) {
  const [copiedView, setCopiedView] = useState(false);
  const [copiedEdit, setCopiedEdit] = useState(false);
  const { toast } = useToast();

  const baseUrl = window.location.origin + window.location.pathname;
  const encodedOrgName = encodeURIComponent(organizationName);
  const viewOnlyUrl = `${baseUrl}?id=${organizationId}&access=view&name=${encodedOrgName}`;
  const editAccessUrl = `${baseUrl}?id=${organizationId}&access=edit&name=${encodedOrgName}`;

  const copyToClipboard = async (text: string, type: 'view' | 'edit') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'view') {
        setCopiedView(true);
        setTimeout(() => setCopiedView(false), 2000);
      } else {
        setCopiedEdit(true);
        setTimeout(() => setCopiedEdit(false), 2000);
      }
      
      toast({
        title: "Link copied!",
        description: `${type === 'view' ? 'View-only' : 'Edit access'} link copied to clipboard.`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Share Calendar - {organizationName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <p className="text-sm text-muted-foreground">
            Share this calendar with your team or clients. You can provide view-only access or full editing permissions.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">View-Only Access</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Recipients can view the calendar and posts but cannot make changes.
              </p>
              <div className="flex gap-2">
                <Input
                  value={viewOnlyUrl}
                  readOnly
                  className="text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(viewOnlyUrl, 'view')}
                  className="shrink-0"
                >
                  {copiedView ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Edit Access</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Recipients can view, add, edit, and delete posts for this organization. They cannot manage organizations.
              </p>
              <div className="flex gap-2">
                <Input
                  value={editAccessUrl}
                  readOnly
                  className="text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(editAccessUrl, 'edit')}
                  className="shrink-0"
                >
                  {copiedEdit ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}