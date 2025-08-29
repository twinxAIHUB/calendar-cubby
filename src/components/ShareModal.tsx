import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, X, Link, Eye, Edit, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { env } from "@/config/environment";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

  // Use environment configuration for base URL
  const baseUrl = env.baseUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Link className="h-5 w-5 text-primary" />
            Share Calendar - {organizationName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Generate Links Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => generateShareLink('view')}
                disabled={loading}
                variant="outline"
                className="flex-1 gap-2 h-12"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Generate View-Only Link</span>
                <span className="sm:hidden">View-Only</span>
              </Button>
              <Button
                onClick={() => generateShareLink('edit')}
                disabled={loading}
                variant="outline"
                className="flex-1 gap-2 h-12"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Generate Edit Access Link</span>
                <span className="sm:hidden">Edit Access</span>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              View-only links allow stakeholders to see the calendar. Edit access links allow team members to create and modify posts.
            </p>
          </div>

          <Separator />

          {/* Active Links Section */}
          {shareLinks.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Active Share Links ({shareLinks.length})
              </h4>
              
              <div className="space-y-4">
                {shareLinks.map((link) => {
                  const shareUrl = `${baseUrl}/?token=${link.token}`;
                  const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
                  
                  return (
                    <div key={link.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={link.access_type === 'edit' ? 'default' : 'secondary'}>
                            {link.access_type === 'edit' ? (
                              <Edit className="h-3 w-3 mr-1" />
                            ) : (
                              <Eye className="h-3 w-3 mr-1" />
                            )}
                            {link.access_type} Access
                          </Badge>
                          {isExpired && (
                            <Badge variant="destructive">Expired</Badge>
                          )}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeShareLink(link.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={shareUrl}
                            readOnly
                            className="font-mono text-xs bg-background"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(shareUrl, link.id)}
                            className="shrink-0 h-9 px-3"
                          >
                            {copiedField === link.id ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline ml-2">Copy</span>
                          </Button>
                        </div>
                        
                        {link.expires_at && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Expires: {new Date(link.expires_at).toLocaleDateString()}
                            {isExpired && (
                              <span className="text-destructive">(Expired)</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Links State */}
          {shareLinks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Link className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No active share links yet.</p>
              <p className="text-xs">Generate a link above to start sharing your calendar.</p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}