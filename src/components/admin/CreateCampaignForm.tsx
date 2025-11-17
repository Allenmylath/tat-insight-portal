import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AudiencePreview } from "./AudiencePreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailTemplates } from "./EmailTemplates";

const formSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  subject_line: z.string().min(1, "Subject line is required"),
  email_body: z.string().min(1, "Email body is required"),
  preview_text: z.string().optional(),
  min_tests: z.number().min(1).optional(),
  max_days_since_test: z.number().optional(),
  lead_status: z.array(z.string()).optional(),
  offer_type: z.string().optional(),
  offer_value: z.number().optional(),
  offer_code: z.string().optional(),
  max_recipients: z.number().optional(),
  send_immediately: z.boolean().default(false),
});

interface CreateCampaignFormProps {
  onSuccess: () => void;
}

export function CreateCampaignForm({ onSuccess }: CreateCampaignFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject_line: "",
      email_body: "",
      min_tests: 1,
      lead_status: ["hot_lead", "warm_lead"],
      send_immediately: false,
    },
  });

  const watchedValues = form.watch();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .single();

      if (!userData) throw new Error("User not found");

      // Prepare target audience
      const targetAudience: any = {
        is_free_user: true,
      };

      if (values.min_tests) targetAudience.min_tests = values.min_tests;
      if (values.max_days_since_test) targetAudience.max_days_since_test = values.max_days_since_test;
      if (values.lead_status && values.lead_status.length > 0) {
        targetAudience.lead_status = values.lead_status;
      }

      // Create campaign
      const { data: campaign, error } = await supabase
        .from('email_campaigns')
        .insert({
          name: values.name,
          description: values.description,
          subject_line: values.subject_line,
          email_body: values.email_body,
          preview_text: values.preview_text,
          target_audience: targetAudience,
          offer_type: values.offer_type,
          offer_value: values.offer_value,
          offer_code: values.offer_code,
          max_recipients: values.max_recipients,
          status: values.send_immediately ? 'scheduled' : 'draft',
          scheduled_for: values.send_immediately ? new Date().toISOString() : null,
          created_by: userData.id,
        })
        .select()
        .single();

      if (error) throw error;

      // If send immediately, trigger send
      if (values.send_immediately && campaign) {
        await supabase.functions.invoke('send-campaign', {
          body: { campaignId: campaign.id },
        });
        toast.success("Campaign created and sending now!");
      } else {
        toast.success("Campaign created successfully!");
      }

      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      onSuccess();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error("Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateSelect = (template: { subject: string; body: string }) => {
    form.setValue('subject_line', template.subject);
    form.setValue('email_body', template.body);
    setCurrentStep(3);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Campaign</CardTitle>
        <CardDescription>
          Step {currentStep} of 4: {
            currentStep === 1 ? "Campaign Basics" :
            currentStep === 2 ? "Target Audience" :
            currentStep === 3 ? "Email Content" :
            "Review & Send"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First Purchase Incentive" {...field} />
                      </FormControl>
                      <FormDescription>Internal name for this campaign</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Target free users with 2+ tests..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="button" onClick={() => setCurrentStep(2)}>
                    Next: Target Audience
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="min_tests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Tests Completed</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(parseInt(val))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select minimum tests" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1+ tests</SelectItem>
                          <SelectItem value="2">2+ tests</SelectItem>
                          <SelectItem value="3">3+ tests</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_days_since_test"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Days Since Last Test (Optional)</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val ? parseInt(val) : undefined)}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Any time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="7">Last 7 days</SelectItem>
                          <SelectItem value="14">Last 14 days</SelectItem>
                          <SelectItem value="30">Last 30 days</SelectItem>
                          <SelectItem value="60">Last 60 days</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lead_status"
                  render={() => (
                    <FormItem>
                      <FormLabel>Lead Status</FormLabel>
                      <div className="space-y-2">
                        {['hot_lead', 'warm_lead', 'cold_lead'].map((status) => (
                          <FormField
                            key={status}
                            control={form.control}
                            name="lead_status"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(status)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      field.onChange(
                                        checked
                                          ? [...current, status]
                                          : current.filter((v) => v !== status)
                                      );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal capitalize">
                                  {status.replace('_', ' ')}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormDescription>
                        Hot: 3+ tests | Warm: 2+ tests | Cold: 1 test
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AudiencePreview
                  minTests={watchedValues.min_tests}
                  maxDaysSinceTest={watchedValues.max_days_since_test}
                  leadStatus={watchedValues.lead_status}
                />

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button type="button" onClick={() => setCurrentStep(3)}>
                    Next: Email Content
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <Tabs defaultValue="custom">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="custom">Custom Email</TabsTrigger>
                  <TabsTrigger value="templates">Use Template</TabsTrigger>
                </TabsList>
                <TabsContent value="custom" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subject_line"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject Line</FormLabel>
                        <FormControl>
                          <Input placeholder="{{first_name}}, unlock your potential! 🎯" {...field} />
                        </FormControl>
                        <FormDescription>
                          Use {`{{first_name}}`} for personalization
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email_body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Body (HTML)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="<h1>Hi {{first_name}}!</h1><p>Your content here...</p>" 
                            {...field} 
                            rows={10}
                          />
                        </FormControl>
                        <FormDescription>
                          Use {`{{first_name}}`}, {`{{credits_balance}}`} for personalization
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                      Back
                    </Button>
                    <Button type="button" onClick={() => setCurrentStep(4)}>
                      Next: Review & Send
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="templates">
                  <EmailTemplates onSelectTemplate={handleTemplateSelect} />
                </TabsContent>
              </Tabs>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="max_recipients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Recipients (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Leave empty for no limit" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="send_immediately"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Send campaign immediately
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : watchedValues.send_immediately ? "Create & Send" : "Create Campaign"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}