import { useState } from "react";
import { SellerCase } from "../data/cases";
import InteractiveTimeline from "./InteractiveTimeline";

import {
  BarChart3,
  FileSearch,
  BadgeDollarSign,
  Workflow,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";


function AgentIcon({ name }: { name: SellerCase["agent"] }) {
  const map = {
    "Goal Explainer Agent": <BarChart3 className="h-5 w-5" />,
    "Deal Status & Classification Agent": <FileSearch className="h-5 w-5" />,
    "Commission Explainer Agent": <BadgeDollarSign className="h-5 w-5" />,
    "Case Routing Agent": <Workflow className="h-5 w-5" />,
  } as const;
  return map[name];
}

export default function AgentInsights({
  data,
  timelineStep,
  responseShown,
  onTimelineStepClick,
}: {
  data: SellerCase;
  timelineStep: string;
  responseShown: boolean;
  onTimelineStepClick: (step: string) => void;
}) {
  const [draft, setDraft] = useState(data.draft || "");

  const hasBeenRouted = data.timeline.some((item) =>
    item.includes("Case automation agent invoked")
  );

  return (
    <aside className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 h-[calc(100vh-8rem)] overflow-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-cisco-navy to-cisco-blue rounded-t-2xl px-6 py-4 shadow-md">
        <h2 className="text-lg font-semibold text-white tracking-tight">
          AI Agent Insights
        </h2>
      </div>

      {/* Content */}
      <div className="overflow-y-auto p-6 space-y-6">
        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-cisco-sky shadow-sm px-6 py-4 w-full">
          <InteractiveTimeline
            currentStep={timelineStep}
            agentName={
              ["agent-selection", "sent"].includes(timelineStep)
                ? (data as any).followUp && (data as any).followUp.isNew 
                  ? (data as any).followUp.agent 
                  : data.agent
                : "Finding Agent"
            }
            onStepClick={onTimelineStepClick}
          />
        </div>

        {/* L2 Escalation Alert for Seller F */}
        {data.id === '156427' && timelineStep === 'sent' && (
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-cisco-navy to-cisco-blue shadow-md p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <svg className="h-5 w-5 text-cisco-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Case Escalation Alert</h3>
                <p className="text-sm text-white">Raised to L2 Support</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-cisco-navy">
                This case requires specialized attention and has been escalated to our Level 2 support team for resolution.
              </p>
            </div>
          </div>
        )}

        {/* Case Automation Status */}
        {(hasBeenRouted || timelineStep === 'sent') && (
          <div className="rounded-2xl border border-cisco-sky bg-gradient-to-r from-cisco-sky/10 to-cisco-blue/5 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-cisco-navy to-cisco-blue flex items-center justify-center shadow-sm">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-base font-bold text-cisco-navy">
                Case Automation Status
              </h3>
            </div>

            {timelineStep === "agent-selection" && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Selected Agent
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {(data as any).followUp && (data as any).followUp.isNew 
                      ? (data as any).followUp.agent 
                      : data.agent}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Confidence</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {Math.round(((data as any).followUp && (data as any).followUp.isNew 
                      ? (data as any).followUp.confidence 
                      : data.confidence) * 100)}%
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    ["case-automation", "agent-selection", "sent"].includes(
                      timelineStep
                    )
                      ? "bg-cisco-navy"
                      : "bg-gray-300"
                  }`}
                />
                <span className="text-gray-700">
                  Case automation agent invoked
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${
                    ["agent-selection", "sent"].includes(timelineStep)
                      ? "bg-cisco-navy"
                      : "bg-gray-300"
                  }`}
                />
                <span className="text-gray-700">
                  Best sub-agent selected:{" "}
                  {["agent-selection", "sent"].includes(timelineStep)
                    ? (data as any).followUp && (data as any).followUp.isNew 
                      ? (data as any).followUp.agent 
                      : data.agent
                    : "Finding agent..."}
                </span>
              </div>
            </div>
          </div>
        )}

        

        {/* Sub-agent details */}
        {responseShown && (
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-cisco-sky/10 to-cisco-blue/5 shadow-md p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 grid place-items-center rounded-2xl bg-gradient-to-r from-cisco-navy to-cisco-blue text-white shadow-md">
                <AgentIcon name={(data as any).followUp && (data as any).followUp.isNew 
                  ? (data as any).followUp.agent 
                  : data.agent} />
              </div>
              <div>
                <h3 className="text-base font-bold text-cisco-navy">
                  {(data as any).followUp && (data as any).followUp.isNew 
                    ? (data as any).followUp.agent 
                    : data.agent}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <Target className="h-4 w-4 text-cisco-blue" />
                  <span className="text-xs font-medium text-cisco-blue">
                    {Math.round(data.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            </div>

            {/* ✅ Source Analysis */}
<div className="space-y-3 mb-4">
  <h4 className="text-sm font-bold text-gray-700">Source Analysis</h4>
  <div className="space-y-2">
    {data.sourceAnalysis.map((src, idx) => (
      <div key={idx} className="flex items-center gap-2">
        <span className="text-xs text-gray-500 ml-2">{src.label}</span>
        
        <div className="h-2 flex-1 rounded bg-gray-200">
          <div
            className="h-2 rounded bg-cisco-blue"
            style={{ width: `${src.value}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-600">
          {src.value}%
        </span>
        
      </div>
    ))}
  </div>
</div>



            {/* Performance */}
            <div className="bg-gradient-to-r from-cisco-sky/10 to-cisco-blue/5 rounded-xl p-4 border border-cisco-sky/30 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-cisco-blue" />
                <span className="text-sm font-bold text-gray-700">
                  Performance Metrics
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-cisco-blue">{data.performanceMetrics.accuracy}%</p>
                  <p className="text-xs text-gray-500">Accuracy</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-cisco-blue">{data.performanceMetrics.responseTime}</p>
                  <p className="text-xs text-gray-500">Response Time</p>
                </div>
              </div>
            </div>
          </div>
        )}

        
      </div>
    </aside>
  );
}
