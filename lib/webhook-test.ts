// Simple Webhook Testing - Back to Working Version from 15:25

const WEBHOOK_CONFIG = {
  mainWebhookUrl: 'https://hooks.zapier.com/hooks/catch/12809750/2vn5sae/',
  fetchWebhookUrl: 'https://hooks.zapier.com/hooks/catch/12809750/2vv4jp1/',
};

export async function testWebhookConnectivity(): Promise<boolean> {
  try {
    console.log('Testing webhook connectivity...');
    
    const testPayload = {
      test: true,
      timestamp: new Date().toISOString(),
      message: "Connectivity test"
    };

    await fetch(WEBHOOK_CONFIG.mainWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors',
      body: JSON.stringify(testPayload)
    });

    console.log('Webhook connectivity test: SUCCESS');
    return true;
  } catch (error) {
    console.error('Webhook connectivity test: FAILED', error);
    return false;
  }
}

export async function submitWithRetry(
  payload: any, 
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<{ success: boolean; error?: string; data?: any }> {
  
  console.log('Sending data to Zapier...');
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Submission attempt ${attempt}/${maxRetries}`);
      
      await fetch(WEBHOOK_CONFIG.mainWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(payload)
      });

      console.log('Submission successful');
      return { 
        success: true, 
        data: { 
          status: 'sent',
          message: 'Data sent to Zapier successfully'
        }
      };

    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        return { 
          success: false, 
          error: `Failed after ${maxRetries} attempts: ${(error as Error).message}` 
        };
      }
    }
    
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return { success: false, error: 'Unexpected error' };
}

export async function copyToClipboardWithFallback(text: string, label: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.warn('Clipboard failed, showing manual copy');
    showTextForManualCopy(text, label);
    return false;
  }
}

function showTextForManualCopy(text: string, label: string): void {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.7); z-index: 10000; display: flex;
    align-items: center; justify-content: center;
  `;
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    background: white; padding: 20px; border-radius: 8px; max-width: 90%; max-height: 80%;
    overflow: auto; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;
  
  const title = document.createElement('h3');
  title.textContent = `Copy ${label} Data`;
  title.style.marginBottom = '15px';
  
  const instructions = document.createElement('p');
  instructions.textContent = 'Select all text below and copy it (Ctrl+A, then Ctrl+C):';
  instructions.style.marginBottom = '10px';
  
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.cssText = 'width: 100%; height: 300px; font-family: monospace; font-size: 12px;';
  textArea.readOnly = true;
  
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.cssText = 'margin-top: 10px; padding: 10px 20px; background: #007cba; color: white; border: none; border-radius: 4px;';
  closeButton.onclick = () => document.body.removeChild(overlay);
  
  modal.appendChild(title);
  modal.appendChild(instructions);
  modal.appendChild(textArea);
  modal.appendChild(closeButton);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  textArea.focus();
  textArea.select();
}

export function generateEmailFallback(formData: any, formType: string): string {
  const subject = encodeURIComponent(`Manual Submission: ${formType} - ${formData.projectName || formData.yourName}`);
  const body = encodeURIComponent(`Hi Team,

I need to submit a ${formType} manually.

Name: ${formData.yourName}
Project: ${formData.projectName || 'Not specified'}
Campaign: ${formData.campaign || 'Not specified'}

Please process this submission manually.

Thanks!`);
  
  return `mailto:projectmanagement@comicrelief.com?subject=${subject}&body=${body}`;
}

export function generateFormDataSummary(formData: any, formType: string): string {
  return `${formType.toUpperCase()} SUBMISSION
Generated: ${new Date().toLocaleString()}

Name: ${formData.yourName || 'Not provided'}
Project: ${formData.projectName || 'Not provided'}
Campaign: ${formData.campaign || 'Not provided'}
Portfolio: ${formData.portfolio || 'Not provided'}

${formData.projectOverview ? `Overview: ${formData.projectOverview}` : ''}
${formData.budgetAmount ? `Budget: ${formData.budgetAmount}` : ''}

END OF SUBMISSION`;
}

export async function runNetworkDiagnostics(): Promise<{
  online: boolean;
  zapierReachable: boolean;
  corsIssues: boolean;
  recommendations: string[];
}> {
  const results = {
    online: navigator.onLine,
    zapierReachable: false,
    corsIssues: true,
    recommendations: [] as string[]
  };

  try {
    await fetch(WEBHOOK_CONFIG.mainWebhookUrl, {
      method: 'HEAD',
      mode: 'no-cors'
    });
    results.zapierReachable = true;
  } catch (error) {
    // Webhook not reachable
  }

  if (!results.online) {
    results.recommendations.push('Check your internet connection');
  }
  
  if (!results.zapierReachable) {
    results.recommendations.push('Verify webhook URL in Zapier dashboard');
  } else {
    results.recommendations.push('Webhook appears reachable');
  }
  
  results.recommendations.push('CORS restrictions are normal for webhooks');

  return results;
}

export const getWebhookConfig = () => ({
  mainUrl: WEBHOOK_CONFIG.mainWebhookUrl,
  fetchUrl: WEBHOOK_CONFIG.fetchWebhookUrl
});