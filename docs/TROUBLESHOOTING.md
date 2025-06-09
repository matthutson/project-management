# Troubleshooting Guide

## Common Issues and Solutions

### "Failed to fetch" Error

If you're encountering "Failed to fetch" errors when submitting forms, try these solutions:

#### 1. Check Network Connection
- Ensure you have a stable internet connection
- Try refreshing the page and submitting again

#### 2. Browser-Related Issues
- **Clear Browser Cache**: Clear your browser's cache and cookies
- **Disable Extensions**: Try disabling browser extensions temporarily
- **Try Incognito/Private Mode**: Test the form in an incognito window
- **Try Different Browser**: Test with Chrome, Firefox, or Safari

#### 3. Security/Firewall Issues
- **Corporate Firewall**: If using on a corporate network, the firewall may block external webhooks
- **VPN Issues**: Try disconnecting from VPN temporarily
- **Antivirus Software**: Some antivirus software may block requests

#### 4. Zapier Webhook Status
- The webhook URL might be temporarily unavailable
- Check with your system administrator if the issue persists

### Development/Testing Solutions

If you're a developer experiencing this issue:

#### 1. CORS Configuration
The application already includes proper CORS settings:
```javascript
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  mode: 'cors', // Explicit CORS mode
  body: JSON.stringify(payload)
});
```

#### 2. Error Handling
The application now includes comprehensive error handling:
- Network connectivity detection
- Specific error messages for different failure types
- Console logging for debugging

#### 3. Testing the Webhook
You can test the webhook manually:
```bash
curl -X POST https://hooks.zapier.com/hooks/catch/12809750/2vn5sae/ \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Form-Specific Issues

#### Full Production Brief
- Ensure all required fields (particularly "Your Name") are filled
- Large form data may cause timeout issues - try with minimal data first

#### Quick Kick-off Form
- Project documentation field is large - ensure browser has sufficient memory
- Try reducing the size of the project documentation if issues persist

#### Data Request Brief
- Simple prompt-based form - if failing, try with shorter responses

### Browser Console Debugging

Open browser developer tools (F12) and check the Console tab for detailed error messages:

1. **Network Tab**: Check if the request is being sent
2. **Console Tab**: Look for specific error messages
3. **Application Tab**: Check if there are any service worker issues

### Contact Support

If the issue persists after trying these solutions:

1. Note the exact error message
2. Include browser and operating system information
3. Describe the steps that led to the error
4. Contact your system administrator or development team

### Known Limitations

- Zapier webhook may have rate limits
- Very large form submissions may timeout
- Some corporate networks block external webhooks by default

The application includes comprehensive error handling and will display user-friendly error messages when issues occur.