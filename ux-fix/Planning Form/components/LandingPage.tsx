import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  FileText,
  Zap,
  Users,
  Globe,
  CreditCard,
  Link,
  Smartphone,
  BarChart3,
  ShoppingCart,
  TestTube2,
} from "lucide-react";
import { mapFormDataToJira } from "../lib/jira-field-mapping";
import {
  submitWithRetry,
  generateEmailFallback,
} from "../lib/webhook-test";
import workflowImage from "figma:asset/be8c2e5f4b87c7c7a57b0a9a2e7f5c9d8e3f1a4b.png";

interface LandingPageProps {
  onNavigate: (
    page: "original" | "kickoff" | "webhook-tester",
  ) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  // Handle data request brief submission
  const handleDataRequest = async () => {
    const dataRequestData = {
      yourName: prompt("Enter your name:") || "Anonymous",
      directorate:
        prompt("Enter your directorate:") || "Not specified",
      dataType:
        prompt(
          "What type of data do you need? (e.g., Power BI report, Google Analytics, etc.)",
        ) || "General data request",
      dataDescription:
        prompt("Please describe your data requirements:") ||
        "No description provided",
      urgency:
        prompt(
          "How urgent is this request? (High/Medium/Low)",
        ) || "Medium",
      deadline:
        prompt("When do you need this by? (YYYY-MM-DD)") ||
        "No deadline specified",
    };

    // Validate that at least name is provided
    if (
      !dataRequestData.yourName ||
      dataRequestData.yourName === "Anonymous"
    ) {
      alert(
        "Please provide your name to submit a data request.",
      );
      return;
    }

    try {
      // Map data request to Jira-compatible structure
      const jiraData = mapFormDataToJira(
        dataRequestData,
        "Data Request Brief",
      );

      // Create the payload
      const payload = {
        jira: jiraData,
        formData: dataRequestData,
        submissionTimestamp: new Date().toISOString(),
        formVersion: "1.0",
      };

      console.log(
        "Submitting data request with retry logic...",
      );

      // Submit with retry logic
      const result = await submitWithRetry(payload, 3, 1000);

      if (result.success) {
        if (result.error) {
          alert(
            `Data request submitted successfully!\n\nNote: ${result.error}`,
          );
        } else {
          alert("Data request submitted successfully!");
        }
      } else {
        console.error(
          "Data request submission failed:",
          result.error,
        );

        // Offer fallback options
        const useEmail = confirm(
          `Automatic submission failed: ${result.error}\n\nWould you like to send this request via email instead?`,
        );

        if (useEmail) {
          const emailUrl = generateEmailFallback(
            dataRequestData,
            "Data Request Brief",
          );
          window.location.href = emailUrl;
        }
      }
    } catch (error) {
      console.error("Error submitting data request:", error);

      // Offer email fallback for any error
      const useEmail = confirm(
        `Submission failed due to technical issues.\n\nWould you like to send this request via email instead?`,
      );

      if (useEmail) {
        const emailUrl = generateEmailFallback(
          dataRequestData,
          "Data Request Brief",
        );
        window.location.href = emailUrl;
      }
    }
  };

  const technologyBriefs = [
    {
      title: "Website Content Brief",
      description:
        "This brief is for pages that sit on comicrelief.com. These could be landing pages, sign up pages, Ts&Cs to name a few. If you're briefing content that only requires existing functionality available in our CMS. Use this form.",
      icon: Globe,
      color: "blue",
    },
    {
      title: "Request a Donation Page (CART ID)",
      description:
        "This brief is for donation pages that sit on donation.comicrelief.com. You need these if you want a page that will track income from single donations, regular donations or fundraiser pay ins.",
      icon: CreditCard,
      color: "green",
    },
    {
      title: "Create a UTM or request a Friendly URL",
      description:
        "This page has everything you need to know about building tracking links and requesting FURLS and redirects.",
      icon: Link,
      color: "purple",
    },
    {
      title: "Product Request Brief",
      description:
        "This brief is for briefing new digital products, or changes to existing digital products that require development. For example a new form, adding new functionality to a Fundraiser Sign-Up Journey or UX changes to the donate journey.",
      icon: Zap,
      color: "orange",
    },
    {
      title: "Shop",
      description:
        "The shop is a digital product managed by the product team and so you also need to use the Product Request Brief for this.",
      icon: ShoppingCart,
      color: "pink",
    },
    {
      title: "SMS Donations (Text-to-Donate)",
      description:
        "This brief is for requesting a new or updating an existing Text-to-Donate code. It can take between 3-4 weeks to get a TTD code set-up and tested before it can go live, so please ensure you allow as much time as possible to brief in your requests. If your TTD is linked to any BBC Broadcast activity, timings may increase.",
      icon: Smartphone,
      color: "teal",
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-100 text-blue-600 border-blue-200",
      green: "bg-green-100 text-green-600 border-green-200",
      purple: "bg-purple-100 text-purple-600 border-purple-200",
      orange: "bg-orange-100 text-orange-600 border-orange-200",
      pink: "bg-pink-100 text-pink-600 border-pink-200",
      indigo: "bg-indigo-100 text-indigo-600 border-indigo-200",
      teal: "bg-teal-100 text-teal-600 border-teal-200",
    };
    return (
      colorMap[color as keyof typeof colorMap] || colorMap.blue
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Comic Relief Project Management
            </h1>
            <p className="text-xl text-gray-600">
              Streamlined project setup and management for Comic
              Relief campaigns
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Workflow Image - Using actual uploaded image */}
        <div className="mb-12">
          <div className="w-full bg-white border-2 border-gray-200 rounded-lg p-6">
            <img
              src={workflowImage}
              alt="Comic Relief Project Workflow Diagram - Planning, Briefing, Design & Feedback, Delivery, Report"
              className="w-full h-auto rounded-lg shadow-sm"
              style={{
                maxHeight: "600px",
                objectFit: "contain",
              }}
            />
            <div className="text-center mt-4 text-sm text-gray-600">
              Comic Relief integrated workflow across 5 phases:
              Planning → Briefing → Design & Feedback → Delivery
              → Report
            </div>
          </div>
        </div>

        {/* Form Selection Cards - Now 3 cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Quick Kick-off Form Card */}
          <Card className="hover:shadow-lg transition-shadow border-2 border-green-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Quick Kick-off Form
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Simplified form to get your project started
                    quickly
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-700 font-medium">
                      ⚡ Quick Start
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    Perfect for initial project setup and Jira
                    ticket creation
                  </p>
                </div>
                <Button
                  onClick={() => onNavigate("kickoff")}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  Create Jira Ticket
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Full Production Brief Card */}
          <Card className="hover:shadow-lg transition-shadow border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Full Production Brief
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Complete detailed form for comprehensive
                    project planning
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-700 font-medium">
                      📋 Comprehensive
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    For when you&apos;re ready to get specific
                  </p>
                </div>
                <Button
                  onClick={() => onNavigate("original")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  Start Full Production Brief
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Request Brief Card */}
          <Card className="hover:shadow-lg transition-shadow border-2 border-indigo-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Data Request Brief
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Request reports and data analysis for your
                    project
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-indigo-700 font-medium">
                      📊 Data Focused
                    </span>
                  </div>
                  <p className="text-sm text-indigo-700">
                    For Power BI reports, Google Analytics, and
                    data services
                  </p>
                </div>
                <Button
                  onClick={() => handleDataRequest()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  size="sm"
                >
                  Request Data Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technology Briefing Documents Section - Now with 5 cards */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Technology Briefs
            </h2>
            <div className="max-w-4xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Comic Relief Technology and Data Briefing
              </h3>
              <p className="text-lg text-gray-600 mb-4">
                Here are all of the links to the Technology and
                Data briefs - alongside a short description of
                what you can brief with them. You may find
                yourself having to fill out more than one of
                these briefs for projects that require multiple
                teams.
              </p>
              <p className="text-base text-gray-600 mb-6">
                If you&apos;re not sure what you need you can
                speak to <strong>Aisha Siddiq</strong> or{" "}
                <strong>Matt Hutson</strong> for guidance.
              </p>
            </div>
          </div>

          {/* Technology Brief Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologyBriefs.map((brief, index) => {
              const IconComponent = brief.icon;
              return (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow h-full"
                >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${getColorClasses(brief.color)}`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base leading-tight">
                          {index + 1}. {brief.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {brief.description}
                    </p>
                    {brief.title ===
                      "SMS Donations (Text-to-Donate)" && (
                      <p className="text-sm text-gray-500 mt-3 italic">
                        This process is Product Managed by Aisha
                        Siddiq - so speak to her if you need a
                        new SMS donation journey or have any
                        questions.
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Webhook Tester Card - Moved to bottom */}
        <div className="mb-8">
          <Card className="bg-yellow-50 border-2 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <TestTube2 className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-yellow-800 mb-2">
                    🔧 Webhook Testing Tool
                  </h3>
                  <p className="text-yellow-700 mb-4">
                    Send sample form data to your Zapier webhook
                    for testing and configuration. Perfect for
                    setting up your Jira integration.
                  </p>
                  <Button
                    onClick={() => onNavigate("webhook-tester")}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Open Webhook Tester
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-500">
            Comic Relief Project Management System -
            Streamlining charitable impact through technology
          </p>
        </div>
      </div>
    </div>
  );
}