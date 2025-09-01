# Case Automation Agent Implementation

## Overview
The Case automation agent has been successfully integrated into the Cisco Seller Service Panel. When a user clicks on a case ID, the system automatically invokes the Case automation agent to analyze the query and route it to the most appropriate specialized agent.

## Features Implemented

### 1. **Case Automation Agent Integration**
- **Location**: `app/api/agents/Case_automation/`
- **Files**: 
  - `route.ts` - API endpoint handler
  - `caseAutomation.ts` - Core routing logic using Groq LLM

### 2. **Enhanced Worklist Component**
- **Smart Case Selection**: Clicking a case automatically triggers the Case automation agent
- **Real-time Status Indicators**: Shows routing progress with loading states
- **Visual Feedback**: Displays routing results and confidence scores
- **Error Handling**: Graceful error handling with user-friendly messages

### 3. **Updated Timeline System**
The timeline now shows the complete automation process:
- `Case #XXXX opened`
- `Case automation agent invoked`
- `Routed to [Agent Name] (XX% confidence)`

### 4. **Enhanced UI Components**

#### **CaseDetail Component**
- **Routing Information Panel**: Shows AI routing results when available
- **Auto-routed Badge**: Visual indicator for automatically routed cases
- **Enhanced Metadata**: Displays selected agent and confidence score

#### **AgentInsights Component**
- **Case Automation Status**: Dedicated section showing automation process
- **Enhanced Timeline**: Complete workflow visualization
- **Performance Metrics**: Real-time agent performance data

## Setup Instructions

### 1. **Environment Variables**
Create a `.env.local` file in the root directory:

```env
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

### 2. **API Key Setup**
1. Sign up for a Groq account at https://console.groq.com/
2. Generate an API key
3. Add the API key to your `.env.local` file

### 3. **Model Selection**
The system uses `llama-3.1-8b-instant` by default for fast responses. You can change to `llama-3.1-70b-versatile` for potentially better accuracy but slower responses.

## How It Works

### 1. **Case Selection Flow**
1. User clicks on a case in the Worklist
2. System automatically calls the Case automation agent API
3. Agent analyzes the query using Groq LLM
4. Agent determines the best specialized agent based on query content
5. Results are displayed in real-time with confidence scores

### 2. **Routing Logic**
The Case automation agent routes queries to one of four specialized agents:

- **Goal Explainer Agent**: Questions about goals, quotas, goal % changes
- **Deal Status & Classification Agent**: Status of sales orders/deals, partner-led vs seller-led
- **Commission Explainer Agent**: Payout breakdowns, rates, amounts, missing commission lines
- **Case Routing Agent**: System discrepancies, policy exceptions, escalations

### 3. **Data Extraction**
The agent also extracts useful information:
- Case IDs
- Sales Order IDs (e.g., SO #80009765)
- Order IDs (e.g., i-100007)
- Customer names
- Amounts in USD
- Fiscal years
- Topics (goal-change, deal-status, commission, escalation, other)

## API Endpoint

### **POST** `/api/agents/Case_automation`

**Request Body:**
```json
{
  "query": "My goal for security portfolio seems higher than last year...",
  "hints": {
    "caseId": "153457",
    "seller": "Seller A",
    "status": "New"
  }
}
```

**Response:**
```json
{
  "ok": true,
  "agent": "Goal Explainer Agent",
  "confidence": 0.92,
  "rationale": "Query is about goal changes and portfolio adjustments",
  "extracted": {
    "caseId": "153457",
    "topic": "goal-change",
    "fiscalYear": "FY25"
  }
}
```

## Error Handling

The system includes comprehensive error handling:
- **API Errors**: Network issues, invalid responses
- **Routing Failures**: LLM errors, parsing issues
- **User Feedback**: Clear error messages and retry options

## Performance Considerations

- **Fast Response**: Uses Groq's instant model for sub-second responses
- **Caching**: Routing results are cached per case
- **Loading States**: Visual feedback during processing
- **Fallback**: Graceful degradation if automation fails

## Future Enhancements

1. **Batch Processing**: Route multiple cases simultaneously
2. **Learning**: Improve routing accuracy based on user feedback
3. **Custom Agents**: Add new specialized agents as needed
4. **Analytics**: Track routing accuracy and performance metrics
5. **A/B Testing**: Compare different routing strategies

## Troubleshooting

### Common Issues

1. **"Routing failed" error**
   - Check your Groq API key is valid
   - Verify the API key is in `.env.local`
   - Ensure you have sufficient Groq credits

2. **Slow response times**
   - Consider switching to `llama-3.1-8b-instant` model
   - Check your internet connection
   - Monitor Groq API status

3. **Incorrect routing**
   - Review the query content for clarity
   - Check the extracted data for accuracy
   - Consider adjusting the system prompt in `caseAutomation.ts`

### Debug Mode
To enable debug logging, add `DEBUG=true` to your `.env.local` file.

## Support

For issues or questions about the Case automation agent implementation, please refer to the Groq documentation or contact the development team.
