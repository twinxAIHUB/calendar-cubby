import { useState, useEffect } from "react";
import { CalendarHeader } from "@/components/CalendarHeader";
import { CalendarGrid } from "@/components/CalendarGrid";
import { PostModal, Post } from "@/components/PostModal";
import { ShareModal } from "@/components/ShareModal";
import { OrganizationModal } from "@/components/OrganizationModal";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Organization {
  id: string;
  name: string;
}

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<Post | undefined>();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  
  // Local storage hooks
  const [organizations, setOrganizations] = useLocalStorage<Organization[]>('social-calendar-orgs', [
    { id: 'default', name: 'My Organization' }
  ]);
  const [selectedOrgId, setSelectedOrgId] = useLocalStorage<string>('social-calendar-selected-org', 'default');
  const [posts, setPosts] = useLocalStorage<Post[]>('social-calendar-posts', []);
  
  // Access control from URL parameters
  const [accessMode, setAccessMode] = useState<'full' | 'edit' | 'view'>('full');
  const [sharedOrgName, setSharedOrgName] = useState<string>('');
  const { toast } = useToast();

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
        toast({
          title: "View-only mode",
          description: "You can view the calendar but cannot make changes.",
        });
      } else if (access === 'edit') {
        setAccessMode('edit');
        toast({
          title: "Edit access granted",
          description: "You can view and edit posts for this organization.",
        });
      }
    }
  }, []);

  const selectedOrg = organizations.find(org => org.id === selectedOrgId) || organizations[0];
  const orgPosts = posts.filter(post => post.organizationId === selectedOrgId);
  
  // Use shared org name if available, otherwise use selected org name
  const displayOrgName = sharedOrgName || selectedOrg?.name || 'Unknown Organization';

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (date: string) => {
    if (accessMode === 'view') return;
    
    setSelectedDate(date);
    setSelectedPost(undefined);
    setIsPostModalOpen(true);
  };

  const handlePostClick = (post: Post) => {
    if (accessMode === 'view') return;
    
    setSelectedDate(post.date);
    setSelectedPost(post);
    setIsPostModalOpen(true);
  };

  const handleSavePost = (postData: Omit<Post, 'id'>) => {
    if (selectedPost) {
      // Update existing post
      setPosts(prev => prev.map(p => 
        p.id === selectedPost.id 
          ? { ...postData, id: selectedPost.id }
          : p
      ));
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully.",
      });
    } else {
      // Create new post
      const newPost: Post = {
        ...postData,
        id: Date.now().toString()
      };
      setPosts(prev => [...prev, newPost]);
      toast({
        title: "Post created",
        description: "Your new post has been added to the calendar.",
      });
    }
  };

  const handleDeletePost = () => {
    if (selectedPost) {
      setPosts(prev => prev.filter(p => p.id !== selectedPost.id));
      toast({
        title: "Post deleted",
        description: "The post has been removed from the calendar.",
      });
    }
  };

  const handleAddOrganization = (name: string) => {
    const newOrg: Organization = {
      id: Date.now().toString(),
      name: name.trim()
    };
    setOrganizations(prev => [...prev, newOrg]);
    setSelectedOrgId(newOrg.id);
    toast({
      title: "Organization added",
      description: `${name} has been added successfully.`,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
        <CalendarHeader
          currentDate={currentDate}
          organizations={organizations}
          selectedOrganization={selectedOrgId}
          onMonthChange={handleMonthChange}
          onOrganizationChange={accessMode === 'edit' ? undefined : setSelectedOrgId}
          onShare={() => setIsShareModalOpen(true)}
          displayName={displayOrgName}
          accessMode={accessMode}
        />

      <div className="flex-1 flex">
        <CalendarGrid
          currentDate={currentDate}
          posts={orgPosts}
          onDateClick={handleDateClick}
          onPostClick={handlePostClick}
        />
      </div>

      {/* Add Organization Button */}
      {accessMode === 'full' && (
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={() => setIsOrgModalOpen(true)}
            className="rounded-full shadow-lg gap-2"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            Add Organization
          </Button>
        </div>
      )}

      {/* Modals */}
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSave={handleSavePost}
        onDelete={selectedPost ? handleDeletePost : undefined}
        post={selectedPost}
        selectedDate={selectedDate}
        organizationId={selectedOrgId}
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
        onSave={handleAddOrganization}
      />

      {/* Status Legend */}
      <div className="fixed bottom-6 left-6 bg-card border border-border rounded-lg p-4 shadow-lg">
        <h3 className="text-sm font-medium mb-2">Status Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-status-process"></div>
            <span className="text-xs">In Process</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-status-scheduled"></div>
            <span className="text-xs">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-status-posted"></div>
            <span className="text-xs">Posted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
