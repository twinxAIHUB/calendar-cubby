import { useState, useEffect } from "react";
import { CalendarHeader } from "@/components/CalendarHeader";
import { CalendarGrid } from "@/components/CalendarGrid";
import { PostModal, Post } from "@/components/PostModal";
import { ShareModal } from "@/components/ShareModal";
import { OrganizationModal } from "@/components/OrganizationModal";
import { AuthGuard } from "@/components/AuthGuard";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Organization {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<Post | undefined>();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  
  // Supabase data hooks
  const {
    organizations,
    posts,
    loading,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    createPost,
    updatePost,
    deletePost,
  } = useSupabaseData();
  
  // Access control from URL parameters
  const [accessMode, setAccessMode] = useState<'full' | 'edit' | 'view'>('full');
  const [sharedOrgName, setSharedOrgName] = useState<string>('');
  const { toast } = useToast();

  // Set initial organization selection
  useEffect(() => {
    if (organizations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(organizations[0].id);
    }
  }, [organizations, selectedOrgId]);

  // Check URL parameters for shared access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orgId = urlParams.get('id');
    const access = urlParams.get('access');
    const orgName = urlParams.get('name');
    
    if (orgId && access) {
      setSelectedOrgId(orgId);
      if (orgName) {
        setSharedOrgName(decodeURIComponent(orgName));
      }
      
      if (access === 'view') {
        setAccessMode('view');
      } else if (access === 'edit') {
        setAccessMode('edit');
      }
    }
  }, []);

  const currentOrg = organizations.find(org => org.id === selectedOrgId);
  const displayOrgName = sharedOrgName || currentOrg?.name || 'Unknown Organization';
  const currentPosts = posts.filter(post => post.organizationId === selectedOrgId);

  const handleCreateOrganization = async (name: string) => {
    const newOrg = await createOrganization(name);
    if (newOrg) {
      setSelectedOrgId(newOrg.id);
    }
    setIsOrgModalOpen(false);
  };

  const handleUpdateOrganization = async (id: string, name: string) => {
    await updateOrganization(id, name);
    setIsOrgModalOpen(false);
  };

  const handleDeleteOrganization = async (id: string) => {
    await deleteOrganization(id);
    // Select first available organization or clear selection
    if (organizations.length > 1) {
      const remainingOrgs = organizations.filter(org => org.id !== id);
      setSelectedOrgId(remainingOrgs[0]?.id || '');
    } else {
      setSelectedOrgId('');
    }
    setIsOrgModalOpen(false);
  };

  const handleSavePost = async (postData: Omit<Post, 'id'>) => {
    if (selectedPost) {
      // Update existing post
      await updatePost(selectedPost.id, {
        content: postData.content,
        mediaUrl: postData.mediaUrl,
        status: postData.status,
      });
    } else {
      // Create new post  
      await createPost({
        date: postData.date,
        content: postData.content,
        mediaUrl: postData.mediaUrl,
        status: postData.status,
        organizationId: postData.organizationId,
      });
    }
    setIsPostModalOpen(false);
    setSelectedPost(undefined);
  };

  const handleDeletePost = async () => {
    if (selectedPost) {
      await deletePost(selectedPost.id);
      setSelectedPost(undefined);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 space-y-6">
          {/* Header */}
          <CalendarHeader
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            organizations={organizations}
            selectedOrgId={selectedOrgId}
            onOrgChange={setSelectedOrgId}
            accessMode={accessMode}
            onOpenOrgModal={() => setIsOrgModalOpen(true)}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />

          {/* Calendar */}
          <CalendarGrid
            currentDate={currentDate}
            posts={currentPosts}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setSelectedPost(undefined);
              if (accessMode !== 'view') {
                setIsPostModalOpen(true);
              }
            }}
            onSelectPost={(post) => {
              setSelectedPost(post);
              setSelectedDate(post.date);
              if (accessMode !== 'view') {
                setIsPostModalOpen(true);
              }
            }}
            selectedOrgId={selectedOrgId}
          />

          {/* Empty state for organizations */}
          {organizations.length === 0 && accessMode === 'full' && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-foreground mb-2">No organizations yet</h3>
              <p className="text-muted-foreground mb-4">Create your first organization to start planning posts</p>
              <Button onClick={() => setIsOrgModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Organization
              </Button>
            </div>
          )}
        </div>

        {/* Modals */}
        <PostModal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
          onSave={handleSavePost}
          onDelete={selectedPost ? handleDeletePost : undefined}
          post={selectedPost}
          selectedDate={selectedDate}
          organizationId={selectedOrgId}
          organizationName={displayOrgName}
        />

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          organizationId={selectedOrgId}
          organizationName={displayOrgName}
        />

        <OrganizationModal
          isOpen={isOrgModalOpen}
          onClose={() => setIsOrgModalOpen(false)}
          onSave={handleCreateOrganization}
          onUpdate={handleUpdateOrganization}
          onDelete={handleDeleteOrganization}
          organization={currentOrg}
        />
      </div>
    </AuthGuard>
  );
};

export default Index;