export function WorkflowDiagram() {
  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        
        {/* Phase 1 - Planning */}
        <div className="flex-1 bg-purple-100 border-2 border-purple-200 rounded-lg p-4 min-h-[120px] flex flex-col justify-between">
          <div>
            <div className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block">
              Phase 1
            </div>
            <h3 className="font-bold text-purple-800 mb-2">Planning</h3>
            <div className="text-sm text-purple-700 space-y-1">
              <div>• Brief Development</div>
              <div>• Scoping</div>
              <div>• Planning</div>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center text-gray-400 text-2xl lg:rotate-0 rotate-90">
          →
        </div>

        {/* Phase 2 - Briefing */}
        <div className="flex-1 bg-blue-100 border-2 border-blue-200 rounded-lg p-4 min-h-[120px] flex flex-col justify-between">
          <div>
            <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block">
              Phase 2
            </div>
            <h3 className="font-bold text-blue-800 mb-2">Briefing</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• Requirements</div>
              <div>• Resource Planning</div>
              <div>• Timeline Setup</div>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center text-gray-400 text-2xl lg:rotate-0 rotate-90">
          →
        </div>

        {/* Phase 3 - Design & Feedback */}
        <div className="flex-1 bg-green-100 border-2 border-green-200 rounded-lg p-4 min-h-[120px] flex flex-col justify-between">
          <div>
            <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block">
              Phase 3
            </div>
            <h3 className="font-bold text-green-800 mb-2">Design & Feedback</h3>
            <div className="text-sm text-green-700 space-y-1">
              <div>• Asset Creation</div>
              <div>• Reviews</div>
              <div>• Iterations</div>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center text-gray-400 text-2xl lg:rotate-0 rotate-90">
          →
        </div>

        {/* Phase 4 - Direct Delivery */}
        <div className="flex-1 bg-orange-100 border-2 border-orange-200 rounded-lg p-4 min-h-[120px] flex flex-col justify-between">
          <div>
            <div className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block">
              Phase 4
            </div>
            <h3 className="font-bold text-orange-800 mb-2">Direct Delivery</h3>
            <div className="text-sm text-orange-700 space-y-1">
              <div>• Production</div>
              <div>• Deployment</div>
              <div>• Launch</div>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center text-gray-400 text-2xl lg:rotate-0 rotate-90">
          →
        </div>

        {/* Phase 5 - Report */}
        <div className="flex-1 bg-pink-100 border-2 border-pink-200 rounded-lg p-4 min-h-[120px] flex flex-col justify-between">
          <div>
            <div className="bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block">
              Phase 5
            </div>
            <h3 className="font-bold text-pink-800 mb-2">Report</h3>
            <div className="text-sm text-pink-700 space-y-1">
              <div>• Analytics</div>
              <div>• Performance</div>
              <div>• Insights</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Caption */}
      <div className="text-center mt-6 text-sm text-gray-600 font-medium">
        Comic Relief Project Management Workflow: Planning → Briefing → Design & Feedback → Direct Delivery → Report
      </div>
    </div>
  );
}