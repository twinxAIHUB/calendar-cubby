import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface Post {
  id: string;
  date: string;
  content: string;
  mediaUrl: string | null;
  status: 'process' | 'scheduled' | 'posted';
  organizationId: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function useSupabaseData() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: "Error",
        description: "Failed to load organizations",
        variant: "destructive",
      });
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match the Post interface
      const transformedPosts = (data || []).map(post => ({
        id: post.id,
        date: post.date,
        content: post.content,
        mediaUrl: post.media_url,
        status: post.status as 'process' | 'scheduled' | 'posted',
        organizationId: post.organization_id,
        user_id: post.user_id,
        created_at: post.created_at,
        updated_at: post.updated_at,
      }));
      
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error", 
        description: "Failed to load posts",
        variant: "destructive",
      });
    }
  };

  const createOrganization = async (name: string): Promise<Organization | null> => {
    try {
      console.log('Creating organization:', name);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('User auth error:', userError);
        throw userError;
      }
      
      if (!user) {
        console.error('No user found');
        throw new Error('Not authenticated');
      }
      
      console.log('User authenticated:', user.id);

      const { data, error } = await supabase
        .from('organizations')
        .insert([{ name, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('Organization created successfully:', data);
      await fetchOrganizations();
      
      toast({
        title: "Success",
        description: "Organization created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create organization",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateOrganization = async (id: string, name: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ name })
        .eq('id', id);

      if (error) throw error;

      await fetchOrganizations();
      
      toast({
        title: "Success",
        description: "Organization updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error", 
        description: "Failed to update organization",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteOrganization = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchOrganizations();
      
      toast({
        title: "Success",
        description: "Organization deleted successfully",
      });

      return true;
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: "Error",
        description: "Failed to delete organization", 
        variant: "destructive",
      });
      return false;
    }
  };

  const createPost = async (postData: {
    date: string;
    content: string;
    mediaUrl: string;
    status: 'process' | 'scheduled' | 'posted';
    organizationId: string;
  }): Promise<Post | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('posts')
        .insert([{ 
          date: postData.date,
          content: postData.content,
          media_url: postData.mediaUrl,
          status: postData.status,
          organization_id: postData.organizationId,
          user_id: user.id 
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchPosts();
      
      toast({
        title: "Success",
        description: "Post created successfully",
      });

      // Transform the response to match our Post interface
      return {
        id: data.id,
        date: data.date,
        content: data.content,
        mediaUrl: data.media_url,
        status: data.status as 'process' | 'scheduled' | 'posted',
        organizationId: data.organization_id,
        user_id: data.user_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create post",
        variant: "destructive",
      });
      return null;
    }
  };

  const updatePost = async (id: string, postData: {
    content: string;
    mediaUrl: string;
    status: 'process' | 'scheduled' | 'posted';
  }): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          content: postData.content,
          media_url: postData.mediaUrl,
          status: postData.status,
        })
        .eq('id', id);

      if (error) throw error;

      await fetchPosts();
      
      toast({
        title: "Success",
        description: "Post updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
      return false;
    }
  };

  const deletePost = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchPosts();
      
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });

      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchOrganizations(), fetchPosts()]);
      setLoading(false);
    };

    // Check if user is authenticated
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        initializeData();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        initializeData();
      } else {
        setOrganizations([]);
        setPosts([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    organizations,
    posts,
    loading,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    createPost,
    updatePost,
    deletePost,
    fetchOrganizations,
    fetchPosts,
  };
}