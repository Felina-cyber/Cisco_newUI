'use client';
import { SellerCase } from '../data/cases';

import { ChevronRight, Filter, Search, Clock, Sparkles, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

export default function Worklist({
  data,
  selectedId,
  onSelect,
  onCaseUpdate,
  onCaseResolve,
  resolvedCases,
  escalatedCases,
  onStartTimeline,
}: {
  data: SellerCase[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onCaseUpdate?: (caseId: string, updatedCase: SellerCase) => void;
  onCaseResolve?: (caseId: string) => void;
  resolvedCases?: Set<string>;
  escalatedCases?: Set<string>;
  onStartTimeline?: (caseId: string) => void;
}) {
  const [routingStates, setRoutingStates] = useState<Record<string, { loading: boolean; result?: any; error?: string }>>({});

  const handleCaseClick = async (caseData: SellerCase) => {
    const caseId = caseData.id;

    // Inform parent about selection immediately (resets placeholder panels)
    if (onSelect) onSelect(caseId);

    if (onStartTimeline) onStartTimeline(caseId);

    setRoutingStates(prev => ({ ...prev, [caseId]: { loading: true } }));

    const invokedUpdate: SellerCase = {
      ...caseData,
      timeline: [
        ...caseData.timeline,
        `Case #${caseId} opened`,
        'Case automation agent invoked'
      ]
    };
    if (onCaseUpdate) onCaseUpdate(caseId, invokedUpdate);

    try {
      const response = await fetch('/api/agents/Case_automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: caseData.query,
          hints: { caseId: caseData.id, seller: caseData.seller }
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Routing failed');

      setRoutingStates(prev => ({ ...prev, [caseId]: { loading: false, result } }));

      // Use the agent from cases.ts instead of API result
      const updatedCase = {
        ...caseData,
        agent: caseData.agent, // Use original agent from cases.ts
        confidence: caseData.confidence, // Use original confidence from cases.ts
        timeline: [
          ...invokedUpdate.timeline,
          `Routed to ${caseData.agent} (${Math.round(caseData.confidence * 100)}% confidence)`
        ]
      };

      if (onCaseUpdate) onCaseUpdate(caseId, updatedCase);

    } catch (error: any) {
      setRoutingStates(prev => ({ ...prev, [caseId]: { loading: false, error: error.message } }));
    }
  };

  const isCaseResolved = (caseId: string) => resolvedCases?.has(caseId) || false;

  return (
    <aside className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 h-[calc(100vh-9rem)] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-cisco-navy to-cisco-blue rounded-t-2xl px-6 py-4 shadow-md flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white tracking-tight">Worklist</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition">
              <Search className="h-4 w-4 text-white" />
            </button>
            <button className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition">
              <Filter className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/80 text-sm">
          <Clock className="h-4 w-4" />
          <span>{data.length} Active Cases</span>
        </div>
      </div>

      {/* Case list */}
      <div className="overflow-y-auto p-4 space-y-4 flex-grow">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cisco-sky/20 to-cisco-blue/20 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-cisco-blue animate-pulse" />
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-2">Loading Cases...</p>
            
          </div>
        ) : (
          data.map((c) => {
            const routingState = routingStates[c.id];
            const resolved = isCaseResolved(c.id);

            return (
              <button
                key={c.id}
                onClick={() => !resolved && handleCaseClick(c)}
                disabled={resolved}
                className={clsx(
                  'w-full text-left rounded-2xl p-5 transition-all duration-200 border group transform hover:scale-[1.01]',
                  resolved && 'opacity-50 cursor-not-allowed',
                  resolved 
                    ? 'bg-gradient-to-r from-cisco-sky/10 to-cisco-blue/5 border-cisco-blue shadow-md' 
                    : selectedId === c.id 
                      ? 'bg-gradient-to-r from-cisco-sky/20 to-cisco-blue/10 border-cisco-blue shadow-md' 
                      : 'bg-white border-gray-200 hover:border-cisco-sky hover:shadow-md'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-base font-bold text-gray-900">Case #{c.id}</p>
                      <div className="w-2 h-2 rounded-full bg-cisco-green animate-pulse"></div>

                      {resolved ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cisco-navy text-white text-xs font-medium">Resolved</span>
                      ) : escalatedCases?.has(c.id) ? (
                        // Show "Not Resolved" for escalated cases
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cisco-navy text-center text-white text-xs font-medium">Not Resolved</span>
                      ) : (c as any).followUp && (c as any).followUp.isNew ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-medium">New comment</span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cisco-blue text-white text-xs font-medium">New</span>
                      )}


                    </div>

                    <p className="text-sm font-medium text-cisco-blue mb-1">{c.seller}</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{c.query}</p>

                    <div className="mt-3 flex items-center justify-between">
                      
                      <div className="text-xs text-gray-500">{new Date().toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className={clsx(
                    'p-2 rounded-xl transition',
                    resolved
                      ? 'bg-cisco-sky/10 text-cisco-navy'
                      : selectedId === c.id 
                        ? 'bg-cisco-sky/30 text-cisco-blue'
                        : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'
                  )}>
                    {resolved ? <CheckCircle className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
