# Epic Update Zapier Fields Reference

## Overview
When a user selects "Yes" for "Has a brief been previously submitted" and chooses an Epic from the dropdown, Zapier receives these specific fields to route the submission to the Epic update workflow.

## Key Routing Fields for Epic Updates

### Primary Routing Fields
```json
{
  "operation": "update",                    // String: "create" or "update"
  "epicKey": "CRB-22",                     // String: The selected Epic key
  "selectedEpicKey": "CRB-22",             // String: Alternative field name for clarity
  "targetEpic": "CRB-22",                  // String: Another clear field for target Epic
  "epicToUpdate": "CRB-22",                // String: Yet another clear field
  
  "isEpicUpdate": true,                    // Boolean: Easy filter for Zapier
  "shouldMergeWithExisting": true,         // Boolean: Indicates merge/append operation
  "workflowType": "EPIC_UPDATE",           // String: Clear workflow type
  
  "hasPreviousBrief": "yes",               // String: Original form field
  "formType": "Full Production Brief"      // String: Form type identifier
}
```

### Zapier Workflow Setup

#### Step 1: Filter for Epic Updates
Use any of these fields to identify Epic update submissions:
- `operation` equals "update"
- `isEpicUpdate` equals true
- `workflowType` equals "EPIC_UPDATE"
- `hasPreviousBrief` equals "yes"

#### Step 2: Get Target Epic
Use any of these fields to identify which Epic to update:
- `epicKey` (primary)
- `selectedEpicKey` 
- `targetEpic`
- `epicToUpdate`

All contain the same Epic key (e.g., "CRB-22") that the user selected.

#### Step 3: Form Data
All individual form fields are included at the root level:
```json
{
  "submitterName": "Sarah Johnson",
  "projectName": "Red Nose Day 2024 Digital Campaign",
  "campaign": "rnd26",
  "campaignJiraId": "10470",
  "portfolio": "individual_regular_giving",
  "portfolioJiraId": "10476",
  "budgetAmount": "£50,000",
  "targetAudience": "Young adults aged 18-35...",
  "requiresTalent": "yes",
  "requiresStoryGathering": "yes",
  // ... all other form fields
}
```

## Example Epic Update Payload

```json
{
  "operation": "update",
  "epicKey": "CRB-22",
  "selectedEpicKey": "CRB-22",
  "isEpicUpdate": true,
  "targetEpic": "CRB-22",
  "workflowType": "EPIC_UPDATE",
  "shouldMergeWithExisting": true,
  "epicToUpdate": "CRB-22",
  
  "hasPreviousBrief": "yes",
  "submitterName": "Sarah Johnson",
  "projectName": "Red Nose Day 2024 Digital Campaign",
  "campaign": "rnd26",
  "campaignJiraId": "10470",
  "portfolio": "individual_regular_giving",
  "portfolioJiraId": "10476",
  "budgetAmount": "£50,000",
  "budgetCode": "RND24-204-F019-DIGI-CAMP",
  "targetAudience": "Young adults aged 18-35 who are active on social media...",
  "requiresTalent": "yes",
  "talentRequirements": "High-profile comedian for main campaign video...",
  "requiresStoryGathering": "yes",
  "storyOverview": "Following a young teacher in Kenya...",
  "requiresSpecificAssets": "yes",
  "assetTypesText": "social_content, videography, photography, graphic_design",
  
  "submissionTimestamp": "2025-06-06T17:30:00.000Z",
  "formType": "Full Production Brief"
}
```

## Zapier Zap Logic

### For Epic Updates (when `isEpicUpdate` = true):
1. **Filter**: Only process when `isEpicUpdate` equals `true`
2. **Find Epic**: Use `epicKey` to locate the existing Epic in Jira
3. **Merge/Append**: Add new form data to the existing Epic
4. **Update**: Update the Epic with combined information

### For New Epics (when `isEpicUpdate` = false):
1. **Filter**: Only process when `isEpicUpdate` equals `false` 
2. **Create**: Create a new Epic with the form data

## Testing Epic Updates

Use the WebhookTester with "Full Production Brief (Update Epic)" which sends:
- `hasPreviousBrief`: "yes"
- `selectedEpicKey`: "CRB-22" 
- `operation`: "update"
- All the routing fields above

This allows you to test the Epic update workflow in Zapier.