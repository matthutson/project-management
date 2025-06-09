// Jira Epic Service - Enhanced for Epic Update Workflow

export interface JiraEpic {
  key: string;
  id: string;
  summary: string;
  status: string;
  created: string;
  updated: string;
  assignee?: string;
  reporter?: string;
  description?: string;
}

export interface EpicOperationRequest {
  operation: 'create' | 'update';
  epicKey?: string;
  formData: any;
  formType: string;
}

const JIRA_CONFIG = {
  // NEW: Zapier Table webhook for fetching epics
  fetchEpicsEndpoint: 'https://hooks.zapier.com/hooks/catch/12809750/uyyghs1/',
  // Keep the same operations endpoint for submissions
  operationsEndpoint: 'https://hooks.zapier.com/hooks/catch/12809750/2vn5sae/',
};

function parseZapierTableData(zapierTableRecord: any): JiraEpic {
  // Parse the Zapier table format you provided:
  // Field 1: ? (not specified)
  // Field 2: Epic Key (e.g., "CRB-22")
  // Field 3: Email (e.g., "m.hutson@comicrelief.com") 
  // Field 4: Status (e.g., "To Do")
  // Field 5: Timestamp (e.g., "2025-06-06T16:41:33.790+0100")

  const extractField = (fieldName: string, fallback = ''): any => {
    // Try various possible field name formats from Zapier table
    const variations = [
      fieldName,
      `Field ${fieldName}`,
      `field_${fieldName}`,
      fieldName.toLowerCase(),
      `data_${fieldName}`,
      `${fieldName}_value`
    ];
    
    for (const variation of variations) {
      if (zapierTableRecord[variation] !== undefined && zapierTableRecord[variation] !== '') {
        return zapierTableRecord[variation];
      }
    }
    return fallback;
  };

  // Extract fields based on your format
  const epicKey = extractField('Field 2') || extractField('2') || 'UNKNOWN';
  const email = extractField('Field 3') || extractField('3') || '';
  const status = extractField('Field 4') || extractField('4') || 'Unknown';
  const timestamp = extractField('Field 5') || extractField('5') || new Date().toISOString();
  const recordId = extractField('Record ID') || extractField('record_id') || `epic_${Date.now()}`;
  
  // Extract reporter from email
  const reporter = email ? email.split('@')[0].replace('.', ' ') : undefined;
  
  return {
    key: String(epicKey),
    id: String(recordId),
    summary: `Epic ${epicKey}`, // We can enhance this later if you add more fields
    status: String(status),
    created: String(timestamp),
    updated: String(extractField('Data Edited At') || extractField('data_edited_at') || timestamp),
    assignee: undefined, // Not in current table format
    reporter: reporter,
    description: `Epic ${epicKey} from Zapier table`
  };
}

export async function fetchJiraEpics(): Promise<JiraEpic[]> {
  try {
    console.log('Fetching Jira Epics from Zapier table...');
    
    const response = await fetch(JIRA_CONFIG.fetchEpicsEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Epic fetch from Zapier table failed, using mock data');
      return getMockEpics();
    }

    const data = await response.json();
    console.log('Raw Zapier table data:', data);
    
    let epicsArray: any[] = [];
    
    // Handle different possible response formats from Zapier table
    if (Array.isArray(data)) {
      epicsArray = data;
    } else if (data.results && Array.isArray(data.results)) {
      epicsArray = data.results;
    } else if (data.data && Array.isArray(data.data)) {
      epicsArray = data.data;
    } else if (data.records && Array.isArray(data.records)) {
      epicsArray = data.records;
    } else if (typeof data === 'object' && data !== null) {
      // Single record
      epicsArray = [data];
    } else {
      console.warn('Unexpected Zapier table format, using mock data');
      return getMockEpics();
    }
    
    if (epicsArray.length === 0) {
      console.warn('No epics in Zapier table, using mock data');
      return getMockEpics();
    }
    
    const mappedEpics = epicsArray.map((rawRecord: any) => {
      try {
        return parseZapierTableData(rawRecord);
      } catch (error) {
        console.warn('Failed to parse Zapier table record:', error);
        return null;
      }
    }).filter(Boolean) as JiraEpic[];
    
    const validEpics = mappedEpics.filter(epic => 
      epic.key !== 'UNKNOWN' && epic.key && epic.key.trim() !== ''
    );
    
    if (validEpics.length === 0) {
      console.warn('No valid epics found in Zapier table, using mock data');
      return getMockEpics();
    }
    
    console.log(`Successfully parsed ${validEpics.length} epics from Zapier table`);
    return sortEpicsByDate(validEpics);
    
  } catch (error) {
    console.error('Error fetching Epics from Zapier table:', error);
    return getMockEpics();
  }
}

function getMockEpics(): JiraEpic[] {
  return [
    {
      key: 'CRB-22',
      id: '01JX32HD7F5WCYNVMD341JHEP3',
      summary: 'Matt Hutson Epic',
      status: 'To Do',
      created: '2025-06-06T16:41:33.790+0100',
      updated: '2025-06-06T16:52:42.350236Z',
      assignee: undefined,
      reporter: 'm hutson',
      description: 'Epic CRB-22 from Zapier table'
    },
    {
      key: 'CRB-11',
      id: '10001',
      summary: 'Billy Challenge',
      status: 'To Do',
      created: '2025-05-16T14:28:14.433+0100',
      updated: '2025-05-16T14:28:14.532+0100',
      assignee: undefined,
      reporter: 'Matt Hutson',
      description: 'Epic CRB-11 from Zapier table'
    },
    {
      key: 'CRB-12',
      id: '10002',
      summary: 'Sports Relief 2025 Community Outreach',
      status: 'In Progress',
      created: '2024-01-10T09:00:00.000Z',
      updated: '2024-01-18T16:45:00.000Z',
      assignee: 'Mike Chen',
      reporter: 'Emma Thompson',
      description: 'Epic CRB-12 for SR25 community engagement initiatives'
    },
    {
      key: 'CRB-13',
      id: '10003',
      summary: 'Comic Relief Winter Campaign 2025',
      status: 'Done',
      created: '2024-01-05T11:30:00.000Z',
      updated: '2024-01-12T13:20:00.000Z',
      assignee: 'Lisa Wilson',
      reporter: 'David Brown',
      description: 'Epic CRB-13 winter campaign planning and execution'
    }
  ];
}

export async function submitEpicOperation(request: EpicOperationRequest): Promise<{success: boolean; error?: string; data?: any}> {
  try {
    console.log(`Submitting Epic ${request.operation}...`);
    
    const { mapFormDataToJira } = await import('./jira-field-mapping');
    const mappedData = mapFormDataToJira(request.formData, request.formType);
    
    // Enhanced payload with clear Epic update fields for Zapier workflow
    const payload = {
      // 🎯 KEY FIELDS FOR ZAPIER EPIC UPDATE WORKFLOW
      operation: request.operation, // "create" or "update"
      epicKey: request.epicKey, // The selected Epic (e.g., "CRB-22")
      selectedEpicKey: request.epicKey, // Alternative field name for clarity
      isEpicUpdate: request.operation === 'update', // Boolean for easy Zapier filtering
      targetEpic: request.epicKey, // Another clear field name for the target Epic
      
      // All the individual form fields (working from 15:25)
      ...mappedData,
      
      // Metadata
      submissionTimestamp: new Date().toISOString(),
      formType: request.formType,
      
      // 🔄 ZAPIER WORKFLOW ROUTING FIELDS
      workflowType: request.operation === 'update' ? 'EPIC_UPDATE' : 'EPIC_CREATE',
      shouldMergeWithExisting: request.operation === 'update',
      epicToUpdate: request.epicKey // Yet another clear field for the Epic to update
    };

    console.log('🎯 Sending Epic operation to Zapier with clear routing fields:', {
      operation: payload.operation,
      epicKey: payload.epicKey,
      isEpicUpdate: payload.isEpicUpdate,
      workflowType: payload.workflowType
    });

    await fetch(JIRA_CONFIG.operationsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors',
      body: JSON.stringify(payload)
    });

    console.log(`✅ Epic ${request.operation} sent successfully to Zapier`);
    
    return { 
      success: true, 
      data: {
        operation: request.operation,
        epicKey: request.epicKey,
        status: 'sent',
        workflowType: payload.workflowType
      }
    };

  } catch (error) {
    console.error(`❌ Epic ${request.operation} failed:`, error);
    return { 
      success: false, 
      error: `Epic ${request.operation} failed: ${(error as Error).message}` 
    };
  }
}

export async function testEpicFetchConnectivity(): Promise<boolean> {
  try {
    await fetch(JIRA_CONFIG.fetchEpicsEndpoint, {
      method: 'HEAD',
      mode: 'no-cors'
    });
    return true;
  } catch (error) {
    return false;
  }
}

export function validateEpicSelection(epicKey: string, availableEpics: JiraEpic[]): boolean {
  return availableEpics.some(epic => epic.key === epicKey);
}

// FIXED: Smart formatting to avoid duplicate Epic keys
export function formatEpicForDropdown(epic: JiraEpic): { value: string; label: string } {
  const truncatedSummary = epic.summary.length > 50 
    ? epic.summary.substring(0, 47) + '...' 
    : epic.summary;
  
  // Check if summary already starts with the Epic key to avoid duplication
  const summaryAlreadyIncludesKey = epic.summary.toLowerCase().startsWith(epic.key.toLowerCase());
  
  const displayText = summaryAlreadyIncludesKey 
    ? `${truncatedSummary} (${epic.status})`  // Don't add key if already in summary
    : `${epic.key} - ${truncatedSummary} (${epic.status})`;  // Add key if not in summary
  
  return {
    value: epic.key,
    label: displayText
  };
}

export function getEpicByKey(epicKey: string, epics: JiraEpic[]): JiraEpic | undefined {
  return epics.find(epic => epic.key === epicKey);
}

export function sortEpicsByDate(epics: JiraEpic[]): JiraEpic[] {
  return [...epics].sort((a, b) => {
    const dateA = new Date(a.updated);
    const dateB = new Date(b.updated);
    return dateB.getTime() - dateA.getTime();
  });
}

export const getConfig = () => ({
  fetchEndpoint: JIRA_CONFIG.fetchEpicsEndpoint,
  operationsEndpoint: JIRA_CONFIG.operationsEndpoint
});