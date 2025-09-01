import { User, Bot, CheckCircle, Send, Zap } from "lucide-react";
import clsx from "clsx";
import { useEffect, useState } from "react";

export interface TimelineStep {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const steps: TimelineStep[] = [
  { id: "seller-query", name: "Seller Query", icon: <User className="h-5 w-5" /> },
  { id: "case-automation", name: "Case Automation", icon: <Zap className="h-5 w-5" /> },
  { id: "agent-selection", name: "Finding Agent", icon: <Bot className="h-5 w-5" /> },
  { id: "sent", name: "Sent", icon: <Send className="h-5 w-5" /> },
];

export default function InteractiveTimeline({
  currentStep,
  agentName,
  onStepClick,
}: {
  currentStep: string;
  agentName: string;
  onStepClick: (stepId: string) => void;
}) {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const dynamicSteps = steps.map((step) =>
    step.id === "agent-selection" ? { ...step, name: agentName } : step
  );

  // Blink animation for "sent"
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    if (currentStep === "sent") {
      setBlink(true);
      const timer = setTimeout(() => setBlink(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <div className="flex items-center justify-between w-full px-2 py-4">
      {dynamicSteps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isActive = index === currentStepIndex;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <button
              onClick={() => onStepClick(step.id)}
              disabled={index > currentStepIndex}
              className={clsx(
                "flex flex-col items-center text-center transition-all duration-300 flex-shrink-0",
                index > currentStepIndex ? "cursor-not-allowed" : "cursor-pointer"
              )}
            >
              <div
                className={clsx(
                  "w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-md transition-all duration-500",
                  step.id === "sent" && currentStep === "sent"
                    ? blink
                      ? "bg-cisco-blue/80 text-white border-cisco-blue animate-pulse"
                      : "bg-cisco-navy text-white border-cisco-navy"
                    : isActive
                    ? "bg-cisco-blue text-white border-cisco-sky animate-pulse"
                    : isCompleted
                    ? "bg-cisco-navy text-white border-cisco-navy"
                    : "bg-gray-200 text-gray-500 border-gray-300"
                )}
              >
                {isCompleted && step.id !== "sent" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  step.icon
                )}
              </div>
              <p
                className={clsx(
                  "text-xs font-semibold mt-2 w-20",
                  step.id === "sent" && currentStep === "sent"
                    ? "text-cisco-navy"
                    : isActive
                    ? "text-cisco-blue"
                    : isCompleted
                    ? "text-cisco-green"
                    : "text-gray-500"
                )}
              >
                {step.name}
              </p>
            </button>

            {/* Connector line */}
            {index < dynamicSteps.length - 1 && (
              <div
                className={clsx(
                  "h-0.5 w-5 md:w-2 lg:w-2 mx-2 rounded-full transition-all duration-500",
                  index < currentStepIndex 
                    ? "bg-gradient-to-r from-cisco-blue to-cisco-sky" 
                    : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
