import { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadImage } from '@/integrations/firebase/storage';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
}

export const ImageUpload = ({
  value,
  onChange,
  folder = 'uploads',
  className,
  aspectRatio = 'video',
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleUploadClick = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = useCallback(async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      // Upload to Firebase Storage and save metadata to Firestore
      const { url } = await uploadImage(file, folder, undefined, user?.uid);
      onChange(url);
      toast.success('Image uploaded successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image';
      setError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }, [folder, onChange, user?.uid]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  }, [handleImageUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  const aspectRatioClass = {
    square: 'aspect-square max-h-48 sm:max-h-64',
    video: 'aspect-video max-h-40 sm:max-h-52',
    wide: 'aspect-[21/9] max-h-32 sm:max-h-40',
  }[aspectRatio];

  if (value) {
    return (
      <div className={cn('relative rounded-lg overflow-hidden border', aspectRatioClass, className)}>
        <img
          src={value}
          alt="Uploaded"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 border-dashed transition-colors cursor-pointer',
        dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
        error ? 'border-destructive' : '',
        isUploading ? 'cursor-wait' : '',
        aspectRatioClass,
        className
      )}
      onClick={handleUploadClick}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={isUploading}
        className="hidden"
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 pointer-events-none">
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Uploading...
            </p>
          </>
        ) : (
          <>
            {error ? (
              <AlertCircle className="h-8 w-8 text-destructive" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium">
                {dragActive ? 'Drop image here' : 'Click or drag to upload'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Any image format • Auto-compressed to ~14KB • WebP format
              </p>
              {error && (
                <p className="text-xs text-destructive mt-2">{error}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
