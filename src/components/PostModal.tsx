import { useState, useEffect } from "react";
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
import { Trash2 } from "lucide-react";

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

  useEffect(() => {
    if (post) {
      setContent(post.content);
      setMediaUrl(post.mediaUrl);
      setStatus(post.status);
    } else {
      setContent('');
      setMediaUrl('');
      setStatus('process');
    }
  }, [post, isOpen]);

  const handleSave = () => {
    onSave({
      date: selectedDate,
      content,
      mediaUrl,
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
            <Label htmlFor="mediaUrl">Image/Media URL</Label>
            <Input
              id="mediaUrl"
              placeholder="https://example.com/image.jpg"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />
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

          {mediaUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <img
                src={mediaUrl}
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