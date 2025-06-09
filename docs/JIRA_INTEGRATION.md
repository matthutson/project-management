# Jira Integration Configuration Guide

This document provides comprehensive instructions for configuring the Comic Relief Project Management system to integrate with Jira via Zapier.

## Overview

The application automatically structures form submissions into Jira-compatible formats, making it easy to create tickets, assign fields, and organize project data in Jira.

## Webhook Payload Structure

All form submissions to the Zapier webhook (`https://hooks.zapier.com/hooks/catch/12809750/2vn5sae/`) include:

```json
{
  "jira": {
    "summary": "Full Production Brief: Project Name",
    "description": "Structured Jira description with all form details",
    "issueType": "Epic|Story|Task",
    "priority": "Highest|High|Medium|Low|Lowest",
    "labels": ["production-brief", "campaign-name", "directorate"],
    "customFields": {
      "submitter_name": "John Smith",
      "project_name": "Red Nose Day Campaign",
      "target_audience": "UK Adults 25-54",
      // ... all form fields with standardized names
    },
    "category": "Production|Project Setup|Data & Analytics",
    "formType": "Full Production Brief|Quick Kick-off Form|Data Request Brief",
    "submissionDate": "2024-01-15T10:30:00.000Z"
  },
  "formData": {
    // Original form data for reference
  },
  "submissionTimestamp": "2024-01-15T10:30:00.000Z",
  "formVersion": "1.0"
}
```

## Jira Field Mapping

### Core Jira Fields

| Jira Field | Source | Description |
|------------|--------|-------------|
| `summary` | Auto-generated | `{Form Type}: {Project Name}` |
| `description` | Auto-generated | Structured markdown with all key information |
| `issueType` | Form type mapping | Epic (Full Brief), Story (Kick-off), Task (Data Request) |
| `priority` | Form type mapping | Automatically assigned based on form type |
| `labels` | Form data | Includes form type, campaign, and directorate |

### Custom Field Mappings

All form fields are mapped to standardized names for easy Jira configuration:

#### Personal Information
- `submitter_name` ← `yourName`
- `submitter_directorate` ← `directorate`

#### Project Core
- `project_name` ← `projectName`
- `project_campaign` ← `campaign`
- `project_overview` ← `projectOverview`
- `has_previous_brief` ← `hasPreviousBrief`
- `target_audience` ← `targetAudience`
- `desired_action` ← `desiredAction`

#### Timeline
- `announcement_date` ← `announcementDate`
- `live_date` ← `liveDate`
- `rough_live_date` ← `roughLiveDate`

#### Budget
- `has_budget` ← `hasBudget`
- `budget_amount` ← `budgetAmount`
- `budget_code` ← `budgetCode`

#### Talent Requirements
- `requires_talent` ← `requiresTalent`
- `talent_essential_for_planning` ← `talentEssentialForPlanning`
- `talent_requirements` ← `talentRequirements`
- `talent_impact` ← `talentImpact`
- `talent_budget_glam` ← `budgetBreakdown.glam`
- `talent_budget_travel` ← `budgetBreakdown.travel`
- `talent_budget_other` ← `budgetBreakdown.other`
- `talent_budget_total` ← `budgetBreakdown.total`

#### Story Requirements
- `requires_story_gathering` ← `requiresStoryGathering`
- `story_essential_for_planning` ← `storyEssentialForPlanning`
- `story_overview` ← `storyOverview`
- `feel_good_factor` ← `feelGoodFactor`
- `funded_partner_details` ← `fundedPartnerDetails`
- `story_used_in_other_asset` ← `willBeUsedInAnotherAsset`
- `thematic_areas` ← `thematicAreas`
- `creative_ideas` ← `creativeIdeas`
- `story_focus_type` ← `focusType`
- `safeguarding_concerns` ← `safeguardingConcerns`
- `viewer_reaction` ← `viewerReaction`
- `anonymous_story` ← `anonymousStory`

#### Asset Requirements
- `requires_specific_assets` ← `requiresSpecificAssets`
- `asset_types` ← `assetTypes` (array)
- `approved_copy` ← `approvedCopy`
- `deliverables` ← `deliverables`
- `content_locations` ← `contentLocations`

#### Digital & Social
- `touchpoints` ← `touchpoints` (array)
- `social_channels` ← `socialChannels` (array)
- `social_post_description` ← `socialPostDescription`
- `social_purpose_impact` ← `socialPurposeImpact`

#### Technical
- `requires_new_tech_functionality` ← `requiresNewTechFunctionality`
- `tech_requirements` ← `techRequirements`
- `data_requirements` ← `dataRequirements`

#### Documentation
- `project_documentation` ← `projectDocumentation`
- `marketing_communications_plan` ← `marketingCommunicationsPlan`
- `supporting_documents` ← `supportingDocuments`

## Form Type Configuration

### Full Production Brief
- **Jira Issue Type**: Epic
- **Priority**: High
- **Labels**: `["production-brief", "comprehensive", "planning"]`
- **Category**: Production

### Quick Kick-off Form
- **Jira Issue Type**: Story
- **Priority**: Medium
- **Labels**: `["kickoff", "quick-start", "planning"]`
- **Category**: Project Setup

### Data Request Brief
- **Jira Issue Type**: Task
- **Priority**: Medium
- **Labels**: `["data-request", "analytics", "reporting"]`
- **Category**: Data & Analytics

## Zapier Configuration Steps

### 1. Webhook Trigger Setup
1. In Zapier, create a new Zap with "Webhooks by Zapier" as the trigger
2. Choose "Catch Hook" as the trigger event
3. Use the provided webhook URL: `https://hooks.zapier.com/hooks/catch/12809750/2vn5sae/`
4. Test the trigger by submitting a form

### 2. Jira Action Setup
1. Add "Jira Software" as the action app
2. Choose "Create Issue" as the action event
3. Connect your Jira account

### 3. Field Mapping in Zapier

Map the webhook data to Jira fields as follows:

#### Required Fields
- **Project**: Your Jira project key
- **Issue Type**: `{{jira__issueType}}`
- **Summary**: `{{jira__summary}}`
- **Description**: `{{jira__description}}`

#### Recommended Fields
- **Priority**: `{{jira__priority}}`
- **Labels**: `{{jira__labels}}` (comma-separated)
- **Reporter**: Use submitter email or default reporter

#### Custom Fields
Create custom fields in Jira for any of the mapped fields you want to track:

Example custom field setup:
- **Submitter Name**: `{{jira__customFields__submitter_name}}`
- **Project Campaign**: `{{jira__customFields__project_campaign}}`
- **Target Audience**: `{{jira__customFields__target_audience}}`
- **Budget Amount**: `{{jira__customFields__budget_amount}}`
- **Talent Requirements**: `{{jira__customFields__talent_requirements}}`

### 4. Additional Actions (Optional)

#### Create Confluence Page
1. Add "Confluence" as another action
2. Use the project documentation field: `{{jira__customFields__marketing_communications_plan}}`
3. Link to the Jira ticket

#### Send Notifications
1. Add "Email" or "Slack" action
2. Notify relevant team members about new submissions
3. Include Jira ticket link and key details

#### Schedule Meetings
1. Add "Google Calendar" or "Outlook" action
2. Create scoping meetings based on form type
3. Invite stakeholders based on directorate and requirements

## Jira Custom Field Types

Recommended custom field types for different data:

| Field | Jira Field Type | Description |
|-------|----------------|-------------|
| Text fields | Single Line Text | Names, short descriptions |
| Long descriptions | Multi-line Text | Detailed requirements, overviews |
| Yes/No fields | Select List (Single) | Options: Yes, No |
| Dates | Date Picker | Timeline information |
| Arrays | Multi-select | Asset types, social channels |
| Budget amounts | Number Field | Monetary values |
| Priorities | Select List (Single) | High, Medium, Low |

## Troubleshooting

### Common Issues

1. **Missing Field Data**
   - Check if field exists in `jira.customFields` object
   - Verify field name mapping in the configuration

2. **Date Format Issues**
   - Dates are provided in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
   - Convert in Zapier if needed using date formatter

3. **Array Fields**
   - Arrays (like asset_types, social_channels) are provided as arrays
   - Join with commas in Zapier if needed

### Testing

1. Submit test forms with various combinations of fields
2. Check Zapier test data to see the exact payload structure
3. Verify Jira tickets are created with correct field mappings
4. Test all three form types (Full Brief, Kick-off, Data Request)

## Field Configuration Reference

For a complete list of all available fields and their mappings, see the `JIRA_FIELD_NAMES` constant in `/lib/jira-field-mapping.ts`.

## Support

For technical assistance with the integration:
1. Check the webhook payload in Zapier
2. Verify field mappings against this documentation
3. Test with simple forms first, then add complexity
4. Use the Jira API documentation for custom field creation

The system is designed to be flexible and easily configurable for your specific Jira setup and workflow requirements.