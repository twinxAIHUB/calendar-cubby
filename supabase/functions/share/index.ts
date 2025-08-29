import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShareTokenData {
  organization_id: string;
  access_type: 'view' | 'edit';
  expires_at?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role key to bypass RLS for share operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    let token = url.searchParams.get('token');
    let action = url.searchParams.get('action');

    // If not in URL params, try to get from request body
    if (!token || !action) {
      try {
        const body = await req.json();
        token = token || body.token;
        action = action || body.action;
      } catch (e) {
        console.log('No JSON body or failed to parse:', e);
      }
    }

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify token and get share link data
    const { data: shareLink, error: tokenError } = await supabaseAdmin
      .from('share_links')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (tokenError || !shareLink) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token is expired
    if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Token has expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle different actions
    switch (action) {
      case 'verify':
        return new Response(
          JSON.stringify({ 
            valid: true, 
            organization_id: shareLink.organization_id,
            access_type: shareLink.access_type 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'get_data':
        // Fetch organization and posts data
        const { data: organization } = await supabaseAdmin
          .from('organizations')
          .select('*')
          .eq('id', shareLink.organization_id)
          .single();

        const { data: posts } = await supabaseAdmin
          .from('posts')
          .select(`
            *,
            post_comments(id, content, created_by, created_at),
            post_reviews(id, status, reviewed_by, review_notes, created_at)
          `)
          .eq('organization_id', shareLink.organization_id)
          .order('created_at', { ascending: false });

        return new Response(
          JSON.stringify({ organization, posts }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'create_post':
      case 'update_post':
      case 'delete_post':
        if (shareLink.access_type !== 'edit') {
          return new Response(
            JSON.stringify({ error: 'Edit access required' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const body = await req.json();
        
        if (action === 'create_post') {
          const { data: newPost, error } = await supabaseAdmin
            .from('posts')
            .insert({
              ...body,
              organization_id: shareLink.organization_id,
              user_id: shareLink.created_by // Use the share creator as the user
            })
            .select()
            .single();

          if (error) throw error;
          return new Response(
            JSON.stringify(newPost),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (action === 'update_post') {
          const { id, ...updateData } = body;
          const { data: updatedPost, error } = await supabaseAdmin
            .from('posts')
            .update(updateData)
            .eq('id', id)
            .eq('organization_id', shareLink.organization_id)
            .select()
            .single();

          if (error) throw error;
          return new Response(
            JSON.stringify(updatedPost),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (action === 'delete_post') {
          const { error } = await supabaseAdmin
            .from('posts')
            .delete()
            .eq('id', body.id)
            .eq('organization_id', shareLink.organization_id);

          if (error) throw error;
          return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;

      case 'add_comment':
        const commentBody = await req.json();
        const { data: comment, error: commentError } = await supabaseAdmin
          .from('post_comments')
          .insert({
            post_id: commentBody.post_id,
            content: commentBody.content,
            created_by: commentBody.created_by || 'Anonymous'
          })
          .select()
          .single();

        if (commentError) throw commentError;
        return new Response(
          JSON.stringify(comment),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'add_review':
        if (shareLink.access_type !== 'edit') {
          return new Response(
            JSON.stringify({ error: 'Edit access required' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const reviewBody = await req.json();
        const { data: review, error: reviewError } = await supabaseAdmin
          .from('post_reviews')
          .insert({
            post_id: reviewBody.post_id,
            status: reviewBody.status,
            reviewed_by: reviewBody.reviewed_by || 'Anonymous',
            review_notes: reviewBody.review_notes
          })
          .select()
          .single();

        if (reviewError) throw reviewError;
        return new Response(
          JSON.stringify(review),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Share function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});