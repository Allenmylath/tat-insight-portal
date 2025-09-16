import { supabase } from '@/integrations/supabase/client';

export const createTatTestFromImage = async () => {
  try {
    // Read the uploaded image
    const response = await fetch('/src/assets/tatim.jpeg');
    const blob = await response.blob();
    
    // Create a File object
    const file = new File([blob], 'tatim.jpeg', { type: 'image/jpeg' });
    
    // Upload to Supabase storage
    const fileName = `tatim-${Date.now()}.jpeg`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tat-images')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('tat-images')
      .getPublicUrl(fileName);

    // Create tattest entry
    const { data, error } = await supabase
      .from('tattest')
      .insert({
        title: 'Contemplative Portrait TAT Test',
        description: 'A psychological assessment featuring a contemplative portrait that invites storytelling and personality analysis.',
        prompt_text: 'Look at this image carefully. What story does it tell you? Describe what you see happening, what the person might be thinking or feeling, and what events might have led to this moment. Include what you think might happen next.',
        image_url: publicUrl,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('TAT test created successfully:', data);
    return data;
    
  } catch (error) {
    console.error('Error creating TAT test:', error);
    throw error;
  }
};

// Auto-execute this function
createTatTestFromImage();