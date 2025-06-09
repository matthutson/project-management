import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Copy, Send, CheckCircle, XCircle, Clock, AlertTriangle, Database, Eye } from "lucide-react";
import { mapFormDataToJira } from "../lib/jira-field-mapping";
import { submitWithRetry, testWebhookConnectivity, generateEmailFallback, generateFormDataSummary, copyToClipboardWithFallback, runNetworkDiagnostics } from "../lib/webhook-test";
import { 
  fetchJiraEpics, 
  submitEpicOperation, 
  testEpicFetchConnectivity,
  getConfig,
  type JiraEpic 
} from "../lib/jira-epic-service";

type TestResult = {
  success: boolean;
  message: string;
  responseData?: any;
  error?: string;
  timestamp?: string;
};

// Simple test data
const simpleTestData = {
  yourName: "Test User",
  projectName: "Zapier Test Project",
  campaign: "rnd26",
  portfolio: "individual_regular_giving",
  directorate: "fundraising",
  projectOverview: "This is a test submission to verify Zapier is receiving webhook data correctly.",
  budgetAmount: "£1,000",
  testMode: true,
  timestamp: new Date().toISOString()
};

// Sample data for Full Production Brief - COMPLETE DATA IN ALL FIELDS
const sampleFullProductionBrief = {
  // Personal info
  yourName: "Sarah Johnson",
  directorate: "fundraising",
  portfolio: "individual_regular_giving",
  
  // Project info
  projectName: "Red Nose Day 2024 Digital Campaign",
  campaign: "rnd26",
  projectOverview: "A comprehensive digital campaign to raise awareness and funds for Red Nose Day 2024, focusing on social media engagement and online donations with celebrity partnerships and community-driven content.",

  // Budget info
  hasBudget: "yes",
  budgetAmount: "£50,000",
  budgetCode: "RND24-204-F019-DIGI-CAMP",
  
  // Dates
  announcementDate: "2024-02-01",
  liveDate: "2024-03-15",

  // Target audience and desired action
  targetAudience: "Young adults aged 18-35 who are active on social media, have disposable income, and care about social causes. They are motivated by peer influence, visual storytelling, and making a tangible difference in the world.",
  desiredAction: "Make a donation of £5-£25 through the campaign landing page, share content on their social media channels to amplify reach, and encourage their friends and family to participate in the fundraising challenge.",
  
  // Talent info
  requiresTalent: "yes",
  talentRequirements: "High-profile comedian for main campaign video (£15,000), social media influencers for content amplification (£5,000), celebrity endorsements for launch event (£3,000), and local celebrity appearances at regional events (£2,000).",
  talentImpact: "Celebrity involvement will significantly increase campaign reach and credibility, potentially doubling our social media engagement and driving 30% more donations. The comedian will create viral moments while influencers will drive authentic engagement with younger demographics.",
  budgetBreakdownDescription: "Talent fees: £25,000 (50%), Travel and accommodation: £5,000 (10%), Glam and styling: £3,000 (6%), Production insurance: £2,000 (4%), Equipment rental: £8,000 (16%), Post-production: £4,000 (8%), Miscellaneous expenses: £3,000 (6%)",

  // Story info
  requiresStoryGathering: "yes",
  hasFundedPartner: "yes",
  fundedPartnerDetails: "Comic Relief UK - focus on education projects in East Africa, specifically supporting teacher training programs in Kenya and Uganda that have shown measurable improvements in literacy rates among children aged 6-12.",
  storyOverview: "Following a young teacher in Kenya who is transforming her community through innovative teaching methods funded by Comic Relief grants. The story shows her journey from struggling with large class sizes to implementing creative learning techniques that engage every child.",
  feelGoodFactor: "The story shows the direct impact of donations in empowering local educators and improving children's futures through education. Viewers will see tangible results: children learning to read, teachers gaining confidence, and communities coming together to support education.",
  willBeUsedInAnotherAsset: "yes",
  thematicAreas: "education",
  creativeIdeas: "Interactive timeline showing the teacher's journey, before/after classroom comparisons, student testimonials with subtitles, virtual classroom experience for donors, animated infographics showing literacy improvement statistics, and a documentary-style mini-series.",
  focusType: "Focus on narrative impact - showing the transformation and hope rather than dwelling on need or poverty. Emphasize empowerment, community strength, and the multiplicative effect of education.",
  safeguardingConcerns: "Ensure children's faces are not clearly identifiable in any footage, obtain proper consent forms from parents/guardians, work with local partners for cultural sensitivity, avoid depicting children in vulnerable situations, and respect privacy of families.",
  viewerReaction: "Viewers should feel inspired and hopeful about the positive change their donations can create, leading to increased engagement, social sharing, and a desire to contribute. They should see education as a powerful tool for lasting change.",
  anonymousStory: "no",
  
  // Asset requirements
  requiresSpecificAssets: "yes",
  assetTypes: ["social_content", "videography", "photography", "graphic_design"],
  approvedCopy: "no",
  deliverables: `Social Content:
- Launch Video (YouTube - 16:9, 60 seconds): Main campaign story with celebrity narrator
- Launch Video (Instagram - square, 30 seconds): Short-form version with captions
- Story Graphics (Instagram Stories - 9:16, 5 slides): Behind-the-scenes teacher journey
- Carousel Post (Instagram - 1080x1080, 8 frames): Impact statistics and donor stories
- Hero Banner (Facebook - 1200x630): Main campaign visual with donation CTA
- TikTok Content (9:16, 15-30 seconds): 3 viral-style videos showing classroom transformations

Email Campaign:
- Header Banner (600x200px): Animated GIF showing children learning
- Email Template (HTML responsive): Full campaign story with embedded video
- Subject Line Testing (A/B variants): "You helped Sarah teach 200 children to read" vs "See how your £10 transformed a classroom"

Website Assets:
- Landing Page Hero (1920x1080): Full-width campaign image with video overlay
- Mobile Banner (375x200px): Optimized for mobile donation flow
- Call-to-Action Buttons (various sizes): "Donate Now", "Share Story", "Learn More"
- Donation Progress Bar (animated): Shows real-time fundraising progress
- Impact Calculator: Interactive tool showing donation impact

Print Materials:
- A4 Poster (210x297mm, print-ready): For community centers and schools
- Business Cards (85x55mm): For team networking at events
- Banner for Events (3m x 1m): Backdrop for photo opportunities and speaking events`,
  contentLocations: "Comic Relief website (main landing page and donation flow), Facebook (organic posts and paid advertising), Instagram (feed posts, stories, reels), YouTube (main channel and advertising), TikTok (organic content), email newsletters (weekly campaigns), partner websites (embedded content), physical locations at events and community centers",

  // Touchpoints
  touchpoints: ["social"],
  socialChannels: ["instagram", "facebook", "youtube", "tiktok"],

  // Social specific
  socialPostDescription: "Engaging posts that tell the story of educational impact, featuring behind-the-scenes content from Kenya, beneficiary stories with strong visuals, clear calls-to-action for donations, user-generated content from supporters, and celebrity endorsements to amplify reach.",
  socialPurposeImpact: "Increase brand awareness by 40%, drive traffic to donation pages (target: 50,000 unique visitors), create viral moments that expand our reach beyond existing audience, generate user-generated content from supporters, and build long-term community of education advocates.",
  
  // Supporting docs
  supportingDocuments: "https://box.com/shared/campaign-brief-2024-full-documentation"
};

// Sample data for Epic update - COMPLETE DATA
const sampleEpicUpdateData = {
  ...sampleFullProductionBrief,
  hasPreviousBrief: "yes",
  selectedEpicKey: "CRB-22" // Using the epic from your Zapier table
};

// Sample data for Quick Kick-off Form - COMPLETE DATA IN ALL FIELDS
const sampleKickOffForm = {
  // Personal info
  yourName: "Mike Chen",
  directorate: "partnerships",
  portfolio: "events_challenges",
  
  // Project info
  hasPreviousBrief: "no",
  projectName: "Sports Relief 2025 Community Challenge",
  campaign: "sr25",
  projectOverview: "A grassroots community sports challenge encouraging local participation and fundraising through accessible sporting activities. The campaign will run across 500+ communities nationwide, focusing on inclusive sports that people of all abilities can participate in.",

  // Budget info
  hasBudget: "yes",
  budgetAmount: "£125,000",
  budgetCode: "SR25-204-F019-COMM-CHAL",

  // Key dates
  roughLiveDate: "2025-03-20",
  
  // Fundraising targets
  fundraisingTargetConservative: "£500,000",
  fundraisingTargetMedian: "£750,000",
  fundraisingTargetStretch: "£1,200,000",
  
  // Target audience and desired action
  targetAudience: "Local community groups, sports clubs, schools, families with children aged 5-16, and workplace teams. People who are community-minded, enjoy participating in group activities, value health and fitness, and want to make a positive impact in their local area.",
  desiredAction: "Sign up for local sports challenges through community hubs, fundraise minimum £100 within their networks, share their participation on social media with #SportsReliefChallenge, recruit friends and family to join their teams, and advocate for inclusive sports in their communities.",

  // Data requirements
  dataRequirements: "Previous Sports Relief participation data by region (2019-2023), demographic breakdown of participants by age/gender/location, conversion rates from sign-up to fundraising completion, most successful sports activities by community type, and seasonal participation patterns.",
  dataAnalysisRequired: "Analysis of regional participation patterns to identify high-potential areas, identification of high-performing community types (schools vs clubs vs workplaces), optimal challenge duration based on historical completion rates, and social media engagement correlation with fundraising success.",
  dataRequirementsPerformance: "Real-time tracking of sign-ups by region and community type, fundraising progress by team with automated milestone alerts, social media engagement metrics across platforms, conversion funnel analysis from awareness to donation, and participant satisfaction scoring system.",
  
  // Talent info
  talentEssentialForPlanning: "yes",
  talentRequirements: "Local sports personalities for regional launches (£20,000 across 10 regions), social media influencers specializing in fitness content (£15,000 for 6-month campaign), celebrity ambassador for national kick-off event (£30,000), Paralympic athletes for inclusivity messaging (£10,000), and local radio presenters for community engagement (£8,000).",
  talentImpact: "Local talent will increase community buy-in and participation rates by an estimated 35%, while celebrity involvement will drive national media coverage worth approximately £200,000 in earned media. Paralympic athletes will ensure our inclusivity message reaches disability communities effectively.",
  budgetBreakdownDescription: "Talent fees for local personalities: £20,000 (16%), Celebrity appearance fee: £30,000 (24%), Social media influencers: £15,000 (12%), Paralympic athletes: £10,000 (8%), Radio presenters: £8,000 (6%), Travel and logistics: £15,000 (12%), Production support: £12,000 (10%), Insurance and safety: £8,000 (6%), Equipment and venues: £7,000 (6%)",
  
  // Story info
  storyEssentialForPlanning: "yes",
  hasFundedPartner: "yes",
  fundedPartnerDetails: "Local sports clubs and community centers in Birmingham, Manchester, and Cardiff that have previously benefited from Sport Relief funding for facility improvements, equipment purchases, and accessibility modifications over the past 3 years.",
  storyOverview: "Following three communities that have transformed their local sports facilities and programs through previous Sport Relief funding. Stories include: a Birmingham boxing club that became fully accessible, a Manchester football club that started girls' teams, and a Cardiff swimming group that offers free lessons to low-income families.",
  feelGoodFactor: "Showcasing how communities come together through sport, creating lasting friendships, healthier lifestyles, and stronger neighborhood connections while supporting great causes. Focus on personal transformations, community pride, and the ripple effect of sport in bringing people together.",
  willBeUsedInAnotherAsset: "yes",
  thematicAreas: "health",
  creativeIdeas: "Time-lapse of community transformations over 12 months, participant journey videos showing personal growth, before/after facility improvements with user testimonials, celebration montages of achievement moments, virtual tours of transformed spaces, and animated infographics showing health impact statistics.",
  focusType: "Focus on community spirit, personal achievement, and positive transformation rather than individual need or deficits. Emphasize collective strength, celebration of diversity in sport, and the joy of movement and participation for everyone.",
  safeguardingConcerns: "Ensure proper consent for filming in community spaces, be mindful of children's privacy in all content, respect community cultural practices and religious considerations, avoid depicting people in ways that could compromise their dignity, and work with local partners for cultural sensitivity.",
  viewerReaction: "Viewers should feel motivated to get involved in their own communities, see that everyone can make a difference regardless of fitness level, feel inspired by community spirit, and understand that sport is a powerful tool for positive social change and personal wellbeing.",
  anonymousStory: "no",
  
  // Tech requirements
  requiresNewTechFunctionality: "yes",
  techRequirements: "Community sign-up portal with team creation functionality, progress tracking dashboard with gamification elements, social sharing integration across all major platforms, mobile-responsive design optimized for on-the-go updates, and real-time leaderboards for friendly competition between communities.",
  techPlatformRequirements: "Web-based platform compatible with iOS and Android devices, integration with existing CRM systems for seamless data flow, real-time analytics dashboard for campaign managers, automated email triggers for milestone achievements, and API connections for social media posting automation.",
  techDeliveryDate: "2025-02-15",
  
  // Supporting docs
  supportingDocuments: "https://box.com/shared/sports-relief-2025-planning-complete-documentation"
};

// Sample data for Data Request Brief - COMPLETE DATA IN ALL FIELDS
const sampleDataRequest = {
  // Personal info
  yourName: "Emma Thompson",
  directorate: "operations",
  portfolio: "partnerships",
  
  // Data request details
  dataType: "Power BI Dashboard",
  dataDescription: "Comprehensive real-time dashboard showing donation patterns, campaign performance metrics, donor retention analysis, and ROI calculations for Q4 2024 campaigns including RND26 and CR25-WINTER. Dashboard will include predictive analytics for future campaign planning and automated alert systems for performance thresholds.",
  businessJustification: "Need real-time visibility into campaign performance to optimize spending allocation across channels, improve donor retention rates by 15% through targeted re-engagement campaigns, reduce manual reporting time by 60%, and enable data-driven decisions for strategic planning. Current manual processes are causing 2-week delays in performance insights.",
  expectedOutcome: "Weekly automated dashboard reports enabling immediate campaign optimization decisions, monthly donor segmentation analysis for targeted communications, quarterly ROI analysis for budget planning, real-time performance alerts for underperforming campaigns, and predictive modeling for future campaign success probability.",
  stakeholders: "Campaign managers (primary users for daily monitoring), finance team (budget tracking and ROI analysis), senior leadership (strategic oversight and reporting), external agency partners (performance optimization), marketing team (channel effectiveness), and donor services team (retention analysis)",
  dataSourcesRequired: "CRM data from Salesforce (donor information and giving history), payment processor analytics from Stripe and PayPal (transaction data), social media metrics from Facebook, Instagram, YouTube, and TikTok APIs, email campaign data from Mailchimp and Constant Contact, website analytics from Google Analytics, and call center data from customer service platform",
  urgency: "High",
  deadline: "2024-02-15",
  budget: "£15,000",
  technicalRequirements: "Power BI Premium access with unlimited data refresh, automated data pipeline from all source systems, mobile compatibility for iOS and Android devices, role-based access controls with 3 permission levels, real-time data refresh every 15 minutes, and integration with existing IT infrastructure including VPN access",
  campaign: "cr25_winter"
};

export function WebhookTester() {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  // Epic-specific state
  const [epicFetchConnected, setEpicFetchConnected] = useState<boolean | null>(null);
  const [isTestingEpicFetch, setIsTestingEpicFetch] = useState(false);
  const [fetchedEpics, setFetchedEpics] = useState<JiraEpic[]>([]);
  const [isFetchingEpics, setIsFetchingEpics] = useState(false);
  
  // Network diagnostics state
  const [networkDiagnostics, setNetworkDiagnostics] = useState<any>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  // Test webhook connectivity
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const connected = await testWebhookConnectivity();
      setIsConnected(connected);
    } catch (error) {
      console.error('Connection test error:', error);
      setIsConnected(false);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Run network diagnostics
  const handleRunDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    try {
      const diagnostics = await runNetworkDiagnostics();
      setNetworkDiagnostics(diagnostics);
    } catch (error) {
      console.error('Diagnostics failed:', error);
      setNetworkDiagnostics({
        online: navigator.onLine,
        zapierReachable: false,
        corsIssues: true,
        recommendations: ['Unable to run diagnostics', 'Check browser console for errors']
      });
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  // Test Epic fetch connectivity
  const handleTestEpicFetch = async () => {
    setIsTestingEpicFetch(true);
    try {
      const connected = await testEpicFetchConnectivity();
      setEpicFetchConnected(connected);
    } catch (error) {
      setEpicFetchConnected(false);
    } finally {
      setIsTestingEpicFetch(false);
    }
  };

  // Fetch Epics for testing
  const handleFetchEpics = async () => {
    setIsFetchingEpics(true);
    try {
      const epics = await fetchJiraEpics();
      setFetchedEpics(epics);
      
      setTestResults(prev => ({
        ...prev,
        'epic-fetch': {
          success: true,
          message: `✅ Successfully fetched ${epics.length} Epics from Zapier table`,
          responseData: epics,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        'epic-fetch': {
          success: false,
          message: `❌ Failed to fetch Epics from Zapier table`,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setIsFetchingEpics(false);
    }
  };

  // Send simple test data - BACK TO WORKING VERSION FROM 15:25
  const sendSimpleTest = async () => {
    try {
      const jiraData = mapFormDataToJira(simpleTestData, 'Simple Test');
      
      // Send individual fields directly - this was the working approach
      const payload = {
        ...jiraData, // Individual fields at root level
        testMode: true,
        submissionTimestamp: new Date().toISOString()
      };

      console.log('Sending simple test to Zapier (15:25 working version):', payload);
      
      const result = await submitWithRetry(payload);
      
      setTestResults(prev => ({
        ...prev,
        'simple-test': {
          success: result.success,
          message: result.success 
            ? '✅ Simple test sent! Check Zapier for new records' 
            : '❌ Simple test failed',
          responseData: result.data,
          error: result.error,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        'simple-test': {
          success: false,
          message: '❌ Simple test error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  // Send test data for a specific form type - BACK TO WORKING VERSION
  const sendTestData = async (formType: string, formData: any) => {
    try {
      // Check if this is an Epic operation
      if (formData.hasPreviousBrief !== undefined) {
        const operation = formData.hasPreviousBrief === "yes" ? "update" : "create";
        const epicKey = formData.selectedEpicKey;
        
        console.log(`Testing Epic ${operation} operation...`);
        
        const result = await submitEpicOperation({
          operation,
          epicKey,
          formData,
          formType
        });
        
        setTestResults(prev => ({
          ...prev,
          [formType]: {
            success: result.success,
            message: result.success 
              ? `✅ Epic ${operation} test completed! Check Zapier for new records`
              : `❌ Epic ${operation} test failed`,
            responseData: result.data,
            error: result.error,
            timestamp: new Date().toISOString()
          }
        }));
      } else {
        // Regular form submission - SEND INDIVIDUAL FIELDS DIRECTLY
        const jiraData = mapFormDataToJira(formData, formType);
        
        // This was the working approach from 15:25 - individual fields at root level
        const payload = {
          ...jiraData, // Individual fields directly
          testMode: true,
          submissionTimestamp: new Date().toISOString()
        };

        console.log(`Sending test data for ${formType} (15:25 working version):`, payload);
        
        const result = await submitWithRetry(payload);
        
        setTestResults(prev => ({
          ...prev,
          [formType]: {
            success: result.success,
            message: result.success 
              ? `✅ ${formType} test sent! Check Zapier for new records`
              : `❌ Failed to send ${formType} test data`,
            responseData: result.data,
            error: result.error,
            timestamp: new Date().toISOString()
          }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [formType]: {
          success: false,
          message: `❌ Error sending ${formType} test data`,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  // Copy JSON to clipboard with fallback
  const copyToClipboard = async (data: any, label: string) => {
    const jsonText = JSON.stringify(data, null, 2);
    const success = await copyToClipboardWithFallback(jsonText, label);
    
    if (success) {
      alert(`${label} data copied to clipboard!`);
    }
  };

  const ConnectionStatus = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected === null ? 'bg-gray-400' :
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          Main Webhook Connection Status
        </CardTitle>
        <CardDescription>
          Test your Zapier webhook endpoint connectivity - Working 15:25 version with complete sample data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>✅ WORKING:</strong> Using the simple 15:25 approach with complete sample data in all fields.
            </AlertDescription>
          </Alert>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <strong>Webhook URL:</strong> https://hooks.zapier.com/hooks/catch/12809750/2vn5sae/
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={handleTestConnection}
              disabled={isTestingConnection}
              variant={isConnected ? "outline" : "default"}
            >
              {isTestingConnection ? "Testing..." : "Test Connection"}
            </Button>
            
            <Button 
              onClick={sendSimpleTest}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              ✅ Send Simple Test (Complete Data)
            </Button>
            
            <Button 
              onClick={handleRunDiagnostics}
              disabled={isRunningDiagnostics}
              variant="outline"
            >
              {isRunningDiagnostics ? "Running..." : "Run Diagnostics"}
            </Button>
          </div>
          
          {/* Simple Test Result */}
          {testResults['simple-test'] && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">✅ Simple Test Result (Complete Data)</h4>
              <p className={`text-sm ${testResults['simple-test'].success ? 'text-green-700' : 'text-red-700'}`}>
                {testResults['simple-test'].message}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Sent at: {testResults['simple-test'].timestamp}
              </p>
            </div>
          )}
          
          {networkDiagnostics && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <h4 className="font-medium text-blue-800 mb-2">Network Diagnostics</h4>
              <div className="space-y-1 text-blue-700">
                <div>• Online: {networkDiagnostics.online ? '✅ Yes' : '❌ No'}</div>
                <div>• Zapier Reachable: {networkDiagnostics.zapierReachable ? '✅ Yes' : '❌ No'}</div>
                <div>• CORS Issues: {networkDiagnostics.corsIssues ? '⚠️ Yes (Normal)' : '✅ No'}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const EpicConnectionStatus = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            epicFetchConnected === null ? 'bg-gray-400' :
            epicFetchConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          Epic Fetch from Zapier Table
        </CardTitle>
        <CardDescription>
          New approach: Fetching epics from your Zapier table with structured data format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <Database className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>🆕 NEW APPROACH:</strong> Now using your Zapier table webhook to fetch epics. 
              This should provide structured data from your project table.
            </AlertDescription>
          </Alert>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <strong>Zapier Table URL:</strong> {getConfig().fetchEndpoint}
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleTestEpicFetch}
              disabled={isTestingEpicFetch}
              variant={epicFetchConnected ? "outline" : "default"}
            >
              {isTestingEpicFetch ? "Testing..." : "Test Table Connection"}
            </Button>
            
            <Button 
              onClick={handleFetchEpics}
              disabled={isFetchingEpics}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Database className="w-4 h-4 mr-2" />
              {isFetchingEpics ? "Fetching..." : "Fetch from Zapier Table"}
            </Button>
          </div>
          
          {fetchedEpics.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">📊 Epics from Zapier Table ({fetchedEpics.length}):</h4>
              <div className="text-sm text-green-700 space-y-1 max-h-40 overflow-y-auto">
                {fetchedEpics.map(epic => (
                  <div key={epic.key} className="flex justify-between items-center">
                    <span><strong>{epic.key}</strong> - {epic.summary}</span>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="ml-2">{epic.status}</Badge>
                      {epic.reporter && <Badge variant="outline" className="text-xs">{epic.reporter}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const TestDataCard = ({ 
    title, 
    description, 
    formType, 
    sampleData,
    badges 
  }: { 
    title: string;
    description: string;
    formType: string;
    sampleData: any;
    badges: string[];
  }) => {
    const result = testResults[formType];
    const jiraStructure = mapFormDataToJira(sampleData, formType);
    
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {title}
                {result?.success === true && <CheckCircle className="h-5 w-5 text-green-600" />}
                {result?.success === false && <XCircle className="h-5 w-5 text-red-600" />}
              </CardTitle>
              <CardDescription className="mt-2">{description}</CardDescription>
              <div className="flex gap-2 mt-3">
                {badges.map(badge => (
                  <Badge key={badge} variant="secondary">{badge}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Test Result */}
            {result && (
              <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertDescription className={result.success ? "text-green-700" : "text-red-700"}>
                  {result.message}
                  {result.timestamp && (
                    <div className="text-xs mt-1 opacity-75">
                      Sent at: {new Date(result.timestamp).toLocaleString()}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={() => sendTestData(formType, sampleData)}
                disabled={isConnected === false}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Complete Test Data
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => copyToClipboard(sampleData, formType)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Form Data
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => copyToClipboard(jiraStructure, `${formType} Zapier Structure`)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Zapier Structure
              </Button>
            </div>

            {/* Individual Fields Preview for Zapier */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-blue-700 hover:text-blue-900 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                📊 View Complete Zapier Fields
              </summary>
              <div className="mt-2 p-3 bg-blue-50 rounded border text-xs space-y-2">
                <h4 className="font-medium text-blue-800">✅ All Fields Have Sample Data:</h4>
                <div className="grid grid-cols-2 gap-2 text-blue-700">
                  <div><strong>submitterName:</strong> "{jiraStructure.submitterName}"</div>
                  <div><strong>projectName:</strong> "{jiraStructure.projectName}"</div>
                  <div><strong>campaign:</strong> "{jiraStructure.campaign}"</div>
                  <div><strong>portfolio:</strong> "{jiraStructure.portfolio}"</div>
                  <div><strong>budgetAmount:</strong> "{jiraStructure.budgetAmount}"</div>
                  <div><strong>hasPreviousBrief:</strong> "{jiraStructure.hasPreviousBrief}"</div>
                  <div><strong>requiresTalent:</strong> "{jiraStructure.requiresTalent}"</div>
                  <div><strong>requiresStoryGathering:</strong> "{jiraStructure.requiresStoryGathering}"</div>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  All sample data now includes complete information in every field for comprehensive Zapier testing.
                </p>
              </div>
            </details>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔧 Webhook Testing Tool</h1>
        <p className="text-gray-600">
          <strong>✅ Complete sample data in all fields.</strong> New Zapier table approach for Epic fetching.
        </p>
      </div>

      <ConnectionStatus />
      <EpicConnectionStatus />

      <Tabs defaultValue="forms" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="forms">Form Testing</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="space-y-6">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>📊 COMPLETE DATA:</strong> All sample forms now contain comprehensive data in every field. 
              Epic fetching now uses your new Zapier table approach.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-6">
            <TestDataCard
              title="Full Production Brief"
              description="Complete data in all fields - ready for comprehensive Zapier testing."
              formType="Full Production Brief"
              sampleData={sampleFullProductionBrief}
              badges={["Epic", "Complete Data", "All Fields"]}
            />
            
            <TestDataCard
              title="Full Production Brief (Update Epic)"
              description="Update existing Epic CRB-22 with complete sample data."
              formType="Full Production Brief (Update)"
              sampleData={sampleEpicUpdateData}
              badges={["Epic", "Update", "CRB-22", "Complete Data"]}
            />
            
            <TestDataCard
              title="Quick Kick-off Form"
              description="Comprehensive sample data for Story creation testing."
              formType="Quick Kick-off Form"
              sampleData={sampleKickOffForm}
              badges={["Story", "Complete Data", "All Fields"]}
            />
            
            <TestDataCard
              title="Data Request Brief"
              description="Complete data request with detailed requirements and specifications."
              formType="Data Request Brief"
              sampleData={sampleDataRequest}
              badges={["Task", "Complete Data", "Detailed"]}
            />
          </div>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📊 New Zapier Table Approach</CardTitle>
              <CardDescription>Epic fetching now uses your structured Zapier table</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Database className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  <strong>🆕 NEW:</strong> Epic fetching now uses your Zapier table webhook: 
                  https://hooks.zapier.com/hooks/catch/12809750/uyyghs1/
                </AlertDescription>
              </Alert>

              <div>
                <h4 className="font-medium mb-3">📋 Expected Data Format from Zapier Table:</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <pre className="text-xs text-gray-700">{`{
  "Field 1": "Unknown field",
  "Field 2": "CRB-22",  // Epic Key
  "Field 3": "m.hutson@comicrelief.com",  // Email
  "Field 4": "To Do",  // Status
  "Field 5": "2025-06-06T16:41:33.790+0100",  // Timestamp
  "Record ID": "01JX32HD7F5WCYNVMD341JHEP3",
  "Data Edited At": "2025-06-06T16:52:42.350236Z",
  // ... other fields
}`}</pre>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">✅ Complete Sample Data Added:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• ✅ All form fields now have realistic, complete sample data</li>
                  <li>• ✅ Detailed descriptions, requirements, and specifications</li>
                  <li>• ✅ Proper budget amounts, dates, and stakeholder information</li>
                  <li>• ✅ Complete talent requirements and impact descriptions</li>
                  <li>• ✅ Comprehensive story details and creative ideas</li>
                  <li>• ✅ Detailed asset requirements and deliverables</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}