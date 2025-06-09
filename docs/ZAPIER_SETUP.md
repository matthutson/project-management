# Quick Zapier Setup Guide

## 1. Create the Webhook Trigger
- **App**: Webhooks by Zapier
- **Event**: Catch Hook
- **URL**: `https://hooks.zapier.com/hooks/catch/12809750/2vn5sae/`

## 2. Add Jira Action
- **App**: Jira Software
- **Event**: Create Issue

## 3. Essential Field Mappings

### Core Jira Fields
```
Project: [Your Jira Project Key]
Issue Type: {{jira__issueType}}
Summary: {{jira__summary}}
Description: {{jira__description}}
Priority: {{jira__priority}}
Labels: {{jira__labels}}
```

### Most Important Custom Fields
```
Submitter: {{jira__customFields__submitter_name}}
Directorate: {{jira__customFields__submitter_directorate}}
Project Name: {{jira__customFields__project_name}}
Campaign: {{jira__customFields__project_campaign}}
Live Date: {{jira__customFields__live_date}}
Budget: {{jira__customFields__budget_amount}}
```

## 4. Test the Integration
1. Submit a form from the app
2. Check Zapier for the webhook trigger
3. Verify the Jira ticket was created correctly

## 5. Optional: Add Confluence Action
- **App**: Confluence
- **Event**: Create Page
- **Content**: `{{jira__customFields__marketing_communications_plan}}`

## Field Categories by Form Type

### Full Production Brief → Epic
- Comprehensive project information
- Budget details
- Talent and story requirements
- Asset specifications

### Quick Kick-off Form → Story  
- Essential planning information
- Project documentation template
- Key requirements only

### Data Request Brief → Task
- Data requirements
- Analytics requests
- Reporting needs

All webhook data is pre-formatted for easy Jira integration!