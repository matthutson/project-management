// Basic webhook debugging utilities

export interface DebugTest {
  name: string;
  description: string;
  test: () => Promise<{ success: boolean; message: string; details?: any }>;
}

// Test the webhook URLs directly
export const createWebhookDebugTests = (): DebugTest[] => {
  const MAIN_WEBHOOK = 'https://hooks.zapier.com/hooks/catch/12809750/2vn5sae/';
  const FETCH_WEBHOOK = 'https://hooks.zapier.com/hooks/catch/12809750/2vv4jp1/';

  return [
    {
      name: "Network Connectivity",
      description: "Test basic internet connectivity",
      test: async () => {
        try {
          const response = await fetch('https://httpbin.org/get', { 
            method: 'GET',
            mode: 'cors'
          });
          
          if (response.ok) {
            return {
              success: true,
              message: "✅ Internet connection working",
              details: { status: response.status }
            };
          } else {
            return {
              success: false,
              message: "❌ Internet connection issues",
              details: { status: response.status }
            };
          }
        } catch (error) {
          return {
            success: false,
            message: "❌ No internet connectivity",
            details: { error: (error as Error).message }
          };
        }
      }
    },

    {
      name: "Zapier Webhook Reachability",
      description: "Test if Zapier webhook URL is reachable",
      test: async () => {
        try {
          // Use a simple HEAD request to test reachability
          const response = await fetch(MAIN_WEBHOOK, {
            method: 'HEAD',
            mode: 'no-cors'
          });
          
          return {
            success: true,
            message: "✅ Zapier webhook URL is reachable",
            details: { url: MAIN_WEBHOOK }
          };
        } catch (error) {
          return {
            success: false,
            message: "❌ Cannot reach Zapier webhook",
            details: { 
              url: MAIN_WEBHOOK,
              error: (error as Error).message 
            }
          };
        }
      }
    },

    {
      name: "Simple JSON POST",
      description: "Send minimal JSON data to webhook",
      test: async () => {
        try {
          const testData = {
            test: true,
            timestamp: new Date().toISOString(),
            debugMessage: "Basic webhook test"
          };

          const response = await fetch(MAIN_WEBHOOK, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            mode: 'no-cors',
            body: JSON.stringify(testData)
          });

          return {
            success: true,
            message: "✅ JSON POST sent (no-cors mode)",
            details: { 
              data: testData,
              note: "Cannot verify if Zapier received it due to CORS"
            }
          };
        } catch (error) {
          return {
            success: false,
            message: "❌ Failed to send JSON POST",
            details: { error: (error as Error).message }
          };
        }
      }
    },

    {
      name: "CORS Test",
      description: "Test if CORS is blocking requests",
      test: async () => {
        try {
          const testData = { test: true, cors_test: true };

          const response = await fetch(MAIN_WEBHOOK, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            mode: 'cors', // This will fail if CORS is not allowed
            body: JSON.stringify(testData)
          });

          if (response.ok) {
            return {
              success: true,
              message: "✅ CORS allowed - webhook accepts requests",
              details: { status: response.status }
            };
          } else {
            return {
              success: false,
              message: "⚠️ CORS blocked but webhook reachable",
              details: { status: response.status }
            };
          }
        } catch (error) {
          return {
            success: false,
            message: "⚠️ CORS blocked (normal for webhooks)",
            details: { 
              error: (error as Error).message,
              note: "This is normal - webhooks typically block CORS"
            }
          };
        }
      }
    },

    {
      name: "Form-like Data Test",
      description: "Send data that mimics form submission",
      test: async () => {
        try {
          const formData = {
            yourName: "Debug Test User",
            projectName: "Webhook Debug Test",
            campaign: "debug_test",
            portfolio: "test_portfolio",
            testMode: true,
            debugTimestamp: new Date().toISOString(),
            submissionId: `debug_${Date.now()}`
          };

          await fetch(MAIN_WEBHOOK, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            mode: 'no-cors',
            body: JSON.stringify(formData)
          });

          return {
            success: true,
            message: "✅ Form-like data sent to webhook",
            details: { 
              data: formData,
              note: "Check Zapier dashboard for this record"
            }
          };
        } catch (error) {
          return {
            success: false,
            message: "❌ Failed to send form data",
            details: { error: (error as Error).message }
          };
        }
      }
    },

    {
      name: "Epic Fetch Webhook Test",
      description: "Test Epic fetching webhook",
      test: async () => {
        try {
          const response = await fetch(FETCH_WEBHOOK, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (response.ok) {
            const data = await response.text();
            return {
              success: true,
              message: "✅ Epic fetch webhook responded",
              details: { 
                status: response.status,
                dataLength: data.length,
                preview: data.substring(0, 200)
              }
            };
          } else {
            return {
              success: false,
              message: "❌ Epic fetch webhook error",
              details: { status: response.status }
            };
          }
        } catch (error) {
          return {
            success: false,
            message: "❌ Cannot reach Epic fetch webhook",
            details: { 
              url: FETCH_WEBHOOK,
              error: (error as Error).message 
            }
          };
        }
      }
    }
  ];
};

// URL validation helper
export const validateWebhookUrl = (url: string): { valid: boolean; message: string } => {
  try {
    const parsedUrl = new URL(url);
    
    if (parsedUrl.protocol !== 'https:') {
      return { valid: false, message: "Webhook URL must use HTTPS" };
    }
    
    if (!parsedUrl.hostname.includes('zapier.com')) {
      return { valid: false, message: "URL doesn't appear to be a Zapier webhook" };
    }
    
    if (!parsedUrl.pathname.includes('/hooks/catch/')) {
      return { valid: false, message: "URL doesn't match Zapier webhook format" };
    }
    
    return { valid: true, message: "Webhook URL format looks correct" };
  } catch (error) {
    return { valid: false, message: "Invalid URL format" };
  }
};

// Check browser capabilities
export const checkBrowserCapabilities = () => {
  const capabilities = {
    fetch: typeof fetch !== 'undefined',
    json: typeof JSON !== 'undefined',
    Promise: typeof Promise !== 'undefined',
    cors: true, // Assume CORS is supported in modern browsers
    clipboard: navigator.clipboard !== undefined,
    online: navigator.onLine
  };

  const issues = [];
  if (!capabilities.fetch) issues.push("Fetch API not supported");
  if (!capabilities.json) issues.push("JSON not supported");
  if (!capabilities.Promise) issues.push("Promises not supported");
  if (!capabilities.online) issues.push("Browser reports offline");

  return {
    capabilities,
    issues,
    allGood: issues.length === 0
  };
};