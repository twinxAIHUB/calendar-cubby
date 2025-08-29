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
import { supabase } from "@/integrations/supabase/client";

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
  const [shareMode, setShareMode] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [accessType, setAccessType] = useState<'view' | 'edit'>('view');
  
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
  const [sharedData, setSharedData] = useState<{organization: any, posts: any[]}>({organization: null, posts: []});
  const { toast } = useToast();

  // Set initial organization selection
  useEffect(() => {
    if (organizations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(organizations[0].id);
    }
  }, [organizations, selectedOrgId]);

  // Check URL parameters for share token
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      setShareToken(token);
      setShareMode(true);
      verifyShareToken(token);
    }
  }, []);

  const verifyShareToken = async (token: string) => {
    try {
      const response = await fetch(
        `https://wntuvobvtdjtrlzrkghp.supabase.co/functions/v1/share?token=${token}&action=verify`
      );
      const data = await response.json();
      
      if (data.valid) {
        setSelectedOrgId(data.organization_id);
        setAccessType(data.access_type);
        setAccessMode(data.access_type);
        // Fetch shared data
        fetchSharedData(token);
      }
    } catch (error) {
      console.error('Share token verification failed:', error);
      setShareMode(false);
    }
  };

  const fetchSharedData = async (token: string) => {
    try {
      const response = await fetch(
        `https://wntuvobvtdjtrlzrkghp.supabase.co/functions/v1/share?token=${token}&action=get_data`
      );
      const data = await response.json();
      
      if (data.organization && data.posts) {
        setSharedData(data);
        setSharedOrgName(data.organization.name);
      }
    } catch (error) {
      console.error('Failed to fetch shared data:', error);
    }
  };

  const currentOrg = organizations.find(org => org.id === selectedOrgId);
  const displayOrgName = sharedOrgName || currentOrg?.name || 'Unknown Organization';
  
  // Use shared data when in share mode, otherwise use regular data
  const currentPosts = shareMode 
    ? sharedData.posts.map(post => ({
        id: post.id,
        date: post.date,
        content: post.content,
        mediaUrl: post.media_url,
        status: post.status,
        organizationId: post.organization_id,
        userId: post.user_id,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        comments: post.post_comments || [],
        reviews: post.post_reviews || []
      }))
    : posts.filter(post => post.organizationId === selectedOrgId);

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
    try {
      if (shareMode && shareToken) {
        // Handle share mode operations via edge function
        if (selectedPost) {
          // Update existing post
          const response = await fetch(`https://wntuvobvtdjtrlzrkghp.supabase.co/functions/v1/share?token=${shareToken}&action=update_post`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: selectedPost.id,
              content: postData.content,
              media_url: postData.mediaUrl,
              status: postData.status,
            })
          });
          if (response.ok) {
            toast({ title: "Success", description: "Post updated successfully" });
            // Refresh shared data
            fetchSharedData(shareToken);
          }
        } else {
          // Create new post
          const response = await fetch(`https://wntuvobvtdjtrlzrkghp.supabase.co/functions/v1/share?token=${shareToken}&action=create_post`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date: postData.date,
              content: postData.content,
              media_url: postData.mediaUrl,
              status: postData.status,
            })
          });
          if (response.ok) {
            toast({ title: "Success", description: "Post created successfully" });
            // Refresh shared data
            fetchSharedData(shareToken);
          }
        }
      } else {
        // Normal authenticated mode
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
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save post", variant: "destructive" });
    }
    setIsPostModalOpen(false);
    setSelectedPost(undefined);
  };

  const handleDeletePost = async () => {
    if (selectedPost) {
      try {
        if (shareMode && shareToken) {
          // Handle delete via edge function
          const response = await fetch(`https://wntuvobvtdjtrlzrkghp.supabase.co/functions/v1/share?token=${shareToken}&action=delete_post`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: selectedPost.id })
          });
          if (response.ok) {
            toast({ title: "Success", description: "Post deleted successfully" });
            // Refresh shared data
            fetchSharedData(shareToken);
          }
        } else {
          await deletePost(selectedPost.id);
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
      }
      setSelectedPost(undefined);
    }
  };

  const handleAddComment = async (postId: string, content: string, createdBy: string) => {
    try {
      if (shareMode && shareToken) {
        await fetch(`https://wntuvobvtdjtrlzrkghp.supabase.co/functions/v1/share?token=${shareToken}&action=add_comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post_id: postId, content, created_by: createdBy })
        });
      } else {
        await supabase.from('post_comments').insert({ post_id: postId, content, created_by: createdBy });
      }
      toast({ title: "Success", description: "Comment added successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add comment", variant: "destructive" });
    }
  };

  const handleAddReview = async (postId: string, status: 'approved' | 'rejected', reviewNotes?: string, reviewedBy?: string) => {
    try {
      if (shareMode && shareToken) {
        await fetch(`https://wntuvobvtdjtrlzrkghp.supabase.co/functions/v1/share?token=${shareToken}&action=add_review`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post_id: postId, status, review_notes: reviewNotes, reviewed_by: reviewedBy })
        });
      } else {
        await supabase.from('post_reviews').insert({ post_id: postId, status, review_notes: reviewNotes, reviewed_by: reviewedBy });
      }
      toast({ title: "Success", description: `Post ${status} successfully` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add review", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const content = (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
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

        <CalendarGrid
          currentDate={currentDate}
          posts={currentPosts}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setSelectedPost(undefined);
            if (!shareMode || accessType === 'edit') {
              setIsPostModalOpen(true);
            }
          }}
          onSelectPost={(post) => {
            setSelectedPost(post);
            setSelectedDate(post.date);
            setIsPostModalOpen(true);
          }}
          selectedOrgId={selectedOrgId}
        />

        <PostModal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
          onSave={handleSavePost}
          onDelete={selectedPost ? handleDeletePost : undefined}
          onAddComment={handleAddComment}
          onAddReview={handleAddReview}
          post={selectedPost}
          selectedDate={selectedDate}
          organizationId={selectedOrgId}
          organizationName={displayOrgName}
          shareMode={shareMode}
          accessType={accessType}
        />

        {!shareMode && (
          <>
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
          </>
        )}
      </div>
    </div>
  );

  return shareMode ? content : (
    <AuthGuard>
      {content}
    </AuthGuard>
  );
};

export default Index;