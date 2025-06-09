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
import { Checkbox } from "./ui/checkbox"
import { Separator } from "./ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import { toast } from "sonner"
import { mapFormDataToJira } from "../lib/jira-field-mapping"
import { Loader2, Send, CheckCircle, AlertCircle, Check } from "lucide-react"
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
  
  // Asset Requirements
  requiresSpecificAssets: z.enum(["yes", "no"], {
    required_error: "Please specify if specific assets are required"
  }),
  selectedAssetTypes: z.array(z.string()).optional(),
  
  // Asset Type Specific Fields (removed fields for deleted asset types)
  videoApprovedCopy: z.string().optional(),
  videoContentLocations: z.string().optional(),
  videoDeliverables: z.string().optional(),
  photographyApprovedCopy: z.string().optional(),
  photographyContentLocations: z.string().optional(),
  photographyDeliverables: z.string().optional(),
  graphicDesignApprovedCopy: z.string().optional(),
  graphicDesignContentLocations: z.string().optional(),
  graphicDesignDeliverables: z.string().optional(),
  printMaterialsApprovedCopy: z.string().optional(),
  printMaterialsContentLocations: z.string().optional(),
  printMaterialsDeliverables: z.string().optional(),
  socialMediaContentApprovedCopy: z.string().optional(),
  socialMediaContentContentLocations: z.string().optional(),
  socialMediaContentDeliverables: z.string().optional(),
  animationApprovedCopy: z.string().optional(),
  animationContentLocations: z.string().optional(),
  animationDeliverables: z.string().optional(),
  
  // Touchpoints
  selectedTouchpoints: z.array(z.string()).optional(),
  organicSocial: z.boolean().optional(),
  dreamSocialChannels: z.array(z.string()).optional(),
  socialPostDescription: z.string().optional(),
  socialPurposeImpact: z.string().optional(),
  webPages: z.boolean().optional(),
  emails: z.boolean().optional(),
  pr: z.boolean().optional(),
  ads: z.boolean().optional(),
  
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

// Asset type options - removed the 6 specified types
const ASSET_TYPE_OPTIONS = [
  { label: "Video", value: "video" },
  { label: "Photography", value: "photography" }, 
  { label: "Graphic Design", value: "graphicDesign" },
  { label: "Print Materials", value: "printMaterials" },
  { label: "Social Media Content", value: "socialMediaContent" },
  { label: "Animation", value: "animation" }
]

// Dream social channel options (specific to the touchpoints section)
const DREAM_SOCIAL_CHANNEL_OPTIONS = [
  "LinkedIn",
  "Instagram", 
  "Insta Stories",
  "Facebook",
  "YouTube",
  "TikTok",
  "YT Shorts"
]

export function ComicReliefForm() {
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
      requiresSpecificAssets: undefined,
      selectedAssetTypes: [],
      selectedTouchpoints: [],
      organicSocial: false,
      dreamSocialChannels: [],
      socialPostDescription: "",
      socialPurposeImpact: "",
      webPages: false,
      emails: false,
      pr: false,
      ads: false,
      supportingDocuments: "",
    },
  })

  const hasPreviousBrief = form.watch("hasPreviousBrief")
  const requiresTalent = form.watch("requiresTalent")
  const requiresStoryGathering = form.watch("requiresStoryGathering")
  const requiresNewTechFunctionality = form.watch("requiresNewTechFunctionality")
  const requiresSpecificAssets = form.watch("requiresSpecificAssets")
  const hasBudget = form.watch("hasBudget")

  // Watch touchpoint values for visual indicators
  const organicSocial = form.watch("organicSocial")
  const webPages = form.watch("webPages")
  const emails = form.watch("emails")
  const pr = form.watch("pr")
  const ads = form.watch("ads")

  // Watch selected asset types
  const selectedAssetTypes = form.watch("selectedAssetTypes") || []

  const handleEpicSelect = (epicKey: string) => {
    form.setValue("selectedEpicKey", epicKey)
  }

  const handleTouchpointToggle = (touchpoint: string, checked: boolean) => {
    const currentTouchpoints = form.watch("selectedTouchpoints") || []
    if (checked) {
      form.setValue("selectedTouchpoints", [...currentTouchpoints, touchpoint])
    } else {
      form.setValue("selectedTouchpoints", currentTouchpoints.filter(t => t !== touchpoint))
    }
  }

  const handleAssetTypeToggle = (assetType: string, checked: boolean) => {
    const currentAssetTypes = form.watch("selectedAssetTypes") || []
    if (checked) {
      form.setValue("selectedAssetTypes", [...currentAssetTypes, assetType])
    } else {
      form.setValue("selectedAssetTypes", currentAssetTypes.filter(t => t !== assetType))
    }
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
      const jiraData = mapFormDataToJira(data, "Full Production Brief")
      
      console.log('Submitting to webhook:', {
        url: WEBHOOK_URL,
        formType: "Full Production Brief",
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
      
      toast.success(`Full Production Brief submitted successfully! Epic ${operationType}${epicInfo}`)
      
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
          <h1>Full Production Brief</h1>
          <p className="text-muted-foreground">Submitted successfully!</p>
        </div>
        
        <Card className="p-8 text-center border-green-200 bg-green-50">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-green-800 mb-2">Form Submitted Successfully!</h2>
          <p className="text-green-700 mb-4">
            Your Full Production Brief has been submitted and the Epic has been {operationType}
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
        <h1>Full Production Brief</h1>
        <p className="text-muted-foreground">
          Comprehensive project requirements for complex productions
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
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
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
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
          <Card>
            <CardHeader>
              <CardTitle>Key Dates And Times</CardTitle>
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
          <Card>
            <CardHeader>
              <CardTitle>Project Requirements</CardTitle>
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
          <Card>
            <CardHeader>
              <CardTitle>Budget Information</CardTitle>
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
          <Card>
            <CardHeader>
              <CardTitle>Talent Requirements</CardTitle>
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
          <Card>
            <CardHeader>
              <CardTitle>Story Gathering</CardTitle>
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
          <Card>
            <CardHeader>
              <CardTitle>Technical Requirements</CardTitle>
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

          {/* Asset Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="requiresSpecificAssets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Does this project require specific assets? *</FormLabel>
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

              {requiresSpecificAssets === "yes" && (
                <Accordion type="multiple" className="w-full">
                  {ASSET_TYPE_OPTIONS.map((assetType) => (
                    <AccordionItem key={assetType.value} value={assetType.value} className="mb-4">
                      <AccordionTrigger className={`px-6 py-4 rounded-lg transition-colors ${
                        selectedAssetTypes.includes(assetType.value) ? 'bg-blue-50 border border-blue-200' : 'bg-muted/20 hover:bg-muted/50'
                      }`}>
                        <div className="flex items-center gap-3">
                          {selectedAssetTypes.includes(assetType.value) && <Check className="w-5 h-5 text-green-600" />}
                          <span className="font-medium">{assetType.label}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 py-4 space-y-6 bg-white border border-gray-100 rounded-b-lg">
                        <FormField
                          control={form.control}
                          name="selectedAssetTypes"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(assetType.value)}
                                  onCheckedChange={(checked) => {
                                    handleAssetTypeToggle(assetType.value, !!checked)
                                    return checked
                                      ? field.onChange([...(field.value || []), assetType.value])
                                      : field.onChange(field.value?.filter((value) => value !== assetType.value))
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Include {assetType.label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />

                        {selectedAssetTypes.includes(assetType.value) && (
                          <>
                            <FormField
                              control={form.control}
                              name={`${assetType.value}ApprovedCopy` as keyof FormData}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{assetType.label} - Approved Copy</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder={`Provide any approved copy for ${assetType.label.toLowerCase()}`}
                                      className="min-h-[100px]"
                                      value={field.value as string || ""}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`${assetType.value}ContentLocations` as keyof FormData}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{assetType.label} - Content Locations</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder={`Where will this ${assetType.label.toLowerCase()} content be used?`}
                                      className="min-h-[100px]"
                                      value={field.value as string || ""}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`${assetType.value}Deliverables` as keyof FormData}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{assetType.label} - Deliverables</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder={`List the specific ${assetType.label.toLowerCase()} deliverables needed`}
                                      className="min-h-[150px]"
                                      value={field.value as string || ""}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          {/* Touchpoints */}
          <Card>
            <CardHeader>
              <CardTitle>Touchpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Have you mapped out the user journey for this project? If so which of these touchpoints will the users see this content?
              </p>
              
              <Tabs defaultValue="organic-social" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="organic-social" className={`flex items-center gap-2 ${organicSocial ? 'bg-blue-100 border border-blue-300' : ''}`}>
                    {organicSocial && <Check className="w-4 h-4 text-green-600" />}
                    Organic Social
                  </TabsTrigger>
                  <TabsTrigger value="web-pages" className={`flex items-center gap-2 ${webPages ? 'bg-blue-100 border border-blue-300' : ''}`}>
                    {webPages && <Check className="w-4 h-4 text-green-600" />}
                    Web Pages
                  </TabsTrigger>
                  <TabsTrigger value="emails" className={`flex items-center gap-2 ${emails ? 'bg-blue-100 border border-blue-300' : ''}`}>
                    {emails && <Check className="w-4 h-4 text-green-600" />}
                    Emails
                  </TabsTrigger>
                  <TabsTrigger value="pr" className={`flex items-center gap-2 ${pr ? 'bg-blue-100 border border-blue-300' : ''}`}>
                    {pr && <Check className="w-4 h-4 text-green-600" />}
                    PR
                  </TabsTrigger>
                  <TabsTrigger value="ads" className={`flex items-center gap-2 ${ads ? 'bg-blue-100 border border-blue-300' : ''}`}>
                    {ads && <Check className="w-4 h-4 text-green-600" />}
                    Ads
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="organic-social" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="organicSocial"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked)
                              handleTouchpointToggle("organic-social", !!checked)
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Use this touchpoint
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  {organicSocial && (
                    <>
                      <div className="border rounded-lg p-4 bg-muted/30">
                        <h4 className="mb-4 uppercase tracking-wide">Dream Social Channel</h4>
                        
                        <FormField
                          control={form.control}
                          name="dreamSocialChannels"
                          render={({ field }) => (
                            <FormItem>
                              <div className="grid grid-cols-3 gap-4">
                                {DREAM_SOCIAL_CHANNEL_OPTIONS.map((channel) => (
                                  <FormItem key={channel} className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(channel)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), channel])
                                            : field.onChange(field.value?.filter((value) => value !== channel))
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal uppercase tracking-wide">
                                      {channel}
                                    </FormLabel>
                                  </FormItem>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="socialPostDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="uppercase tracking-wide">Describe The Post(s) You Require?</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="What do you want the post to tell users?"
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="socialPurposeImpact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="uppercase tracking-wide">Purpose And Impact:</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="What is this post for? How will it help our channels?"
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </TabsContent>

                <TabsContent value="web-pages" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="webPages"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked)
                              handleTouchpointToggle("web-pages", !!checked)
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Use this touchpoint
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-800">
                      This touchpoint is yet to be integrated into this brief, reach out to the individual channel holder for briefing details.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="emails" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="emails"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked)
                              handleTouchpointToggle("emails", !!checked)
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Use this touchpoint
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-800">
                      This touchpoint is yet to be integrated into this brief, reach out to the individual channel holder for briefing details.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="pr" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="pr"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked)
                              handleTouchpointToggle("pr", !!checked)
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Use this touchpoint
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-800">
                      This touchpoint is yet to be integrated into this brief, reach out to the individual channel holder for briefing details.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="ads" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="ads"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked)
                              handleTouchpointToggle("ads", !!checked)
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Use this touchpoint
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-800">
                      This touchpoint is yet to be integrated into this brief, reach out to the individual channel holder for briefing details.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Supporting Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
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
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Form
                </>
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