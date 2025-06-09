# 🚀 Quick Start: Setting Up Zapier Integration

## Step 1: Access the Webhook Tester

1. Open the Comic Relief Project Management app
2. Click the **"🔧 Webhook Testing Tool"** card on the landing page
3. This tool will help you send sample data to Zapier

## Step 2: Set Up Zapier Webhook

1. **Create a new Zap** in Zapier
2. **Choose trigger**: "Webhooks by Zapier" → "Catch Hook"
3. **Webhook URL**: Copy the URL shown in the tester:
   ```
   https://hooks.zapier.com/hooks/catch/12809750/2vn5sae/
   ```
4. **Save the trigger** (don't test yet)

## Step 3: Send Test Data

1. In the Webhook Tester, click **"Send Test Data"** for each form type:
   - **Full Production Brief** (creates Epic in Jira)
   - **Quick Kick-off Form** (creates Story in Jira)
   - **Data Request Brief** (creates Task in Jira)

2. ✅ Look for success messages in the tester

## Step 4: Capture Test Data in Zapier

1. Back in Zapier, click **"Test trigger"**
2. You should see the webhook data appear
3. ✅ Verify you can see fields like:
   - `jira.summary`
   - `jira.issueType`
   - `jira.customFields.submitter_name`
   - `jira.customFields.project_name`

## Step 5: Set Up Jira Action

1. **Add action**: "Jira Software" → "Create Issue"
2. **Connect your Jira account**
3. **Map the essential fields**:

   | Jira Field | Zapier Value |
   |------------|--------------|
   | Project | `[Your Project Key]` |
   | Issue Type | `{{jira__issueType}}` |
   | Summary | `{{jira__summary}}` |
   | Description | `{{jira__description}}` |
   | Priority | `{{jira__priority}}` |

4. **Add custom fields** (create these in Jira first):
   - Submitter: `{{jira__customFields__submitter_name}}`
   - Project Name: `{{jira__customFields__project_name}}`
   - Campaign: `{{jira__customFields__project_campaign}}`
   - Budget: `{{jira__customFields__budget_amount}}`

## Step 6: Test the Integration

1. **Test the Zap** in Zapier
2. Check that a Jira ticket is created successfully
3. Verify the fields are populated correctly
4. Turn on the Zap

## Step 7: Test with Real Forms

1. Go back to the app landing page
2. Fill out one of the actual forms
3. Submit it and check that:
   - ✅ Form submits successfully
   - ✅ Jira ticket is created
   - ✅ All data appears correctly

## 📋 Essential Field Mappings

Copy these mappings into your Zapier configuration:

```
# Core Fields
Project: [YOUR_PROJECT_KEY]
Issue Type: {{jira__issueType}}
Summary: {{jira__summary}}
Description: {{jira__description}}
Priority: {{jira__priority}}
Labels: {{jira__labels}}

# Custom Fields (create in Jira first)
Submitter Name: {{jira__customFields__submitter_name}}
Directorate: {{jira__customFields__submitter_directorate}}
Project Name: {{jira__customFields__project_name}}
Campaign: {{jira__customFields__project_campaign}}
Target Audience: {{jira__customFields__target_audience}}
Live Date: {{jira__customFields__live_date}}
Budget Amount: {{jira__customFields__budget_amount}}
Budget Code: {{jira__customFields__budget_code}}
```

## 🎯 Expected Results

After setup, each form submission will:

- **Full Production Brief** → Creates Jira Epic with all project details
- **Quick Kick-off Form** → Creates Jira Story with project documentation
- **Data Request Brief** → Creates Jira Task for analytics team

## 📚 Additional Resources

- **Complete field reference**: `/docs/ZAPIER_FIELD_REFERENCE.md`
- **Detailed setup guide**: `/docs/JIRA_INTEGRATION.md`
- **Troubleshooting**: `/docs/TROUBLESHOOTING.md`

## 🆘 Need Help?

1. **Fields not appearing**: Send test data first, then refresh Zapier
2. **Custom fields missing**: Create them in Jira before mapping
3. **Integration failing**: Check Jira permissions and project access
4. **Form submission errors**: Check the troubleshooting guide

## ✅ Success Checklist

- [ ] Webhook URL configured in Zapier
- [ ] Test data sent from app
- [ ] Zapier receives webhook data
- [ ] Jira action configured with essential fields
- [ ] Test Zap creates ticket successfully
- [ ] Real form submission creates ticket
- [ ] All required data appears in Jira
- [ ] Zap is turned on and active

**You're ready to go!** 🎉

The system will now automatically create Jira tickets for all form submissions with properly structured, searchable data.