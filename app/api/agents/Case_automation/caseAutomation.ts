import { groq, DEFAULT_GROQ_MODEL } from "../../../../lib/llm";

export type RoutedAgent =
  | "Goal Explainer Agent"
  | "Deal Status & Classification Agent"
  | "Commission Explainer Agent"
  | "Case Routing Agent";

export interface RouteInput {
  query: string;
  // Optional contextual hints from UI like caseId, sellerId, etc.
  hints?: Record<string, any>;
}

export interface RouteResult {
  ok: boolean;
  agent: RoutedAgent;
  confidence: number; // 0..1
  rationale: string;
  extracted: {
    caseId?: string;
    salesOrderId?: string;
    orderId?: string;
    customer?: string;
    amountUSD?: number;
    fiscalYear?: string;
    topic?: string; // goal-change | deal-status | commission | escalation | other
  };
}

const SYSTEM = `
You are Case Automation Agent, a precise router.
Task: Read the seller's message and choose ONE best downstream agent:
- Goal Explainer Agent -> for questions about goals, quotas, goal % changes
- Deal Status & Classification Agent -> for status of sales orders/deals, partner-led vs seller-led, credit splits
- Commission Explainer Agent -> for payout breakdowns, rates, amounts, missing commission lines
- Case Routing Agent -> for detected system discrepancies, policy exceptions, or explicit escalation needed

Always extract any useful IDs (case #, sales order # like SO #80009765 or order i-100007), amounts, and the core topic.
Return ONLY a compact JSON object following the provided JSON schema.
`;

// Fallback routing logic for when Groq API is not available
function fallbackRouteCase(input: RouteInput): RouteResult {
  const query = input.query.toLowerCase();
  const hints = input.hints || {};
  
  // Simple keyword-based routing
  let agent: RoutedAgent = "Case Routing Agent";
  let confidence = 0.7;
  let rationale = "Fallback routing based on keywords";
  let topic = "other";
  
  if (query.includes("goal") || query.includes("quota") || query.includes("portfolio")) {
    agent = "Goal Explainer Agent";
    confidence = 0.85;
    rationale = "Query contains goal-related keywords";
    topic = "goal-change";
  } else if (query.includes("deal") || query.includes("order") || query.includes("so #") || query.includes("sales order")) {
    agent = "Deal Status & Classification Agent";
    confidence = 0.88;
    rationale = "Query contains deal/order-related keywords";
    topic = "deal-status";
  } else if (query.includes("commission") || query.includes("payout") || query.includes("rate")) {
    agent = "Commission Explainer Agent";
    confidence = 0.9;
    rationale = "Query contains commission-related keywords";
    topic = "commission";
  } else if (query.includes("escalat") || query.includes("discrepancy") || query.includes("resolve")) {
    agent = "Case Routing Agent";
    confidence = 0.8;
    rationale = "Query contains escalation or system issue keywords";
    topic = "escalation";
  }
  
  // Extract case ID from hints
  const caseId = hints.caseId || "unknown";
  
  return {
    ok: true,
    agent,
    confidence,
    rationale,
    extracted: {
      caseId,
      topic,
      fiscalYear: "FY25"
    }
  };
}

export async function routeCase(input: RouteInput): Promise<RouteResult> {
  // Check if Groq API key is available
  if (!process.env.GROQ_API_KEY) {
    console.log("Groq API key not found, using fallback routing");
    return fallbackRouteCase(input);
  }

  try {
    const tools = [
      {
        type: "function" as const,
        function: {
          name: "route_case",
          description:
            "Decide the best agent for the query and extract key fields",
          parameters: {
            type: "object",
            properties: {
              agent: {
                type: "string",
                enum: [
                  "Goal Explainer Agent",
                  "Deal Status & Classification Agent",
                  "Commission Explainer Agent",
                  "Case Routing Agent",
                ],
              },
              confidence: { type: "number", minimum: 0, maximum: 1 },
              rationale: { type: "string" },
              extracted: {
                type: "object",
                properties: {
                  caseId: { type: "string" },
                  salesOrderId: { type: "string" },
                  orderId: { type: "string" },
                  customer: { type: "string" },
                  amountUSD: { type: "number" },
                  fiscalYear: { type: "string" },
                  topic: { type: "string" },
                },
                additionalProperties: true,
              },
            },
            required: ["agent", "confidence", "rationale", "extracted"],
            additionalProperties: false,
          },
        },
      },
    ];

    const messages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [
      { role: "system", content: SYSTEM.trim() },
      {
        role: "user",
        content: `Message: ${input.query}\nHints: ${JSON.stringify(
          input.hints || {}
        )}`,
      },
    ];

    const resp = await groq.chat.completions.create({
      model: DEFAULT_GROQ_MODEL, // e.g., "llama-3.1-8b-instant" or "llama-3.1-70b-versatile"
      messages,
      temperature: 0.2,
      tools,
      tool_choice: "auto",
    });

    const choice = resp.choices?.[0];
    const tool = choice?.message?.tool_calls?.[0];

    if (tool && tool.type === "function" && tool.function?.name === "route_case") {
      const args = JSON.parse(tool.function.arguments || "{}");
      const result: RouteResult = {
        ok: true,
        agent: args.agent,
        confidence: Math.max(0, Math.min(1, Number(args.confidence) || 0)),
        rationale: String(args.rationale || ""),
        extracted: args.extracted || {},
      };
      return result;
    }

    // Fallback: if no tool call, attempt to parse content as JSON
    try {
      const content = choice?.message?.content || "{}";
      const parsed = JSON.parse(content);
      return { ok: true, ...parsed } as RouteResult;
    } catch {
      return {
        ok: false,
        agent: "Case Routing Agent",
        confidence: 0.0,
        rationale: "Unable to determine route",
        extracted: {},
      };
    }
  } catch (error) {
    console.error("Groq API error:", error);
    console.log("Falling back to keyword-based routing");
    return fallbackRouteCase(input);
  }
}
