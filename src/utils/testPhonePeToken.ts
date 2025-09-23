import { supabase } from "@/integrations/supabase/client";

export async function testPhonePeTokenGeneration() {
  try {
    console.log('Testing PhonePe token generation...');
    
    const { data, error } = await supabase.functions.invoke('generate-phonepe-token', {
      body: {}
    });

    if (error) {
      console.error('Error calling function:', error);
      return { success: false, error: error.message };
    }

    console.log('Function response:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Exception:', err);
    return { success: false, error: err.message };
  }
}