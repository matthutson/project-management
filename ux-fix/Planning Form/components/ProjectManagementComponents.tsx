import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Loader2, Search, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "./ui/badge";

// Type for Epic data returned from the Zapier webhook
interface Epic {
  key: string;
  summary: string;
  status?: string;
  campaign?: string;
  portfolio?: string;
}

// Props for the EpicSelector component
interface EpicSelectorProps {
  onEpicSelect: (epicKey: string) => void;
  selectedEpicKey?: string;
}

/**
 * Epic Selector Component
 * 
 * Fetches Epics from the Zapier webhook and provides an interface for selecting one
 * Handles fetch errors and provides retry functionality
 */
export function EpicSelector({ onEpicSelect, selectedEpicKey }: EpicSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEpics, setFilteredEpics] = useState<Epic[]>([]);

  // Zapier webhook URL for fetching Epics
  const FETCH_EPICS_URL = "https://hooks.zapier.com/hooks/catch/12809750/uyyghs1/";

  // Function to fetch Epics from the Zapier webhook
  const fetchEpics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Send a POST request to the Epic lookup webhook
      const response = await fetch(FETCH_EPICS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send a simple payload to trigger the webhook
        body: JSON.stringify({ action: "fetch_epics" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse the response JSON
      const data = await response.json();

      // Check if we got a valid array of Epics
      if (Array.isArray(data) && data.length > 0) {
        // Process and deduplicate Epics
        const uniqueEpics = deduplicateEpics(data);
        setEpics(uniqueEpics);
        setFilteredEpics(uniqueEpics);
      } else {
        // If we have no Epics, provide example data for development
        const mockData = getMockEpics();
        setEpics(mockData);
        setFilteredEpics(mockData);
        console.warn("Using mock Epic data for development");
      }
    } catch (err) {
      console.error("Error fetching Epics:", err);
      setError(
        err instanceof Error 
          ? `Error fetching Epics: ${err.message}` 
          : "Failed to fetch Epics from Jira"
      );
      
      // In development, provide mock data for testing
      const mockData = getMockEpics();
      setEpics(mockData);
      setFilteredEpics(mockData);
      console.warn("Using mock Epic data for development due to fetch error");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock Epics for development when API is unavailable
  const getMockEpics = (): Epic[] => {
    return [
      { key: "CR-1234", summary: "Comic Relief Summer Campaign", status: "In Progress", campaign: "CR365", portfolio: "Events and Challenges" },
      { key: "RND-567", summary: "Red Nose Day School Activities", status: "Active", campaign: "RND26", portfolio: "Schools Youth and Community" },
      { key: "SR-890", summary: "Sport Relief Digital Campaign", status: "Planning", campaign: "SR25", portfolio: "Individual and Regular Giving" },
      { key: "CR-2468", summary: "Winter Fundraising Drive", status: "Active", campaign: "CR25 Winter", portfolio: "Partnerships" },
      { key: "RND-1357", summary: "Red Nose Day Corporate Partners", status: "Active", campaign: "RND26", portfolio: "Partnerships" }
    ];
  };

  // Deduplicate Epics by key
  const deduplicateEpics = (epicList: Epic[]): Epic[] => {
    const uniqueKeys = new Set();
    return epicList.filter(epic => {
      if (uniqueKeys.has(epic.key)) return false;
      uniqueKeys.add(epic.key);
      return true;
    });
  };

  // Fetch Epics on component mount
  useEffect(() => {
    fetchEpics();
  }, []);

  // Filter Epics based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredEpics(epics);
      return;
    }

    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = epics.filter(
      epic => 
        epic.key.toLowerCase().includes(lowercasedSearch) || 
        epic.summary.toLowerCase().includes(lowercasedSearch) ||
        (epic.campaign && epic.campaign.toLowerCase().includes(lowercasedSearch)) ||
        (epic.portfolio && epic.portfolio.toLowerCase().includes(lowercasedSearch))
    );
    setFilteredEpics(filtered);
  }, [searchTerm, epics]);

  // Handle Epic selection from dropdown or search
  const handleEpicSelection = (value: string) => {
    onEpicSelect(value);
  };

  // Render Epic selection interface
  return (
    <div className="space-y-4">
      {/* Epic search and refresh */}
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Epic by key or name"
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading || epics.length === 0}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchEpics}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading Epics...</span>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">{error}</p>
              <p className="mt-1">Using mock data for development. In production, please try refreshing or enter the Epic key manually.</p>
            </div>
          </div>
        </div>
      )}

      {/* Epic selector */}
      {!isLoading && (
        <>
          <Select
            value={selectedEpicKey}
            onValueChange={handleEpicSelection}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an Epic" />
            </SelectTrigger>
            <SelectContent>
              {filteredEpics.length > 0 ? (
                filteredEpics.map((epic) => (
                  <SelectItem 
                    key={epic.key} 
                    value={epic.key}
                    className="py-2"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {epic.key}
                        </Badge>
                        <span>{epic.status || "Active"}</span>
                      </div>
                      <span className="text-sm truncate max-w-[500px]">
                        {epic.summary}
                      </span>
                      <div className="text-xs text-muted-foreground mt-1">
                        {epic.campaign && <span className="mr-2">Campaign: {epic.campaign}</span>}
                        {epic.portfolio && <span>Portfolio: {epic.portfolio}</span>}
                      </div>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground">
                  {searchTerm ? "No matching Epics found" : "No Epics available"}
                </div>
              )}
            </SelectContent>
          </Select>

          {/* Manual Epic entry option */}
          {!selectedEpicKey && (
            <div className="text-xs text-muted-foreground italic">
              If you know the Epic key (e.g., PROJ-123), you can search for it above or select it from the dropdown.
            </div>
          )}

          {/* Selected Epic info */}
          {selectedEpicKey && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-center">
                <Badge variant="secondary" className="mr-2">
                  Epic
                </Badge>
                <Badge variant="outline">{selectedEpicKey}</Badge>
              </div>
              <div className="text-sm mt-2">
                {filteredEpics.find(e => e.key === selectedEpicKey)?.summary || 
                  "This Epic will be updated with your form submission"}
              </div>
            </div>
          )}
        </>
      )}

      {/* Manual entry when API fails */}
      {error && (
        <div className="mt-4">
          <label className="text-sm font-medium mb-1 block">
            Enter Epic Key Manually
          </label>
          <Input 
            placeholder="e.g., PROJ-123"
            value={selectedEpicKey || ""}
            onChange={(e) => onEpicSelect(e.target.value)}
            className="mb-2"
          />
          <div className="text-xs text-muted-foreground">
            Enter the Jira Epic key you want to update. Format: PROJECT-NUMBER (e.g., CR-123)
          </div>
        </div>
      )}
    </div>
  );
}

// Export other project management related components here