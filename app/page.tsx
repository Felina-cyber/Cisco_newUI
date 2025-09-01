'use client';
import { useMemo, useState, useEffect, useRef } from 'react';
import { cases, SellerCase } from '../data/cases';
import Worklist from '../components/Worklist';
import CaseDetail from '../components/CaseDetail';
import AgentInsights from '../components/AgentInsights';
import InteractiveTimeline from '../components/InteractiveTimeline';

export default function Page() {
  const [updatedCases, setUpdatedCases] = useState<Record<string, SellerCase>>({});
  const [resolvedCases, setResolvedCases] = useState<Set<string>>(new Set());
  const [timelineStep, setTimelineStep] = useState<string>('');
  const [activeTimelineCase, setActiveTimelineCase] = useState<string>('');
  const [responseShown, setResponseShown] = useState<boolean>(false);

  // Selected case id (empty on load)
  const [selectedId, setSelectedId] = useState<string>('');
  const [showWorklistCases, setShowWorklistCases] = useState<boolean>(false);
  const [showPlaceholderPanels, setShowPlaceholderPanels] = useState<boolean>(false);
  const [visibleCaseCount, setVisibleCaseCount] = useState<number>(0);
  const [escalatedCases, setEscalatedCases] = useState<Set<string>>(new Set());
  const resolveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sort cases: active cases first (by priority), then resolved cases (by priority)
  const availableCases = useMemo(() => {
    const sortedCases = [...cases].sort((a, b) => a.priority - b.priority);
    
    // Separate active and resolved cases
    const activeCases = sortedCases.filter(c => !resolvedCases.has(c.id));
    const resolvedCasesList = sortedCases.filter(c => resolvedCases.has(c.id));
    
    // Only show the first N active cases based on visibleCaseCount, plus all resolved cases
    const visibleActiveCases = activeCases.slice(0, visibleCaseCount);
    
    // Return visible active cases first, then resolved cases
    return [...visibleActiveCases, ...resolvedCasesList];
  }, [resolvedCases, visibleCaseCount]);

  const current: SellerCase | undefined = useMemo(() => {
    const baseCase = cases.find((c) => c.id === selectedId);
    if (!baseCase) return undefined;
  
    return updatedCases[selectedId] || baseCase;
  }, [selectedId, updatedCases]);
  
  const handleCaseSelect = (caseId: string) => {
    // Cancel any pending timer from a previous resolve flow
    if (resolveTimerRef.current) {
      clearTimeout(resolveTimerRef.current);
      resolveTimerRef.current = null;
    }
    setSelectedId(caseId);
    setTimelineStep('');
    setActiveTimelineCase('');
    setResponseShown(false);
    setShowPlaceholderPanels(false);
  };

  const handleCaseUpdate = (caseId: string, updatedCase: SellerCase) => {
    setUpdatedCases((prev) => ({ ...prev, [caseId]: updatedCase }));
  };

  const handleCaseResolve = (caseId: string) => {
    setResolvedCases((prev) => new Set([...prev, caseId]));
    
    // Show placeholder panels immediately while keeping worklist unchanged
    setShowPlaceholderPanels(true);
    setTimelineStep('');
    setActiveTimelineCase('');
    setResponseShown(false);
    
    // Clear any previous timers before starting a new one
    if (resolveTimerRef.current) {
      clearTimeout(resolveTimerRef.current);
      resolveTimerRef.current = null;
    }

    // If Seller C has a follow-up, flag it as new so it surfaces again
    if (caseId === '287423') {
      console.log('Setting Seller C follow-up as new');
      setUpdatedCases((prev) => {
        const existing = prev[caseId] || cases.find((c) => c.id === caseId);
        if (!existing) return prev;
        const clone: any = { ...existing };
        if (clone.followUp) {
          clone.followUp = { ...clone.followUp, isNew: true };
          console.log('Follow-up flagged as new:', clone.followUp);
        }
        return { ...prev, [caseId]: clone } as Record<string, SellerCase>;
      });
    }

    // After 3 seconds, handle follow-up or next case
    resolveTimerRef.current = setTimeout(() => {
      // Check if this was Seller C's first query being resolved
      if (caseId === '287423') {
        console.log('Seller C first query resolved - triggering follow-up');
        // This is Seller C's first query - trigger the follow-up
        setSelectedId('287423'); // Keep Seller C selected
        setShowPlaceholderPanels(false);
        
        // Start the timeline for the follow-up automatically
        setTimeout(() => {
          console.log('Starting follow-up timeline');
          setActiveTimelineCase('287423');
          setTimelineStep('seller-query');
          setResponseShown(false);
        }, 500);
      } else {
        // For other cases, show the next case in worklist but don't auto-select it
        const sortedCases = [...cases].sort((a, b) => a.priority - b.priority);
        const currentIndex = sortedCases.findIndex(c => c.id === caseId);
        const nextCase = sortedCases[currentIndex + 1];
        if (nextCase && !resolvedCases.has(nextCase.id)) {
          setVisibleCaseCount(prev => prev + 1); // Show the next case in worklist
          setShowPlaceholderPanels(true); // Keep panels empty until user clicks
          setSelectedId(''); // Clear selection
        } else {
          // No more active cases, keep placeholder panels visible
          setShowPlaceholderPanels(true);
          setSelectedId('');
        }
      }
      resolveTimerRef.current = null;
    }, 3000);
  };

  const handleTimelineStepComplete = (step: string) => {
    if (step === 'agent-response') {
      setTimeout(() => setTimelineStep('agent-selection'), 1000);
    }
    if (step === 'sent') {
      setTimelineStep('sent');

      // Seller C follow-up flow: after sending the first response,
      // surface the follow-up question after 3 seconds (only if follow-up hasn't been shown yet)
      const currentCaseId = current?.id;
      if (currentCaseId === '287423' && !(current as any)?.followUp?.isNew) {
        // This is the first query being sent, mark follow-up as new
        setUpdatedCases((prev) => {
          const existing = prev[currentCaseId!] || cases.find((c) => c.id === currentCaseId);
          if (!existing) return prev;
          const clone: any = { ...existing };
          if (clone.followUp) {
            clone.followUp = { ...clone.followUp, isNew: true };
          }
          return { ...prev, [currentCaseId!]: clone } as Record<string, SellerCase>;
        });

        // restart the timeline from seller-query to append the follow-up
        setTimeout(() => {
          setActiveTimelineCase(currentCaseId!);
          setTimelineStep('seller-query');
          setResponseShown(false);
        }, 3000);
      }
    }
  };

  // Show first case in worklist after 3 seconds on page load (but don't auto-select it)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWorklistCases(true);
      setVisibleCaseCount(1); // Show only the first case initially
      // Don't auto-select the case - user must click to open it
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!activeTimelineCase) return;
    if (timelineStep === 'seller-query') {
      const t = setTimeout(() => setTimelineStep('case-automation'), 1000);
      return () => clearTimeout(t);
    }
    if (timelineStep === 'case-automation') {
      const t = setTimeout(() => setTimelineStep('agent-selection'), 3000);
      return () => clearTimeout(t);
    }
  }, [timelineStep, activeTimelineCase]);

  const handleStartTimeline = (caseId: string) => {
    if (resolveTimerRef.current) {
      clearTimeout(resolveTimerRef.current);
      resolveTimerRef.current = null;
    }
    setActiveTimelineCase(caseId);
    setSelectedId(caseId);
    setTimelineStep('seller-query');
    setResponseShown(false);
    setShowPlaceholderPanels(false);
  };

  return (
    <main className="h-screen w-full flex flex-col">
      <div className="flex-1 grid grid-cols-1 gap-4 h-full p-4 md:grid-cols-[18rem_1.2fr_0.8fr] lg:grid-cols-[20rem_1.3fr_0.7fr]">
        
        {/* Worklist */}
        <div className="md:col-span-1">
          <Worklist
            data={showWorklistCases ? availableCases : []}
            selectedId={selectedId}
            onSelect={handleCaseSelect}
            onCaseUpdate={handleCaseUpdate}
            onCaseResolve={handleCaseResolve}
            resolvedCases={resolvedCases}
            escalatedCases={escalatedCases}
            onStartTimeline={handleStartTimeline}
          />
        </div>

        {/* Case Detail */}
        <div className="md:col-span-1">
          <CaseDetail
            key={current?.id || 'empty'}
            data={
              showPlaceholderPanels ? {
                id: 'placeholder',
                seller: '—',
                query: 'Case resolved. Loading next case...',
                draft: '',
                priority: 0,
                agent: 'Goal Explainer Agent',
                confidence: 0,
                timeline: [],
                isResolved: false,
                sourceAnalysis: [],
                performanceMetrics: { accuracy: 0, responseTime: "0s" },
              } : (current || {
                id: 'placeholder',
                seller: '—',
                query: 'Select a case from the worklist to view details here.',
                draft: '',
                priority: 0,
                agent: 'Goal Explainer Agent',
                confidence: 0,
                timeline: [],
                isResolved: false,
                sourceAnalysis: [],
                performanceMetrics: { accuracy: 0, responseTime: "0s" },
              })
            }
            onResolve={current && !showPlaceholderPanels ? () => handleCaseResolve(current.id) : undefined}
            timelineStep={activeTimelineCase === current?.id ? timelineStep : ''}
            onTimelineStepComplete={handleTimelineStepComplete}
            onResponseShown={setResponseShown}
            onEscalate={(caseId) => setEscalatedCases(prev => new Set([...prev, caseId]))}
          />
        </div>

        {/* Agent Insights */}
        <div className="md:col-span-1">
          <AgentInsights
            data={
              showPlaceholderPanels ? {
                id: 'placeholder',
                seller: '—',
                query: 'Case resolved. Loading next case...',
                draft: '',
                priority: 0,
                agent: 'Goal Explainer Agent',
                confidence: 0,
                timeline: [],
                isResolved: false,
                sourceAnalysis: [],
                performanceMetrics: { accuracy: 0, responseTime: "0s" },
              } : (current || {
                id: 'placeholder',
                seller: '—',
                query: 'Select a case from the worklist to view details here.',
                draft: '',
                priority: 0,
                agent: 'Goal Explainer Agent',
                confidence: 0,
                timeline: [],
                isResolved: false,
                sourceAnalysis: [],
                performanceMetrics: { accuracy: 0, responseTime: "0s" },
              })
            }
            timelineStep={activeTimelineCase === current?.id ? timelineStep : ''}
            responseShown={responseShown}
            onTimelineStepClick={(step) => {
              if (activeTimelineCase === current?.id) {
                setTimelineStep(step);
              }
            }}
          />
        </div>
      </div>
    </main>
  );
}
