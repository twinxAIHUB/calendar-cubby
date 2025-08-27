import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  organizationName: string;
}

export function ShareModal({ isOpen, onClose, organizationId, organizationName }: ShareModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [shareLinks, setShareLinks] = useState<Array<{id: string, token: string, access_type: string, expires_at: string | null, is_active: boolean}>>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const generateShareLink = async (accessType: 'view' | 'edit') => {
    setLoading(true);
    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

      const { data, error } = await supabase
        .from('share_links')
        .insert({
          organization_id: organizationId,
          token,
          access_type: accessType,
          created_by: (await supabase.auth.getUser()).data.user?.id!,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      fetchShareLinks();
      toast({
        title: "Success",
        description: `${accessType === 'view' ? 'View-only' : 'Edit'} link created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create share link",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const revokeShareLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('share_links')
        .update({ is_active: false })
        .eq('id', linkId);

      if (error) throw error;
      
      fetchShareLinks();
      toast({
        title: "Success",
        description: "Share link revoked successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke share link",
        variant: "destructive",
      });
    }
  };

  const fetchShareLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('share_links')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShareLinks(data || []);
    } catch (error) {
      console.error('Error fetching share links:', error);
    }
  };

  useEffect(() => {
    if (isOpen && organizationId) {
      fetchShareLinks();
    }
  }, [isOpen, organizationId]);

  const baseUrl = window.location.origin;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Share Calendar - {organizationName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={() => generateShareLink('view')}
                disabled={loading}
                variant="outline"
              >
                Generate View-Only Link
              </Button>
              <Button
                onClick={() => generateShareLink('edit')}
                disabled={loading}
                variant="outline"
              >
                Generate Edit Access Link
              </Button>
            </div>

            {shareLinks.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Active Share Links</h4>
                {shareLinks.map((link) => {
                  const shareUrl = `${baseUrl}/?token=${link.token}`;
                  return (
                    <div key={link.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {link.access_type} Access
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeShareLink(link.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={shareUrl}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(shareUrl, link.id)}
                          className="shrink-0"
                        >
                          {copiedField === link.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {link.expires_at && (
                        <p className="text-xs text-gray-500">
                          Expires: {new Date(link.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}