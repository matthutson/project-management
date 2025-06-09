# Zapier Field Reference Guide

## Quick Setup Steps

1. **Create Webhook Trigger** in Zapier:
   - App: "Webhooks by Zapier"
   - Event: "Catch Hook"
   - URL: `https://hooks.zapier.com/hooks/catch/12809750/2vn5sae/`

2. **Test the Webhook**:
   - Use the Webhook Tester component in the app
   - Send test data for each form type
   - Capture the test data in Zapier

3. **Set Up Jira Action**:
   - App: "Jira Software"
   - Event: "Create Issue"
   - Use the field mappings below

## Webhook Data Structure

Every webhook submission contains this structure:

```json
{
  "jira": {
    "summary": "Form Type: Project Name",
    "description": "Formatted description with all details",
    "issueType": "Epic|Story|Task",
    "priority": "High|Medium|Low",
    "labels": ["form-type", "campaign", "directorate"],
    "customFields": { /* All form fields with standardized names */ },
    "category": "Production|Project Setup|Data & Analytics",
    "formType": "Full Production Brief|Quick Kick-off Form|Data Request Brief",
    "submissionDate": "2025-01-15T10:30:00.000Z"
  },
  "formData": { /* Original form data */ },
  "submissionTimestamp": "2025-01-15T10:30:00.000Z",
  "formVersion": "1.0"
}
```

## Essential Jira Field Mappings

### Core Jira Fields (Required)

| Jira Field | Zapier Mapping | Description |
|------------|----------------|-------------|
| **Project** | `[Your Project Key]` | Your Jira project (e.g., "CR", "PM") |
| **Issue Type** | `{{jira__issueType}}` | Epic/Story/Task based on form type |
| **Summary** | `{{jira__summary}}` | Auto-generated ticket title |
| **Description** | `{{jira__description}}` | Formatted description with all details |
| **Priority** | `{{jira__priority}}` | Auto-assigned priority level |
| **Labels** | `{{jira__labels}}` | Comma-separated labels |

### Most Important Custom Fields

| Field Purpose | Zapier Mapping | Sample Value |
|---------------|----------------|--------------|
| **Submitter Name** | `{{jira__customFields__submitter_name}}` | "John Smith" |
| **Directorate** | `{{jira__customFields__submitter_directorate}}` | "marketing" |
| **Project Name** | `{{jira__customFields__project_name}}` | "Red Nose Day 2025" |
| **Campaign** | `{{jira__customFields__project_campaign}}` | "rnd26" |
| **Target Audience** | `{{jira__customFields__target_audience}}` | "UK adults 25-54" |
| **Live Date** | `{{jira__customFields__live_date}}` | "2025-03-15" |
| **Budget Amount** | `{{jira__customFields__budget_amount}}` | "£50,000" |
| **Budget Code** | `{{jira__customFields__budget_code}}` | "12345-204-F019" |

## Complete Field Reference

### Personal Information
```
{{jira__customFields__submitter_name}}           # Submitter's name
{{jira__customFields__submitter_directorate}}    # Their directorate
```

### Project Core
```
{{jira__customFields__project_name}}             # Project name
{{jira__customFields__project_campaign}}         # Campaign (CR365, SR25, RND26)
{{jira__customFields__project_overview}}         # Project description
{{jira__customFields__has_previous_brief}}       # Yes/No
{{jira__customFields__target_audience}}          # Target audience description
{{jira__customFields__desired_action}}           # What action we want people to take
```

### Timeline Fields
```
{{jira__customFields__announcement_date}}        # When project announced
{{jira__customFields__live_date}}               # When project goes live
{{jira__customFields__rough_live_date}}         # Rough live date (kick-off form)
```

### Budget Information
```
{{jira__customFields__has_budget}}              # Yes/No
{{jira__customFields__budget_amount}}           # Budget amount (£)
{{jira__customFields__budget_code}}             # Budget code
{{jira__customFields__talent_budget_glam}}      # Talent glam budget
{{jira__customFields__talent_budget_travel}}    # Talent travel budget
{{jira__customFields__talent_budget_other}}     # Other talent costs
{{jira__customFields__talent_budget_total}}     # Total talent budget
```

### Talent Requirements
```
{{jira__customFields__requires_talent}}                    # Yes/No
{{jira__customFields__talent_essential_for_planning}}      # Yes/No (kick-off)
{{jira__customFields__talent_requirements}}                # What talent needs to do
{{jira__customFields__talent_impact}}                      # Why talent will help
```

### Story Requirements
```
{{jira__customFields__requires_story_gathering}}           # Yes/No
{{jira__customFields__story_essential_for_planning}}       # Yes/No (kick-off)
{{jira__customFields__story_overview}}                     # Story description
{{jira__customFields__feel_good_factor}}                   # What feels good about story
{{jira__customFields__funded_partner_details}}             # Partner information
{{jira__customFields__story_used_in_other_asset}}          # True/False
{{jira__customFields__thematic_areas}}                     # poverty, education, etc.
{{jira__customFields__creative_ideas}}                     # Creative storytelling ideas
{{jira__customFields__story_focus_type}}                   # Need vs narrative impact
{{jira__customFields__safeguarding_concerns}}              # Safeguarding notes
{{jira__customFields__viewer_reaction}}                    # Desired reaction
{{jira__customFields__anonymous_story}}                    # Yes/No/Unsure
```

### Asset Requirements
```
{{jira__customFields__requires_specific_assets}}           # Yes/No
{{jira__customFields__asset_types}}                        # Array: [broadcast, copy_text, etc.]
{{jira__customFields__approved_copy}}                      # Yes/No
{{jira__customFields__deliverables}}                       # List of deliverables
{{jira__customFields__content_locations}}                  # Where content will be seen
```

### Digital & Social
```
{{jira__customFields__touchpoints}}                        # Array: [social]
{{jira__customFields__social_channels}}                    # Array: [facebook, instagram, etc.]
{{jira__customFields__social_post_description}}            # Social post requirements
{{jira__customFields__social_purpose_impact}}              # Purpose of social posts
```

### Technical Requirements
```
{{jira__customFields__requires_new_tech_functionality}}    # Yes/No
{{jira__customFields__tech_requirements}}                  # Technical requirements
{{jira__customFields__data_requirements}}                  # Data needed for planning
```

### Documentation
```
{{jira__customFields__project_documentation}}              # General documentation
{{jira__customFields__marketing_communications_plan}}      # Marketing plan (kick-off)
{{jira__customFields__supporting_documents}}               # Box links, etc.
```

## Form-Specific Fields

### Data Request Brief Only
```
{{jira__customFields__data_type}}                # Type of data request
{{jira__customFields__data_description}}         # Detailed description
{{jira__customFields__urgency}}                  # High/Medium/Low
{{jira__customFields__deadline}}                 # When needed by
```

## Issue Type Mapping

| Form Type | Issue Type | Priority | Labels |
|-----------|------------|----------|--------|
| Full Production Brief | `Epic` | `High` | `production-brief, comprehensive, planning` |
| Quick Kick-off Form | `Story` | `Medium` | `kickoff, quick-start, planning` |
| Data Request Brief | `Task` | `Medium` | `data-request, analytics, reporting` |

## Array Fields

Some fields contain arrays (multiple values). In Zapier, these appear as comma-separated values:

```
Asset Types: "broadcast,social_content,photography"
Social Channels: "facebook,instagram,youtube"
Touchpoints: "social"
```

To use in Jira, you can either:
1. Use as comma-separated text in a text field
2. Split and map to multi-select fields
3. Create separate fields for each value

## Conditional Logic in Zapier

You can use Zapier's conditional logic based on form type:

```
If {{jira__formType}} equals "Full Production Brief"
  → Create Epic in Project A
  → Assign to Production Team

If {{jira__formType}} equals "Quick Kick-off Form"
  → Create Story in Project B
  → Assign to Project Manager
  → Create Confluence page with {{jira__customFields__marketing_communications_plan}}

If {{jira__formType}} equals "Data Request Brief"
  → Create Task in Analytics Project
  → Assign to Data Team
```

## Testing Checklist

- [ ] Webhook receives data successfully
- [ ] All form types create correct issue types
- [ ] Required fields are populated
- [ ] Custom fields map correctly
- [ ] Labels and priorities are assigned
- [ ] Description formatting looks good
- [ ] Arrays are handled properly
- [ ] Dates are in correct format

## Common Issues & Solutions

**Issue**: Field not appearing in Zapier
**Solution**: Send test data first, then refresh Zapier's field list

**Issue**: Arrays showing as objects
**Solution**: Use the direct field path, arrays are pre-formatted as comma-separated strings

**Issue**: Dates in wrong format
**Solution**: Dates are provided in ISO format, use Zapier's date formatter if needed

**Issue**: Custom fields not creating in Jira
**Solution**: Ensure custom fields exist in Jira project before mapping

## Next Steps

1. Use the Webhook Tester to send sample data
2. Configure your Zapier trigger and capture test data
3. Set up Jira action with the essential field mappings above
4. Test with each form type
5. Add any additional actions (Confluence, notifications, etc.)
6. Go live and monitor submissions

## Support

If you need help with specific field mappings or Jira configuration, refer to:
- `/docs/JIRA_INTEGRATION.md` for detailed technical information
- `/docs/ZAPIER_SETUP.md` for quick setup steps
- Jira's custom field documentation for field type requirements