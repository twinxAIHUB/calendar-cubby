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
import { Trash2, Upload, X, Image as ImageIcon } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useToast } from "@/hooks/use-toast";

export interface Post {
  id: string;
  date: string;
  content: string;
  mediaUrl: string;
  status: 'process' | 'scheduled' | 'posted';
  organizationId: string;
}

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Omit<Post, 'id'>) => void;
  onDelete?: () => void;
  post?: Post;
  selectedDate: string;
  organizationId: string;
}

export function PostModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  post,
  selectedDate,
  organizationId
}: PostModalProps) {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [status, setStatus] = useState<Post['status']>('process');
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {post ? 'Edit Post' : 'Create New Post'} - {new Date(selectedDate).toLocaleDateString()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
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
        </div>

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
      </DialogContent>
    </Dialog>
  );
}