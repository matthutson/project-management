# Comic Relief Project Management System

A streamlined project management application for Comic Relief campaigns, built with React, TypeScript, and Tailwind CSS.

## Features

- **Landing Page**: Central hub with workflow diagram and form options
- **Quick Kick-off Form**: Simplified form for rapid project setup
- **Full Production Brief**: Comprehensive project planning form
- **Data Request Brief**: Dedicated form for data analysis requests
- **Technology Briefs**: Six specialized brief types with descriptions
- **Zapier Integration**: Automatic webhook submissions for form data
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite
- **UI Components**: Radix UI + custom shadcn/ui components
- **Icons**: Lucide React
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd comic-relief-project-management
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment to Vercel

### Option 1: Deploy from GitHub (Recommended)

1. Push your code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Vercel will automatically detect the Vite framework
6. Click "Deploy"

### Option 2: Deploy with Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy from your project directory:
```bash
vercel
```

3. Follow the prompts to configure your deployment

## Jira Integration via Zapier

The application automatically formats all form submissions for seamless Jira integration through Zapier.

### Webhook Structure

All forms submit to: `https://hooks.zapier.com/hooks/catch/12809750/2vn5sae/`

Each submission includes:
```json
{
  "jira": {
    "summary": "Full Production Brief: Project Name",
    "description": "Formatted Jira description",
    "issueType": "Epic|Story|Task",
    "priority": "High|Medium|Low",
    "labels": ["form-type", "campaign", "directorate"],
    "customFields": {
      "submitter_name": "John Smith",
      "project_name": "Campaign Name",
      // ... 40+ mapped form fields
    }
  },
  "formData": { /* original form data */ },
  "submissionTimestamp": "2024-01-15T10:30:00.000Z"
}
```

### Form Type → Jira Mapping

| Form Type | Jira Issue Type | Priority | Use Case |
|-----------|----------------|----------|----------|
| Full Production Brief | Epic | High | Comprehensive project planning |
| Quick Kick-off Form | Story | Medium | Initial project setup |
| Data Request Brief | Task | Medium | Analytics and reporting |

### Quick Zapier Setup

1. **Webhook Trigger**: Use the provided URL
2. **Jira Action**: Map `{{jira__summary}}`, `{{jira__description}}`, `{{jira__issueType}}`
3. **Custom Fields**: All form fields available as `{{jira__customFields__field_name}}`

### Complete Documentation

- **Detailed Setup**: See `/docs/JIRA_INTEGRATION.md`
- **Quick Reference**: See `/docs/ZAPIER_SETUP.md`
- **Field Mappings**: See `/lib/jira-field-mapping.ts`

### Key Features

- **40+ Standardized Fields**: All form inputs mapped to Jira-friendly names
- **Automatic Ticket Descriptions**: Rich, formatted descriptions with all project details
- **Smart Categorization**: Automatic issue types, priorities, and labels
- **Easy Configuration**: Pre-structured for immediate Zapier → Jira setup

## Project Structure

```
├── App.tsx                     # Main application component
├── src/
│   └── main.tsx               # React entry point
├── components/
│   ├── LandingPage.tsx        # Main landing page
│   ├── ComicReliefForm.tsx    # Full production brief form
│   ├── ComicReliefKickOffForm.tsx # Quick kick-off form
│   ├── FormComponents.tsx     # Reusable form components
│   ├── FormProvider.tsx       # Form state management
│   ├── ProjectManagementComponents.tsx # Project setup flow
│   └── ui/                    # shadcn/ui components
├── styles/
│   └── globals.css           # Global styles and Tailwind config
├── lib/
│   └── utils.ts              # Utility functions
└── public/                   # Static assets
```

## Key Components

### LandingPage
- Main navigation hub
- Workflow diagram display
- Form selection cards
- Technology briefs section

### ComicReliefForm
- Comprehensive project brief form
- Conditional sections based on user input
- Budget allocation tables
- Asset requirements

### ComicReliefKickOffForm
- Simplified quick-start form
- Essential planning fields only
- Project management resource creation
- Pre-populated documentation templates

## Environment Variables

No environment variables are required for basic deployment. The Zapier webhook URL is hardcoded in the forms.

For development with different webhooks, you could add:
```
VITE_ZAPIER_WEBHOOK_URL=your-webhook-url
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary to Comic Relief.

## Support

For technical issues or questions about deployment, contact the development team.