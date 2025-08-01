import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Image, Video, Mic, File, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MediaUploadProps {
  onMediaUpload: (url: string, type: string) => void;
  onClose: () => void;
}

export const MediaUpload = ({ onMediaUpload, onClose }: MediaUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File, type: string) => {
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `media/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('couple-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('couple-media')
        .getPublicUrl(filePath);

      onMediaUpload(data.publicUrl, type);
      toast({
        title: "Upload Successful",
        description: "Media uploaded successfully!",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload media. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, type);
    }
  };

  return (
    <Card className="w-64 shadow-romantic border-love-pink/20 bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between p-3 border-b border-love-pink/20">
        <h4 className="font-medium text-sm">Share Media</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-3 space-y-2">
        {/* Photo Upload */}
        <label className="block">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => handleInputChange(e, 'image')}
            className="hidden"
            disabled={uploading}
          />
          <Button
            variant="ghost"
            className="w-full justify-start h-10 text-left"
            disabled={uploading}
            asChild
          >
            <div className="cursor-pointer">
              <Image className="w-4 h-4 mr-3 text-primary" />
              Photo
            </div>
          </Button>
        </label>

        {/* Video Upload */}
        <label className="block">
          <Input
            type="file"
            accept="video/*"
            onChange={(e) => handleInputChange(e, 'video')}
            className="hidden"
            disabled={uploading}
          />
          <Button
            variant="ghost"
            className="w-full justify-start h-10 text-left"
            disabled={uploading}
            asChild
          >
            <div className="cursor-pointer">
              <Video className="w-4 h-4 mr-3 text-primary" />
              Video
            </div>
          </Button>
        </label>

        {/* Audio Upload */}
        <label className="block">
          <Input
            type="file"
            accept="audio/*"
            onChange={(e) => handleInputChange(e, 'audio')}
            className="hidden"
            disabled={uploading}
          />
          <Button
            variant="ghost"
            className="w-full justify-start h-10 text-left"
            disabled={uploading}
            asChild
          >
            <div className="cursor-pointer">
              <Mic className="w-4 h-4 mr-3 text-primary" />
              Voice Note
            </div>
          </Button>
        </label>

        {/* File Upload */}
        <label className="block">
          <Input
            type="file"
            onChange={(e) => handleInputChange(e, 'file')}
            className="hidden"
            disabled={uploading}
          />
          <Button
            variant="ghost"
            className="w-full justify-start h-10 text-left"
            disabled={uploading}
            asChild
          >
            <div className="cursor-pointer">
              <File className="w-4 h-4 mr-3 text-primary" />
              Document
            </div>
          </Button>
        </label>

        {uploading && (
          <div className="text-center py-2">
            <div className="text-sm text-muted-foreground">Uploading...</div>
          </div>
        )}
      </div>
    </Card>
  );
};