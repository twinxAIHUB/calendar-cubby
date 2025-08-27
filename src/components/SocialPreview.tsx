import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share, MoreHorizontal, ThumbsUp } from "lucide-react";

interface SocialPreviewProps {
  content: string;
  mediaUrl: string;
  platform: 'facebook' | 'instagram';
  organizationName: string;
}

export function SocialPreview({ content, mediaUrl, platform, organizationName }: SocialPreviewProps) {
  if (platform === 'facebook') {
    return (
      <Card className="w-full max-w-md mx-auto bg-background border">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center gap-3 p-3 border-b">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {organizationName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm text-foreground">{organizationName}</h3>
              <p className="text-xs text-muted-foreground">Just now • 🌍</p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-3">
            <p className="text-sm text-foreground whitespace-pre-wrap">{content}</p>
          </div>

          {/* Media */}
          {mediaUrl && (
            <div className="border-t border-b">
              <img 
                src={mediaUrl} 
                alt="Post media" 
                className="w-full h-64 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="p-3 border-t">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm">Like</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">Comment</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                <Share className="h-4 w-4" />
                <span className="text-sm">Share</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Instagram
  return (
    <Card className="w-full max-w-md mx-auto bg-background border">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center gap-3 p-3 border-b">
          <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full p-[2px]">
            <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-foreground">
                {organizationName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-sm text-foreground">{organizationName}</h3>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Media */}
        {mediaUrl && (
          <div className="aspect-square">
            <img 
              src={mediaUrl} 
              alt="Post media" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Actions */}
        <div className="p-3">
          <div className="flex items-center gap-4 mb-3">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Heart className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Share className="h-6 w-6" />
            </Button>
          </div>

          {/* Content */}
          <div className="text-sm text-foreground">
            <span className="font-medium">{organizationName}</span>
            <span className="ml-2">{content}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}