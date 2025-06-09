import { useState } from "react";
import { Button } from "./components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LandingPage } from "./components/LandingPage";
import { ComicReliefForm } from "./components/ComicReliefForm";
import { ComicReliefKickOffForm } from "./components/ComicReliefKickOffForm";
import { WebhookTester } from "./components/WebhookTester";

type Page = 'landing' | 'original' | 'kickoff' | 'webhook-tester';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const renderBackButton = () => {
    if (currentPage === 'landing') return null;
    
    return (
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => setCurrentPage('landing')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Forms
        </Button>
      </div>
    );
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      
      case 'original':
        return (
          <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 md:px-8">
            <div className="max-w-4xl mx-auto">
              {renderBackButton()}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <ComicReliefForm />
              </div>
            </div>
          </div>
        );
      
      case 'kickoff':
        return (
          <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 md:px-8">
            <div className="max-w-4xl mx-auto">
              {renderBackButton()}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <ComicReliefKickOffForm />
              </div>
            </div>
          </div>
        );
      
      case 'webhook-tester':
        return (
          <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 md:px-8">
            {renderBackButton()}
            <WebhookTester />
          </div>
        );
      
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return renderCurrentPage();
}