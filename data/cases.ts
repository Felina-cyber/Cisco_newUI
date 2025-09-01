export type CaseStatus = 'New' | 'Pending Validation' | 'Closed' | 'Escalated';

export type AgentName =
  | 'Goal Explainer Agent'
  | 'Deal Status & Classification Agent'
  | 'Commission Explainer Agent'
  | 'Case Routing Agent';

export interface SellerCase {
  id: string;
  seller: string;
  query: string;
  draft: string;
  agent: AgentName;
  confidence: number; // 0..1
  timeline: string[];
  priority: number; // Priority order (1, 2, 3, etc.)
  isResolved: boolean; // Whether this case has been resolved

  // new fields
  sourceAnalysis: { label: string; value: number }[];
  performanceMetrics: { accuracy: number; responseTime: string };

  // optional follow-up support
  followUp?: {
    query: string;
    draft: string;
    agent: AgentName;
    confidence: number;
    isNew: boolean;
    sourceAnalysis: { label: string; value: number }[];
    performanceMetrics: { accuracy: number; responseTime: string };
  } | null;

  // optional persisted conversation messages for replay
  messages?: {
    id: string;
    type: 'user' | 'bot';
    content: string;
    timestamp: string; // ISO string
  }[];
}

export const cases: SellerCase[] = [
  {
    id: "153457",
    seller: "Seller A",
    query:
      "My goal for security portfolio seems higher than last year even though quota only increased slightly. Why is that?",
    draft:
      "In response to your query (Case #153457), I have shared a detailed description to address your query. Please find the following details - \n\nFY’24 security portfolio goal: $2.5 M out of 10 M quota (25%)\nFY’25 security portfolio goal: $4 M out of 11 M quota (36%)\n\nThe reason for the change is because Cisco has prioritized Security and AI Networking this year and hence your security goal has been proportionally increased.",
    agent: "Goal Explainer Agent",
    confidence: 0.92,
    timeline: [],
    priority: 1,
    isResolved: false,
    sourceAnalysis: [
      { label: "Cisco Sales Quota Policies", value: 85 },
      { label: "Portfolio Prioritization Docs", value: 72 },
    ],
    performanceMetrics: { accuracy: 92, responseTime: "1.2s" },
  },
  {
    id: "334258",
    seller: "Seller B",
    query:
      "I had booked a 750,000 $ deal with Mariott International last month, but it is not showing against my goal in system (SO #80009765). Can you check the status and confirm whether it counts towards my goal?",
    draft:
      "Deal status for SO #80009765 is Pending. \n\nThe ETA for your deal for validation closure of SO #80009765 would be within 3 business days and your deal is classified as \"Partner led Transaction\". \n\nFor deals above 750,000 USD, revenue is split as 70% to Partner and 30% to Cisco seller. Hence 30% of 750,000 USD which will amount to 225,000 USD will be credited to your goal once validation is completed.",
    agent: "Deal Status & Classification Agent",
    confidence: 0.88,
    timeline: [],
    priority: 2,
    isResolved: false,
    sourceAnalysis: [
      { label: "ERP / Cisco Commerce Workspace", value: 78 },
      { label: "Credit Split Engine", value: 69 },
    ],
    performanceMetrics: { accuracy: 89, responseTime: "1.4s" },
  },
  {
    id: "287423",
    seller: "Seller C",
    query: "My commission payout is incorrect for this quarter. Please assist.",
    draft:
      "I understand your concern regarding the commission payout for this quarter. \n\nFor the current quarter Q2, sales commission payout from Cisco is found out to be 28,521 USD. Please find below detailed breakup of commission payout for eligible deals (orders) -\n\nSales Representative: Jamie Webb\n\nOrder #: i-100004\n- Customer: Ironavigation\n- Revenue: 283.33\n- Commission Rate: 5%\n- Commission Amount: 14.17\n- Deductions: 0.00\n- Payout: 14.17\n\nOrder #: i-100005\n- Customer: Soul Solutions\n- Revenue: 319.00\n- Commission Rate: 4.5%\n- Commission Amount: 14.36\n- Deductions: 0.00\n- Payout: 14.36\n\n(All values are in thousands)\n\nTotal Payout (in Thousands) is $28.53",
    agent: "Commission Explainer Agent",
    confidence: 0.9,
    timeline: [],
    priority: 3,
    isResolved: false,
    sourceAnalysis: [
      { label: "Commission Logs & Payout Records", value: 92 },
      { label: "Deal Validation (ERP / CW)", value: 74 },
    ],
    performanceMetrics: { accuracy: 94, responseTime: "1.1s" },
    messages: [
      {
        id: "msg-1",
        type: "user",
        content: "My commission payout is incorrect for this quarter. Please assist.",
        timestamp: new Date().toISOString(),
      },
      {
        id: "msg-2",
        type: "bot",
        content:
          "I understand your concern regarding the commission payout for this quarter. \n\nFor the current quarter Q2, sales commission payout from Cisco is found out to be 28,521 USD. Please find below detailed breakup of commission payout for eligible deals (orders) -\n\nSales Representative: Jamie Webb\n\nOrder #: i-100004\n- Customer: Ironavigation\n- Revenue: 283.33\n- Commission Rate: 5%\n- Commission Amount: 14.17\n- Deductions: 0.00\n- Payout: 14.17\n\nOrder #: i-100005\n- Customer: Soul Solutions\n- Revenue: 319.00\n- Commission Rate: 4.5%\n- Commission Amount: 14.36\n- Deductions: 0.00\n- Payout: 14.36\n\n(All values are in thousands)\n\nTotal Payout (in Thousands) is $28.53",
        timestamp: new Date().toISOString(),
      },
    ],
    followUp: {
      query:
        "My commission payout for Order # i-100007 is not mentioned in your response. I am yet to receive the payout for the same in Q2. Please resolve this issue",
      draft:
        "As per our system, deal status for Order # i-100007 is “Pending for Validation”\n\nAs I see your Order status of # i-100007 is Pending for Validation, please note that system generally takes up to 24-48 hours to reflect after deal moves to Closed Win.\n\nOnce your deal moves to Closed Win stage, a new commission payout will be generated with details of existing and new order details and the same will be sent to you over email. You can also download the commission payout from Seller Service Portal > View Tickets > Closed Tickets\n\nWe appreciate your patience as we try to revert you at the earliest possible.",
      agent: "Deal Status & Classification Agent",
      confidence: 0.87,
      isNew: false,
      sourceAnalysis: [
        { label: "Pending Order Validation System", value: 83 },
        { label: "Closed Win Tracking", value: 71 },
      ],
      performanceMetrics: { accuracy: 91, responseTime: "1.3s" }
    },
  },
  {
    id: "156427",
    seller: "Seller F",
    query:
      " My goal was reduced from 12Mn USD to 10 Mn USD after a territory split, but my commissions are still being calculated on old goal. Please resolve my issue at the earliest.",
    draft:
      "In response to your query (Case #156427), it has come to our notice that there is a system discrepancy and as a result, your commissions are not mapped to your new goal.\n\nI have escalated your case to our escalation team who will work on resolving your case. You can track the status of your case in Seller Service Portal > View Tickets > Pending Tickets.\n\nOn successful resolution of your issue, you will receive email notification, and your ticket will move to Seller Service Portal > View Tickets > Closed Tickets.",
    agent: "Goal Explainer Agent",
    confidence: 0.86,
    timeline: [],
    priority: 4,
    isResolved: false,
    sourceAnalysis: [
      { label: "Territory Split Policy Data", value: 81 },
      { label: "Goal Mapping & Commission System", value: 70 },
    ],
    performanceMetrics: { accuracy: 88, responseTime: "1.5s" },
  }
];
