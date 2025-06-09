// Jira field mapping utilities for Comic Relief forms

export interface JiraField {
  key: string;
  value: string | string[] | number | boolean;
  type: 'text' | 'select' | 'multiselect' | 'number' | 'date' | 'boolean' | 'user' | 'array';
  description?: string;
}

export interface JiraIssue {
  summary: string;
  description: string;
  issueType: string;
  priority: string;
  labels: string[];
  customFields: JiraField[];
  assignee?: string;
  reporter?: string;
  components?: string[];
  fixVersions?: string[];
  
  // Epic operation fields
  operation?: 'create' | 'update';
  epicKey?: string;
  
  // New field for structured deliverables
  deliverables?: {
    parent: string;
    subtasks: string[];
  }[];

  // Individual fields for Zapier - NEW SECTION
  // Basic Info
  submitterName?: string;
  directorate?: string;
  portfolio?: string;
  portfolioJiraId?: string;
  campaign?: string;
  campaignJiraId?: string;
  formType?: string;
  
  // Project Info
  projectName?: string;
  projectOverview?: string;
  selectedEpicKey?: string;
  
  // Yes/No Fields for Zapier Routing
  hasPreviousBrief?: string;
  hasBudget?: string;
  requiresTalent?: string;
  talentEssentialForPlanning?: string;
  requiresStoryGathering?: string;
  storyEssentialForPlanning?: string;
  requiresSpecificAssets?: string;
  requiresNewTechFunctionality?: string;
  
  // Budget Info
  budgetAmount?: string;
  budgetCode?: string;
  
  // Dates - Updated for simplified structure
  projectLiveDate?: string;
  
  // Project Requirements - New field
  projectRequirements?: string;
  
  // Talent Details
  talentRequirements?: string;
  talentImpact?: string;
  budgetBreakdownDescription?: string;
  
  // Story Details
  storyOverview?: string;
  feelGoodFactor?: string;
  fundedPartnerDetails?: string;
  thematicAreas?: string;
  willBeUsedInAnotherAsset?: string;
  
  // Tech Details
  techRequirements?: string;
  
  // Assets
  assetTypesText?: string;
  approvedCopy?: string;
  contentLocations?: string;
  deliverablesText?: string;
  
  // Social/Touchpoints
  touchpointsText?: string;
  socialChannelsText?: string;
  socialPostDescription?: string;
  socialPurposeImpact?: string;
  
  // Supporting Docs
  supportingDocuments?: string;
  
  // Counts for Analytics
  deliverablesCount?: number;
  subtasksTotal?: number;
}

// Mapping for Campaign field values to Jira IDs - Updated to handle both formats
function mapCampaignToJiraId(campaignValue: string): string {
  if (!campaignValue) return '-1';
  
  // Normalize the campaign value - handle both underscore and hyphen formats
  const normalizedValue = campaignValue.toLowerCase().replace(/_/g, '-');
  
  const campaignMapping: Record<string, string> = {
    'cr365': '10469',       // CR365
    'rnd26': '10470',       // RND26
    'sr25': '10471',        // SR25
    'sr26': '10472',        // SR26
    'rnd27': '10473',       // RND27
    'cr25-winter': '10474', // CR25-WINTER (handles both cr25_winter and cr25-winter)
    'cr26-winter': '10475', // CR26-WINTER (handles both cr26_winter and cr26-winter)
    '': '-1'                // Empty/none
  };
  
  return campaignMapping[normalizedValue] || '-1';
}

// Mapping for Portfolio field values to Jira IDs
function mapPortfolioToJiraId(portfolioValue: string): string {
  if (!portfolioValue) return '-1';
  
  const portfolioMapping: Record<string, string> = {
    'individual_regular_giving': '10476',        // INDIVIDUAL AND REGULAR GIVING
    'schools_youth_community': '10477',         // SCHOOLS YOUTH AND COMMUNITY FUNDRAISING
    'events_challenges': '10478',               // EVENTS AND CHALLENGES
    'prizes': '10479',                          // PRIZES
    'shop_merchandise': '10480',                // SHOP AND MERCHANDISE
    'supporter_services': '10481',              // SUPPORTER SERVICES
    'partnerships': '10482',                    // PARTNERSHIPS
    'philanthropy': '10483',                    // PHILANTHROPY
    'data_analytics': '10482',                  // Map data_analytics to PARTNERSHIPS for now
    '': '-1'                                    // Empty/none
  };
  
  return portfolioMapping[portfolioValue?.toLowerCase()] || '-1';
}

// Mapping for Talent Requirements checkbox custom field (customfield_11329)
function mapTalentRequirementsCheckbox(formData: any): string | null {
  // Check if talent is required in any form
  const talentRequired = formData.requiresTalent === 'yes' || 
                        formData.talentEssentialForPlanning === 'yes';
  
  if (!talentRequired) {
    // For checkboxes, when not checked, don't send the field or send empty
    return null; // Don't include this field in the payload
  }
  
  // For Epic checkbox fields, when checked, send "Yes"
  return 'Yes';
}

// Mapping for Story Requirements checkbox custom field (customfield_11328)
function mapStoryRequirementsCheckbox(formData: any): string | null {
  // Check if story gathering is required in any form
  const storyRequired = formData.requiresStoryGathering === 'yes' || 
                       formData.storyEssentialForPlanning === 'yes';
  
  if (!storyRequired) {
    // For checkboxes, when not checked, don't send the field or send empty
    return null; // Don't include this field in the payload
  }
  
  // For Epic checkbox fields, when checked, send "Yes"
  return 'Yes';
}

// Helper function to parse deliverables into structured format
function parseDeliverables(deliverablesText: string): { parent: string; subtasks: string[] }[] {
  if (!deliverablesText || !deliverablesText.trim()) {
    return [];
  }

  const lines = deliverablesText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const structured: { parent: string; subtasks: string[] }[] = [];
  let currentParent: { parent: string; subtasks: string[] } | null = null;

  for (const line of lines) {
    // Check if line is a subtask (starts with -, •, or is indented)
    const isSubtask = line.startsWith('-') || 
                     line.startsWith('•') || 
                     line.startsWith('*') ||
                     line.startsWith('  ') || // 2+ spaces
                     line.startsWith('\t');   // tab

    if (isSubtask) {
      // Clean up the subtask text
      const subtaskText = line.replace(/^[-•*\s\t]+/, '').trim();
      
      if (currentParent && subtaskText) {
        currentParent.subtasks.push(subtaskText);
      }
    } else {
      // This is a main deliverable (parent task)
      if (currentParent) {
        structured.push(currentParent);
      }
      
      currentParent = {
        parent: line,
        subtasks: []
      };
    }
  }

  // Don't forget the last parent
  if (currentParent) {
    structured.push(currentParent);
  }

  return structured;
}

// Helper function to format deliverables for Jira description
function formatDeliverablesForJira(deliverables: { parent: string; subtasks: string[] }[]): string {
  if (!deliverables || deliverables.length === 0) {
    return '';
  }

  let formatted = 'h3. Deliverables & Subtasks\n\n';
  
  deliverables.forEach((item, index) => {
    formatted += `h4. ${index + 1}. ${item.parent}\n`;
    
    if (item.subtasks.length > 0) {
      formatted += 'Subtasks:\n';
      item.subtasks.forEach(subtask => {
        formatted += `* ${subtask}\n`;
      });
    }
    
    formatted += '\n';
  });

  return formatted;
}

// Helper function to determine issue type based on form type
function getIssueTypeFromFormType(formType: string): string {
  switch (formType) {
    case 'Quick Kick-off Form':
      return 'Story'; // Creates Stories in Jira
    case 'Full Production Brief':
      return 'Epic'; // Creates Epics in Jira  
    case 'Data Request Brief':
      return 'Task'; // Creates Tasks in Jira
    default:
      return 'Task';
  }
}

// Helper function to determine priority based on form content
function determinePriority(formData: any): string {
  // Check for urgency indicators in dates or content
  const urgencyKeywords = ['urgent', 'asap', 'immediate', 'rush', 'emergency'];
  const formText = JSON.stringify(formData).toLowerCase();
  
  if (urgencyKeywords.some(keyword => formText.includes(keyword))) {
    return 'High';
  }
  
  // Check if live date is very soon (within 2 weeks)
  const liveDate = formData.projectLiveDate;
  if (liveDate) {
    const date = new Date(liveDate);
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    
    if (date <= twoWeeksFromNow) {
      return 'High';
    }
  }
  
  return 'Medium';
}

// Helper function to clean and format text fields
function cleanTextField(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

// Helper function to format array fields
function formatArrayField(value: any): string {
  if (!value) return '';
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(', ');
  }
  return cleanTextField(value);
}

// Main mapping function - Enhanced with individual fields for Zapier
export function mapFormDataToJira(formData: any, formType: string): JiraIssue {
  // Parse structured deliverables
  const structuredDeliverables = parseDeliverables(formData.deliverables || '');
  
  // Determine if this is an Epic operation
  const isEpicOperation = formData.hasPreviousBrief !== undefined;
  const operation = formData.hasPreviousBrief === "yes" ? "update" : "create";
  const epicKey = formData.selectedEpicKey;
  
  // Create comprehensive description with all form data (for Jira readability)
  let description = `h2. ${formType}`;
  
  // Add Epic operation info
  if (isEpicOperation) {
    description += ` (${operation === "create" ? "New Epic" : `Update Epic ${epicKey}`})\n\n`;
    
    if (operation === "update" && epicKey) {
      description += `h3. Epic Update Information\n`;
      description += `*Epic Key:* ${epicKey}\n`;
      description += `*Update Timestamp:* ${new Date().toISOString()}\n\n`;
    }
  } else {
    description += '\n\n';
  }
  
  // Add key project information
  if (formData.projectName || formData.selectedEpicKey) {
    description += `h3. Project Information\n`;
    if (formData.projectName) description += `*Project Name:* ${cleanTextField(formData.projectName)}\n`;
    if (formData.selectedEpicKey) description += `*Selected Epic:* ${cleanTextField(formData.selectedEpicKey)}\n`;
    if (formData.campaign) description += `*Campaign:* ${cleanTextField(formData.campaign)}\n`;
    if (formData.directorate) description += `*Directorate:* ${cleanTextField(formData.directorate)}\n`;
    if (formData.portfolio) description += `*Portfolio:* ${cleanTextField(formData.portfolio)}\n`;
    if (formData.projectOverview) description += `*Overview:* ${cleanTextField(formData.projectOverview)}\n`;
    description += '\n';
  }

  // Add key dates
  if (formData.projectLiveDate) {
    description += `h3. Key Dates and Times\n`;
    description += `*Project Live Date:* ${cleanTextField(formData.projectLiveDate)}\n\n`;
  }

  // Add project requirements (pre-formatted content)
  if (formData.projectRequirements) {
    description += `h3. Project Requirements\n`;
    description += `${cleanTextField(formData.projectRequirements)}\n\n`;
  }

  // Add budget information
  if (formData.hasBudget === 'yes') {
    description += `h3. Budget Information\n`;
    if (formData.budgetAmount) description += `*Budget Amount:* ${cleanTextField(formData.budgetAmount)}\n`;
    if (formData.budgetCode) description += `*Budget Code:* ${cleanTextField(formData.budgetCode)}\n`;
    description += '\n';
  }

  // Add talent requirements
  if (formData.requiresTalent === 'yes' || formData.talentEssentialForPlanning === 'yes') {
    description += `h3. Talent Requirements\n`;
    if (formData.talentRequirements) description += `*Requirements:* ${cleanTextField(formData.talentRequirements)}\n`;
    if (formData.talentImpact) description += `*Impact:* ${cleanTextField(formData.talentImpact)}\n`;
    if (formData.budgetBreakdownDescription) description += `*Budget Breakdown:* ${cleanTextField(formData.budgetBreakdownDescription)}\n`;
    description += '\n';
  }

  // Add story information
  if (formData.requiresStoryGathering === 'yes' || formData.storyEssentialForPlanning === 'yes') {
    description += `h3. Story Requirements\n`;
    if (formData.storyOverview) description += `*Story Overview:* ${cleanTextField(formData.storyOverview)}\n`;
    if (formData.feelGoodFactor) description += `*Feel Good Factor:* ${cleanTextField(formData.feelGoodFactor)}\n`;
    if (formData.fundedPartnerDetails) description += `*Funded Partner:* ${cleanTextField(formData.fundedPartnerDetails)}\n`;
    if (formData.thematicAreas) description += `*Thematic Areas:* ${cleanTextField(formData.thematicAreas)}\n`;
    if (formData.willBeUsedInAnotherAsset) description += `*Used in Other Assets:* ${cleanTextField(formData.willBeUsedInAnotherAsset)}\n`;
    description += '\n';
  }

  // Add tech requirements
  if (formData.requiresNewTechFunctionality === 'yes') {
    description += `h3. Technical Requirements\n`;
    if (formData.techRequirements) description += `*Requirements:* ${cleanTextField(formData.techRequirements)}\n`;
    description += '\n';
  }

  // Add asset requirements
  if (formData.requiresSpecificAssets === 'yes') {
    description += `h3. Asset Requirements\n`;
    if (formData.assetTypes?.length > 0) description += `*Asset Types:* ${formatArrayField(formData.assetTypes)}\n`;
    if (formData.approvedCopy) description += `*Approved Copy:* ${cleanTextField(formData.approvedCopy)}\n`;
    if (formData.contentLocations) description += `*Content Locations:* ${cleanTextField(formData.contentLocations)}\n`;
    description += '\n';
  }

  // Add structured deliverables
  if (structuredDeliverables.length > 0) {
    description += formatDeliverablesForJira(structuredDeliverables);
  }

  // Add touchpoints and social
  if (formData.touchpoints?.length > 0) {
    description += `h3. Touchpoints\n`;
    description += `*Touchpoints:* ${formatArrayField(formData.touchpoints)}\n`;
    if (formData.socialChannels?.length > 0) description += `*Social Channels:* ${formatArrayField(formData.socialChannels)}\n`;
    if (formData.socialPostDescription) description += `*Social Post Description:* ${cleanTextField(formData.socialPostDescription)}\n`;
    if (formData.socialPurposeImpact) description += `*Social Purpose & Impact:* ${cleanTextField(formData.socialPurposeImpact)}\n`;
    description += '\n';
  }

  // Add supporting documents
  if (formData.supportingDocuments) {
    description += `h3. Supporting Documents\n`;
    description += `${cleanTextField(formData.supportingDocuments)}\n\n`;
  }

  // Add submission metadata
  description += `h3. Submission Details\n`;
  description += `*Submitted by:* ${cleanTextField(formData.yourName)}\n`;
  description += `*Form Type:* ${formType}\n`;
  if (isEpicOperation) {
    description += `*Operation:* ${operation}\n`;
    if (epicKey) description += `*Epic Key:* ${epicKey}\n`;
  }
  description += `*Submission Time:* ${new Date().toISOString()}\n`;

  // Create project name for summary
  const projectName = formData.projectName || 
                     (formData.selectedEpicKey ? `Update ${formData.selectedEpicKey}` : '') ||
                     formData.campaign || 
                     'New Project';
  
  // Generate labels based on form content
  const labels: string[] = [formType.replace(/\s+/g, '-').toLowerCase()];
  if (formData.campaign) labels.push(formData.campaign.toLowerCase());
  if (formData.directorate) labels.push(formData.directorate.toLowerCase());
  if (formData.portfolio) labels.push(formData.portfolio.toLowerCase().replace(/\s+/g, '-'));
  if (isEpicOperation) labels.push(operation);

  // Get checkbox values for Epic custom fields
  const talentCheckboxValue = mapTalentRequirementsCheckbox(formData);
  const storyCheckboxValue = mapStoryRequirementsCheckbox(formData);

  // Create custom fields for easy Zapier mapping with Jira field IDs
  const customFields: JiraField[] = [
    { key: 'submitter_name', value: cleanTextField(formData.yourName), type: 'text', description: 'Person who submitted the form' },
    { key: 'directorate', value: cleanTextField(formData.directorate), type: 'select', description: 'Directorate' },
    { key: 'portfolio', value: mapPortfolioToJiraId(formData.portfolio), type: 'select', description: 'Portfolio team (Jira ID)' },
    { key: 'campaign', value: mapCampaignToJiraId(formData.campaign), type: 'select', description: 'Campaign (Jira ID)' },
    { key: 'form_type', value: formType, type: 'select', description: 'Type of form submitted' },
    { key: 'budget_amount', value: cleanTextField(formData.budgetAmount), type: 'text', description: 'Budget amount' },
    { key: 'budget_code', value: cleanTextField(formData.budgetCode), type: 'text', description: 'Budget code' },
    { key: 'project_live_date', value: cleanTextField(formData.projectLiveDate), type: 'date', description: 'Project live date' },
    { key: 'project_requirements', value: cleanTextField(formData.projectRequirements), type: 'text', description: 'Pre-formatted project requirements' },
    
    // For regular fields, keep the "yes"/"no" values for Zapier routing
    { key: 'requires_talent', value: cleanTextField(formData.requiresTalent || formData.talentEssentialForPlanning), type: 'text', description: 'Requires talent (for Zapier)' },
    { key: 'requires_story', value: cleanTextField(formData.requiresStoryGathering || formData.storyEssentialForPlanning), type: 'text', description: 'Requires story gathering (for Zapier)' },
    
    { key: 'requires_tech', value: (formData.requiresNewTechFunctionality === 'yes'), type: 'boolean', description: 'Requires new tech functionality' },
    { key: 'asset_types', value: formatArrayField(formData.assetTypes), type: 'text', description: 'Required asset types' },
    { key: 'social_channels', value: formatArrayField(formData.socialChannels), type: 'text', description: 'Social media channels' },
    { key: 'deliverables_count', value: structuredDeliverables.length, type: 'number', description: 'Number of main deliverables' },
    { key: 'subtasks_total', value: structuredDeliverables.reduce((total, item) => total + item.subtasks.length, 0), type: 'number', description: 'Total number of subtasks' },
    
    // Add the mapped Jira custom field IDs
    { key: 'customfield_11321', value: mapCampaignToJiraId(formData.campaign), type: 'select', description: 'Campaign (Jira Custom Field)' },
    { key: 'customfield_11324', value: mapPortfolioToJiraId(formData.portfolio), type: 'select', description: 'Portfolio (Jira Custom Field)' }
  ];

  // FIXED: Only add checkbox custom fields if they should be checked (not null)
  if (talentCheckboxValue !== null) {
    customFields.push({ 
      key: 'customfield_11329', 
      value: talentCheckboxValue, 
      type: 'text', 
      description: 'Talent Requirements Checkbox (Jira Custom Field)' 
    });
  }

  if (storyCheckboxValue !== null) {
    customFields.push({ 
      key: 'customfield_11328', 
      value: storyCheckboxValue, 
      type: 'text', 
      description: 'Story Requirements Checkbox (Jira Custom Field)' 
    });
  }

  // Add Epic operation fields
  if (isEpicOperation) {
    customFields.push(
      { key: 'epic_operation', value: operation, type: 'select', description: 'Epic operation type' },
      { key: 'has_previous_brief', value: formData.hasPreviousBrief, type: 'select', description: 'Has previous brief' }
    );
    
    if (epicKey) {
      customFields.push(
        { key: 'selected_epic_key', value: epicKey, type: 'text', description: 'Selected Epic key for update' }
      );
    }
  }

  return {
    summary: `${projectName} - ${formType}`,
    description,
    issueType: getIssueTypeFromFormType(formType),
    priority: determinePriority(formData),
    labels,
    customFields,
    assignee: '', // To be set in Zapier based on directorate/portfolio
    reporter: cleanTextField(formData.yourName),
    components: formData.assetTypes || [],
    deliverables: structuredDeliverables,
    
    // Epic operation fields
    operation: isEpicOperation ? operation : undefined,
    epicKey: epicKey || undefined,

    // ============ INDIVIDUAL FIELDS FOR ZAPIER ============
    // Basic Info
    submitterName: cleanTextField(formData.yourName),
    directorate: cleanTextField(formData.directorate),
    portfolio: cleanTextField(formData.portfolio),
    portfolioJiraId: mapPortfolioToJiraId(formData.portfolio),
    campaign: cleanTextField(formData.campaign),
    campaignJiraId: mapCampaignToJiraId(formData.campaign),
    formType: formType,
    
    // Project Info
    projectName: cleanTextField(formData.projectName),
    projectOverview: cleanTextField(formData.projectOverview),
    selectedEpicKey: cleanTextField(formData.selectedEpicKey),
    
    // Yes/No Fields for Zapier Routing - CRITICAL FOR WORKFLOWS
    hasPreviousBrief: cleanTextField(formData.hasPreviousBrief),
    hasBudget: cleanTextField(formData.hasBudget),
    requiresTalent: cleanTextField(formData.requiresTalent),
    talentEssentialForPlanning: cleanTextField(formData.talentEssentialForPlanning),
    requiresStoryGathering: cleanTextField(formData.requiresStoryGathering),
    storyEssentialForPlanning: cleanTextField(formData.storyEssentialForPlanning),
    requiresSpecificAssets: cleanTextField(formData.requiresSpecificAssets),
    requiresNewTechFunctionality: cleanTextField(formData.requiresNewTechFunctionality),
    
    // Budget Info
    budgetAmount: cleanTextField(formData.budgetAmount),
    budgetCode: cleanTextField(formData.budgetCode),
    
    // Dates - Updated for simplified structure
    projectLiveDate: cleanTextField(formData.projectLiveDate),
    
    // Project Requirements - New field
    projectRequirements: cleanTextField(formData.projectRequirements),
    
    // Talent Details
    talentRequirements: cleanTextField(formData.talentRequirements),
    talentImpact: cleanTextField(formData.talentImpact),
    budgetBreakdownDescription: cleanTextField(formData.budgetBreakdownDescription),
    
    // Story Details
    storyOverview: cleanTextField(formData.storyOverview),
    feelGoodFactor: cleanTextField(formData.feelGoodFactor),
    fundedPartnerDetails: cleanTextField(formData.fundedPartnerDetails),
    thematicAreas: cleanTextField(formData.thematicAreas),
    willBeUsedInAnotherAsset: cleanTextField(formData.willBeUsedInAnotherAsset),
    
    // Tech Details
    techRequirements: cleanTextField(formData.techRequirements),
    
    // Assets
    assetTypesText: formatArrayField(formData.assetTypes),
    approvedCopy: cleanTextField(formData.approvedCopy),
    contentLocations: cleanTextField(formData.contentLocations),
    deliverablesText: cleanTextField(formData.deliverables),
    
    // Social/Touchpoints
    touchpointsText: formatArrayField(formData.touchpoints),
    socialChannelsText: formatArrayField(formData.socialChannels),
    socialPostDescription: cleanTextField(formData.socialPostDescription),
    socialPurposeImpact: cleanTextField(formData.socialPurposeImpact),
    
    // Supporting Docs
    supportingDocuments: cleanTextField(formData.supportingDocuments),
    
    // Counts for Analytics
    deliverablesCount: structuredDeliverables.length,
    subtasksTotal: structuredDeliverables.reduce((total, item) => total + item.subtasks.length, 0)
  };
}

// Export utility functions for use in Zapier
export {
  parseDeliverables,
  formatDeliverablesForJira,
  getIssueTypeFromFormType,
  determinePriority,
  cleanTextField,
  formatArrayField,
  mapCampaignToJiraId,
  mapPortfolioToJiraId,
  mapTalentRequirementsCheckbox,
  mapStoryRequirementsCheckbox
};