'use client';
import { useState, useEffect, useRef } from 'react';
import { SellerCase } from '../data/cases';
import { SendHorizontal, User, Bot, Pencil } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export default function CaseDetail({
  data,
  onResolve,
  timelineStep = '',
  onTimelineStepComplete,
  onResponseShown,
  onEscalate,
}: {
  data: SellerCase;
  onResolve?: () => void;
  timelineStep?: string;
  onTimelineStepComplete?: (step: string) => void;
  onResponseShown?: (shown: boolean) => void;
  onEscalate?: (caseId: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.draft || '');
  const [banner, setBanner] = useState('New');
  const [hasShownResponse, setHasShownResponse] = useState(false);
  const [responseSent, setResponseSent] = useState(false);
  const [followUpAppended, setFollowUpAppended] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Preload previous conversation if provided on the case
  useEffect(() => {
    const anyData: any = data as any;
    if (messages.length === 0 && Array.isArray(anyData.messages) && anyData.messages.length > 0) {
      const mapped = anyData.messages.map((m: any) => ({
        id: m.id,
        type: m.type,
        content: m.content,
        timestamp: new Date(m.timestamp),
      }));
      setMessages(mapped);
    }
  }, [data, messages.length]);

  // Seller query
  useEffect(() => {
    if (timelineStep === 'seller-query') {
      // Reset draft visibility for a new cycle (e.g., follow-up)
      setHasShownResponse(false);
      setResponseSent(false);

      // Start thread if empty
      if (messages.length === 0) {
        setMessages([
          { id: '1', type: 'user', content: data.query, timestamp: new Date() },
        ]);
        setTimeout(() => onTimelineStepComplete?.('seller-query'), 1000);
        return;
      }

      // Append follow-up question if flagged new
      const anyData: any = data as any;
      console.log('Checking follow-up:', { 
        hasFollowUp: !!anyData.followUp, 
        isNew: anyData.followUp?.isNew, 
        followUpAppended, 
        messagesLength: messages.length 
      });
      
      if (anyData.followUp && anyData.followUp.isNew && !followUpAppended) {
        console.log('Adding follow-up question:', anyData.followUp.query);
        setMessages((prev) => [
          ...prev,
          {
            id: `fu-${Date.now()}`,
            type: 'user',
            content: anyData.followUp.query,
            timestamp: new Date(),
          },
        ]);
        setFollowUpAppended(true);
        setBanner('New comment'); // Set banner to "New comment" for follow-up
        setTimeout(() => onTimelineStepComplete?.('seller-query'), 1000);
      }
    }
  }, [timelineStep, data, data.query, messages.length, onTimelineStepComplete, followUpAppended]);

  // AI draft after agent selection
  useEffect(() => {
    if (timelineStep === 'agent-selection' && !hasShownResponse) {
      setIsTyping(true);
      const t = setTimeout(() => {
        setIsTyping(false);
        // Prefer follow-up draft when present
        const anyData: any = data as any;
        const nextDraft = anyData.followUp && (anyData.followUp.isNew || followUpAppended)
          ? anyData.followUp.draft
          : (data.draft || '');
        setDraft(nextDraft);
        setHasShownResponse(true);
        onResponseShown?.(true);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [timelineStep, hasShownResponse, onResponseShown, data, followUpAppended]);

  // Clear messages when data changes to placeholder (case resolved)
  useEffect(() => {
    if (data.id === 'placeholder' && data.query === 'Case resolved. Loading next case...') {
      setMessages([]);
      setIsTyping(false);
      setHasShownResponse(false);
      setResponseSent(false);
      setDraft('');
      setBanner('Resolved');
      setFollowUpAppended(false);
    } else if (data.id !== 'placeholder') {
      // Reset banner when a real case is selected
      setBanner('New');
      // Reset follow-up state when switching to a new case
      setFollowUpAppended(false);
    }
  }, [data.id, data.query]);

  return (
    <section className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-cisco-navy to-cisco-blue rounded-t-2xl px-6 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Case Detail
          </h2>
        </div>
        <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
          <User className="h-4 w-4" />
          <span>{data.seller}</span>
        </div>
      </div>

      {/* Chat */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.type === 'user' ? 'justify-start' : 'justify-end'
            }`}
          >
            {message.type === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shadow-sm">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
                message.type === 'user'
                  ? 'bg-gray-50 text-gray-800'
                  : 'bg-cisco-blue text-white'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {message.content}
              </p>
            </div>
            {message.type === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-cisco-navy flex items-center justify-center shadow-sm">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Typing dots */}
        {isTyping && (
          <div className="flex gap-3 justify-end">
            <div className="bg-gray-100 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cisco-blue to-cisco-sky flex items-center justify-center shadow-sm">
              <Bot className="h-4 w-4 text-white" />
            </div>
          </div>
        )}

        {/* AI Draft card */}
        {draft && hasShownResponse && !responseSent && (
          <div className="flex justify-end">
            <div className="w-full md:w-[80%] bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between bg-gradient-to-r from-cisco-blue/70 to-cisco-sky/70 px-4 py-2">
                <p className="text-sm font-bold text-cisco-navy">
                  AI Draft Response
                </p>
                <div className="flex items-center gap-2">
                  <button
                    className="h-8 px-3 rounded-lg bg-cisco-blue text-white text-xs font-medium hover:bg-cisco-navy transition"
                    onClick={() => {
                      setMessages((prev) => [
                        ...prev,
                        {
                          id: Date.now().toString(),
                          type: 'bot',
                          content: draft,
                          timestamp: new Date(),
                        },
                      ]);
                      
                      setResponseSent(true);
                      onTimelineStepComplete?.('sent');
                      
                      // Wait for the "Sent" icon to turn navy, then resolve the case
                      setTimeout(() => {
                        // For Seller F, escalate to L2 support (don't resolve)
                        if (data.id === '156427') {
                          setBanner('Not Resolved');
                          onEscalate?.(data.id); // Notify parent that case is escalated
                          // Don't call onResolve - case remains active but escalated
                        }
                        // For Seller C, check if this is the first query or follow-up
                        else if (data.id === '287423' && (data as any).followUp?.isNew) {
                          // This is the follow-up query being resolved
                          setBanner('Resolved');
                          onResolve?.(); // Resolve the entire case
                        } else if (data.id === '287423') {
                          // This is the first query being resolved
                          setBanner('Resolved');
                          // Don't call onResolve yet, wait for follow-up
                        } else {
                          // For all other cases, resolve immediately
                          setBanner('Resolved');
                          onResolve?.();
                        }
                      }, 4000); // Wait 4 seconds for the sent icon to glow
                    }}
                  >
                    <SendHorizontal className="h-4 w-4" />
                  </button>
                  <button
                    className="h-8 px-3 rounded-lg bg-cisco-blue text-white text-xs font-medium hover:bg-cisco-navy transition"
                    onClick={() => setEditing((v) => !v)}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                {!editing ? (
                  <p className="whitespace-pre-line text-sm text-gray-800">
                    {draft}
                  </p>
                ) : (
                  <textarea
                    className="w-full min-h-[120px] h-[120px] bg-transparent border-none outline-none p-3 text-sm resize-none"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>


    </section>
  );
}
