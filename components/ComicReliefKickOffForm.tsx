"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "./ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { toast } from "sonner"
import { mapFormDataToJira } from "../lib/jira-field-mapping"
import { Loader2, Send, CheckCircle, AlertCircle } from "lucide-react"
import { EpicSelector } from "./ProjectManagementComponents"

const formSchema = z.object({
  // Basic Information
  yourName: z.string().min(1, "Your name is required"),
  directorate: z.string().min(1, "Please select your directorate"),
  portfolio: z.string().min(1, "Please select your portfolio"),
  campaign: z.string().min(1, "Please select a campaign"),
  
  // Project Information - conditionally required
  projectName: z.string().optional(),
  projectOverview: z.string().optional(),
  
  // Epic Management
  hasPreviousBrief: z.enum(["yes", "no"], {
    required_error: "Please specify if a brief has been previously submitted"
  }),
  selectedEpicKey: z.string().optional(),
  
  // Key Dates and Times
  projectLiveDate: z.string().min(1, "Project live date is required"),
  
  // Project Requirements (Pre-formatted content)
  projectRequirements: z.string().min(50, "Please provide detailed project requirements (minimum 50 characters)"),
  
  // Budget Information
  hasBudget: z.enum(["yes", "no"], {
    required_error: "Please specify if you have budget allocated"
  }),
  budgetAmount: z.string().optional(),
  budgetCode: z.string().optional(),
  
  // Talent Requirements
  requiresTalent: z.enum(["yes", "no"], {
    required_error: "Please specify if talent is required"
  }),
  talentRequirements: z.string().optional(),
  talentImpact: z.string().optional(),
  budgetBreakdownDescription: z.string().optional(),
  
  // Story Gathering
  requiresStoryGathering: z.enum(["yes", "no"], {
    required_error: "Please specify if story gathering is required"
  }),
  storyOverview: z.string().optional(),
  feelGoodFactor: z.string().optional(),
  fundedPartnerDetails: z.string().optional(),
  thematicAreas: z.string().optional(),
  willBeUsedInAnotherAsset: z.string().optional(),
  
  // Technical Requirements
  requiresNewTechFunctionality: z.enum(["yes", "no"], {
    required_error: "Please specify if new tech functionality is required"
  }),
  techRequirements: z.string().optional(),
  
  // Supporting Documents
  supportingDocuments: z.string().optional(),
}).refine((data) => {
  // Dynamic validation - project name and overview only required for new projects
  if (data.hasPreviousBrief === "no") {
    return data.projectName && data.projectName.length > 0 &&
           data.projectOverview && data.projectOverview.length >= 10
  }
  return true
}, {
  message: "Project name and overview are required when creating a new project",
  path: ["projectName"]
})

type FormData = z.infer<typeof formSchema>

const WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/12809750/2vn5sae/"
const AGENT_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/12809750/1a56023f84854953847fcb4d11399be9/"

// Default pre-formatted content for project requirements
const DEFAULT_PROJECT_REQUIREMENTS = `h2. Fundraising Target
How much are you hoping to raise?

h2. Target Audience  
Who are you targeting and what do we know about them (values, motivations, barriers, past responses)?

h2. Desired Action
What action do we want our audiences to take? What's the core call-to-action and why should they act?

h2. Data Requirements
Outline the data requirements you need to plan and measure your activity.`

export function ComicReliefKickOffForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const hasSubmittedRef = useRef(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      yourName: "",
      directorate: "",
      portfolio: "",
      campaign: "",
      projectName: "",
      projectOverview: "",
      hasPreviousBrief: undefined,
      selectedEpicKey: "",
      projectLiveDate: "",
      projectRequirements: DEFAULT_PROJECT_REQUIREMENTS,
      hasBudget: undefined,
      budgetAmount: "",
      budgetCode: "",
      requiresTalent: undefined,
      talentRequirements: "",
      talentImpact: "",
      budgetBreakdownDescription: "",
      requiresStoryGathering: undefined,
      storyOverview: "",
      feelGoodFactor: "",
      fundedPartnerDetails: "",
      thematicAreas: "",
      willBeUsedInAnotherAsset: "",
      requiresNewTechFunctionality: undefined,
      techRequirements: "",
      supportingDocuments: "",
    },
  })

  const hasPreviousBrief = form.watch("hasPreviousBrief")
  const requiresTalent = form.watch("requiresTalent")
  const requiresStoryGathering = form.watch("requiresStoryGathering")
  const requiresNewTechFunctionality = form.watch("requiresNewTechFunctionality")
  const hasBudget = form.watch("hasBudget")

  const handleEpicSelect = (epicKey: string) => {
    form.setValue("selectedEpicKey", epicKey)
  }

  async function onSubmit(data: FormData) {
    if (hasSubmittedRef.current) {
      toast.error("Form has already been submitted")
      return
    }

    setIsSubmitting(true)
    setSubmissionStatus('idle')

    try {
      // Validate Epic selection if updating existing brief
      if (data.hasPreviousBrief === "yes" && !data.selectedEpicKey) {
        throw new Error("Please select an existing Epic to update")
      }

      // Map form data to Jira format
      const jiraData = mapFormDataToJira(data, "Quick Kick-off Form")
      
      console.log('Submitting to webhook:', {
        url: WEBHOOK_URL,
        formType: "Quick Kick-off Form",
        jiraData: jiraData
      })

      // Submit to main webhook
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jiraData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Webhook request failed: ${response.status} ${response.statusText}. ${errorText}`)
      }

      // Submit to agent webhook
      try {
        await fetch(AGENT_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(jiraData),
        })
      } catch (agentError) {
        console.warn("Agent webhook failed:", agentError)
        // Don't fail the main submission if agent webhook fails
      }

      hasSubmittedRef.current = true
      setSubmissionStatus('success')
      setShowSuccessMessage(true)
      
      const operationType = data.hasPreviousBrief === "yes" ? "updated" : "created"
      const epicInfo = data.selectedEpicKey ? ` (Epic: ${data.selectedEpicKey})` : ""
      
      toast.success(`Quick Kick-off Form submitted successfully! Epic ${operationType}${epicInfo}`)
      
    } catch (error) {
      console.error("Submission error:", error)
      setSubmissionStatus('error')
      toast.error(error instanceof Error ? error.message : "Failed to submit form. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showSuccessMessage) {
    const operationType = form.getValues("hasPreviousBrief") === "yes" ? "updated" : "created"
    const epicKey = form.getValues("selectedEpicKey")
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1>Quick Kick-off Form</h1>
          <p className="text-muted-foreground">Submitted successfully!</p>
        </div>
        
        <Card className="p-8 text-center border-green-200 bg-green-50">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-green-800 mb-2">Form Submitted Successfully!</h2>
          <p className="text-green-700 mb-4">
            Your Quick Kick-off Form has been submitted and the Epic has been {operationType}
            {epicKey && ` (${epicKey})`}.
          </p>
          <p className="text-green-600">
            The project team will review your submission and follow up accordingly.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">QUICK KICK-OFF FORM</h1>
        <p className="text-sm text-gray-600">
          Provide initial project details for quick turnaround activities
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 mb-4">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="yourName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="directorate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Directorate *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your directorate" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fundraising">Fundraising & Marketing</SelectItem>
                        <SelectItem value="impact">Impact & Innovation</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="people_culture">People & Culture</SelectItem>
                        <SelectItem value="finance_resources">Finance & Resources</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="portfolio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your portfolio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="individual_regular_giving">Individual and Regular Giving</SelectItem>
                        <SelectItem value="schools_youth_community">Schools Youth and Community Fundraising</SelectItem>
                        <SelectItem value="events_challenges">Events and Challenges</SelectItem>
                        <SelectItem value="prizes">Prizes</SelectItem>
                        <SelectItem value="shop_merchandise">Shop and Merchandise</SelectItem>
                        <SelectItem value="supporter_services">Supporter Services</SelectItem>
                        <SelectItem value="partnerships">Partnerships</SelectItem>
                        <SelectItem value="philanthropy">Philanthropy</SelectItem>
                        <SelectItem value="data_analytics">Data and Analytics</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="campaign"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select campaign" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cr365">CR365</SelectItem>
                        <SelectItem value="rnd26">RND26</SelectItem>
                        <SelectItem value="sr25">SR25</SelectItem>
                        <SelectItem value="rnd27">RND27</SelectItem>
                        <SelectItem value="sr26">SR26</SelectItem>
                        <SelectItem value="cr25_winter">CR25 Winter</SelectItem>
                        <SelectItem value="cr26_winter">CR26 Winter</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Project Information */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 mb-4">Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="hasPreviousBrief"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Has a brief been previously submitted for this project? *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="no">No - This is a new project</SelectItem>
                        <SelectItem value="yes">Yes - Update existing Epic</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {hasPreviousBrief === "yes" && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h4>Select Existing Epic to Update</h4>
                  <EpicSelector 
                    onEpicSelect={handleEpicSelect}
                    selectedEpicKey={form.watch("selectedEpicKey")}
                  />
                  {form.formState.errors.selectedEpicKey && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.selectedEpicKey.message}
                    </p>
                  )}
                </div>
              )}

              {hasPreviousBrief === "no" && (
                <>
                  <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter the project name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectOverview"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Overview *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide a brief overview of the project"
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Key Dates and Times */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 mb-4">Key Dates And Times</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="projectLiveDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>When will this project go live? *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Project Requirements */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 mb-4">Project Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="projectRequirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Requirements *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Complete the sections below with your project requirements"
                        className="min-h-[300px] font-mono"
                        {...field} 
                      />
                    </FormControl>
                    <div className="text-sm text-muted-foreground">
                      Complete each section with your specific requirements. This content will be formatted in Jira.
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Budget Information */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 mb-4">Budget Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="hasBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Do you have budget allocated for this project? *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {hasBudget === "yes" && (
                <>
                  <FormField
                    control={form.control}
                    name="budgetAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Amount</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., £10,000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budgetCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter budget code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Talent Requirements */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 mb-4">Talent Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="requiresTalent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Does this project require talent? *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {requiresTalent === "yes" && (
                <>
                  <FormField
                    control={form.control}
                    name="talentRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Talent Requirements</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the talent requirements for this project"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="talentImpact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Talent Impact</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="How will talent impact this project?"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budgetBreakdownDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Breakdown Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide a breakdown of talent-related costs"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Story Gathering */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 mb-4">Story Gathering</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="requiresStoryGathering"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Does this project require story gathering? *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {requiresStoryGathering === "yes" && (
                <>
                  <FormField
                    control={form.control}
                    name="storyOverview"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Story Overview</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide an overview of the story requirements"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="feelGoodFactor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feel Good Factor</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the feel good factor of the story"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fundedPartnerDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funded Partner Details</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Details about funded partners involved"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="thematicAreas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thematic Areas</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What thematic areas does this story cover?"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="willBeUsedInAnotherAsset"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Will this be used in another asset?</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe if this story will be used elsewhere"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Technical Requirements */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 mb-4">Technical Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="requiresNewTechFunctionality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Does this project require new tech functionality? *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {requiresNewTechFunctionality === "yes" && (
                <FormField
                  control={form.control}
                  name="techRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technical Requirements</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the technical requirements"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Supporting Documents */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 mb-4">Supporting Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="supportingDocuments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supporting Documents</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List any supporting documents or links"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[120px] bg-black hover:bg-gray-800 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Form"
              )}
            </Button>
          </div>

          {submissionStatus === 'error' && (
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>Failed to submit form. Please try again.</span>
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}