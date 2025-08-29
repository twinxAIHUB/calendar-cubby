import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Upload, X, Image as ImageIcon, Eye, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useToast } from "@/hooks/use-toast";
import { SocialPreview } from "./SocialPreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface Post {
  id: string;
  date: string;
  content: string;
  mediaUrl: string;
  status: 'process' | 'scheduled' | 'posted';
  organizationId: string;
}

interface Comment {
  id: string;
  content: string;
  created_by: string;
  created_at: string;
}

interface Review {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string;
  review_notes?: string;
  created_at: string;
}

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Omit<Post, 'id'>) => void;
  onDelete?: () => void;
  onAddComment?: (postId: string, content: string, createdBy: string) => void;
  onAddReview?: (postId: string, status: 'approved' | 'rejected', reviewNotes?: string, reviewedBy?: string) => void;
  post?: Post & { comments?: Comment[]; reviews?: Review[] };
  selectedDate: string;
  organizationId: string;
  organizationName: string;
  shareMode?: boolean;
  accessType?: 'view' | 'edit';
}

export function PostModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  onAddComment,
  onAddReview,
  post,
  selectedDate,
  organizationId,
  organizationName,
  shareMode = false,
  accessType
}: PostModalProps) {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [status, setStatus] = useState<Post['status']>('process');
  const [newComment, setNewComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadImage, uploading, error } = useImageUpload();
  const { toast } = useToast();

  useEffect(() => {
    if (post) {
      setContent(post.content);
      setMediaUrl(post.mediaUrl);
      setStatus(post.status);
      setUploadedImageUrl('');
    } else {
      setContent('');
      setMediaUrl('');
      setStatus('process');
      setUploadedImageUrl('');
    }
  }, [post, isOpen]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setUploadedImageUrl(imageUrl);
      setMediaUrl(''); // Clear the manual URL input
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } else if (error) {
      toast({
        title: "Upload failed",
        description: error,
        variant: "destructive",
      });
    }
  };

  const removeUploadedImage = () => {
    setUploadedImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const finalImageUrl = uploadedImageUrl || mediaUrl;

  const handleSave = () => {
    onSave({
      date: selectedDate,
      content,
      mediaUrl: finalImageUrl,
      status,
      organizationId
    });
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onClose();
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() && post?.id && onAddComment) {
      onAddComment(post.id, newComment.trim(), reviewerName || 'Anonymous');
      setNewComment("");
      setReviewerName("");
    }
  };

  const handleApprove = () => {
    if (post?.id && onAddReview) {
      onAddReview(post.id, 'approved', reviewNotes || undefined, reviewerName || 'Anonymous');
      setReviewNotes("");
      setReviewerName("");
    }
  };

  const handleReject = () => {
    if (post?.id && onAddReview) {
      onAddReview(post.id, 'rejected', reviewNotes || undefined, reviewerName || 'Anonymous');
      setReviewNotes("");
      setReviewerName("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {post ? 'Edit Post' : 'Create New Post'} - {new Date(selectedDate).toLocaleDateString()}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={shareMode && accessType === 'view' ? 'preview' : 'edit'} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {(!shareMode || accessType === 'edit') && <TabsTrigger value="edit">Edit Post</TabsTrigger>}
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit" className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="content">Post Content</Label>
            <Textarea
              id="content"
              placeholder="What's on your mind for Facebook?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Image/Media</Label>
            
            {/* Image Upload Section */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
              {/* Uploaded Image Preview */}
              {uploadedImageUrl && (
                <div className="relative">
                  <img
                    src={uploadedImageUrl}
                    alt="Uploaded preview"
                    className="w-full h-32 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeUploadedImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {/* Manual URL Input (only show if no uploaded image) */}
              {!uploadedImageUrl && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-px bg-border flex-1"></div>
                    <span className="text-xs text-muted-foreground">or paste URL</span>
                    <div className="h-px bg-border flex-1"></div>
                  </div>
                  <Input
                    id="mediaUrl"
                    placeholder="https://example.com/image.jpg"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: Post['status']) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="process">In Process</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {finalImageUrl && !uploadedImageUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <img
                src={finalImageUrl}
                alt="Media preview"
                className="w-full h-32 object-cover rounded-md border"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="flex justify-between">
            <div>
              {post && onDelete && (
                <Button variant="destructive" onClick={handleDelete} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!content.trim()}>
                {post ? 'Update' : 'Create'} Post
              </Button>
            </div>
          </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4 py-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4 text-center">Facebook Preview</h3>
                <SocialPreview 
                  content={content}
                  mediaUrl={finalImageUrl}
                  platform="facebook"
                  organizationName={organizationName}
                />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4 text-center">Instagram Preview</h3>
                <SocialPreview 
                  content={content}
                  mediaUrl={finalImageUrl}
                  platform="instagram"
                  organizationName={organizationName}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4 py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Comments</h3>
              
              {post?.comments && post.comments.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium">{comment.created_by}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No comments yet</p>
              )}

              <div className="border-t pt-4 space-y-3">
                <div>
                  <Label htmlFor="reviewer-name">Your Name (optional)</Label>
                  <Input
                    id="reviewer-name"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <Label htmlFor="new-comment">Add Comment</Label>
                  <Textarea
                    id="new-comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add your feedback..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  Add Comment
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="review" className="space-y-4 py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Post Review</h3>
              
              {post?.reviews && post.reviews.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {post.reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        {review.status === 'approved' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium capitalize">{review.status}</span>
                        <span className="text-sm text-gray-500">by {review.reviewed_by}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.review_notes && (
                        <p className="text-sm">{review.review_notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No reviews yet</p>
              )}

              {shareMode && (
                <div className="border-t pt-4 space-y-3">
                  <div>
                    <Label htmlFor="reviewer-name-review">Your Name (optional)</Label>
                    <Input
                      id="reviewer-name-review"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="review-notes">Review Notes (optional)</Label>
                    <Textarea
                      id="review-notes"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add your review notes..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Post
                    </Button>
                    <Button onClick={handleReject} variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Post
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}