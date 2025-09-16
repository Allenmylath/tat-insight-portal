import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export const AdminTatTestCreator = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [promptText, setPromptText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const uploadImageAndCreateTest = async () => {
    if (!imageFile || !title || !promptText) {
      toast({
        title: "Missing fields",
        description: "Please fill in title, prompt text, and select an image",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      console.log('Starting test creation process...');
      console.log('Image file:', imageFile.name, 'Size:', imageFile.size);
      
      // Upload image to Supabase storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      console.log('Uploading file:', fileName);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tat-images')
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tat-images')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);

      // Create tattest entry
      console.log('Creating tattest entry...');
      const { data, error } = await supabase
        .from('tattest')
        .insert({
          title,
          description,
          prompt_text: promptText,
          image_url: publicUrl,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Test created successfully:', data);

      toast({
        title: "Success!",
        description: "TAT test created successfully"
      });

      // Reset form
      setTitle('');
      setDescription('');
      setPromptText('');
      setImageFile(null);
      
    } catch (error) {
      console.error('Error creating TAT test:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create TAT test",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New TAT Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter test title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter test description"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="promptText">Prompt Text</Label>
          <Textarea
            id="promptText"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Enter the prompt text for this TAT test"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Test Image</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
          {imageFile && (
            <p className="text-sm text-muted-foreground">
              Selected: {imageFile.name}
            </p>
          )}
        </div>

        <Button 
          onClick={uploadImageAndCreateTest}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? 'Creating...' : 'Create TAT Test'}
        </Button>
      </CardContent>
    </Card>
  );
};