// Azure OpenAI API configuration
const API_KEY = 'Fn0z7uMAIRz7rZhGhcrSvVNmjI058GWR2lHAlREO49gthkkA8zBHJQQJ99ALACHYHv6XJ3w3AAAAACOGPDWw';
const BASE_PATH = 'https://kesha-m4b3r973-eastus2.cognitiveservices.azure.com';
const DEPLOYMENT_NAME = 'gpt-4o-mini-2';
const API_VERSION = '2025-01-01-preview';

/**
 * Analyzes JSON data using Azure OpenAI API
 */
export async function analyzeData(jsonData: any) {
  try {
    // Prepare the prompt for the AI to analyze the data
    const prompt = generateAnalysisPrompt(jsonData);

    // Make the API call to Azure OpenAI
    const response = await fetch(
      `${BASE_PATH}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a data analyst AI assistant. Provide concise, one-line insights without using the word "dataset". Focus on trends, patterns, and key findings.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.5,
          max_tokens: 2000,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    // Parse the AI response to extract insights and chart recommendations
    return parseAnalysisResponse(result, jsonData);
  } catch (error) {
    console.error('Error analyzing data:', error);
    throw error;
  }
}

/**
 * Generate a prompt for the AI to analyze the data
 */
function generateAnalysisPrompt(jsonData: any): string {
  return `
Analyze this JSON data and provide:
1. 2-3 one-line insights about key findings (avoid using the word "dataset")
2. 1-2 chart recommendations with clear categorization

For each chart, specify:
- Chart type (bar, line, pie, area)
- Title
- Category being analyzed (e.g., "Sales by Product Category", "Revenue by Month")
- Exact data structure for visualization, including:
  - Categories/labels
  - Numerical values
  - Time periods (if applicable)

Return your response in this JSON format:
{
  "insights": [
    {
      "title": "Brief, one-line insight",
      "description": "One-sentence explanation"
    }
  ],
  "charts": [
    {
      "type": "bar|line|pie|area",
      "title": "Chart title",
      "description": "What this chart shows",
      "category": "Main category being analyzed",
      "dataPoints": [
        {
          "name": "Category name",
          "value": 123
        }
      ]
    }
  ]
}

Here's the data to analyze:
${JSON.stringify(jsonData, null, 2)}
`;
}

/**
 * Parse the AI response to extract insights and chart recommendations
 */
function parseAnalysisResponse(apiResponse: any, originalData: any) {
  try {
    const content = apiResponse.choices[0].message.content;

    // Try to parse the JSON response
    const responseObj = extractJsonFromText(content);

    if (!responseObj) {
      throw new Error('Could not parse AI response as JSON');
    }

    // Prepare charts data based on AI recommendations
    const charts = (responseObj.charts || []).map((chart: any, index: number) => {
      return {
        type: chart.type || 'bar',
        title: chart.title || `Chart ${index + 1}`,
        description: chart.description || '',
        data: chart.dataPoints || [],
        keys: {
          category: 'name',
          value: 'value'
        },
        id: `chart-${index}`
      };
    });

    // Prepare insights from AI recommendations
    const insights = (responseObj.insights || []).map((insight: any, index: number) => ({
      title: insight.title || `Insight ${index + 1}`,
      description: insight.description || '',
      id: `insight-${index}`
    }));

    return {
      insights,
      charts,
      rawResponse: content
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {
      insights: [{
        title: 'Error analyzing data',
        description: 'Could not generate insights from the provided data.',
        id: 'error-insight'
      }],
      charts: [],
      rawResponse: apiResponse.choices[0]?.message?.content || 'No response'
    };
  }
}

/**
 * Extract JSON object from text which might contain non-JSON content
 */
function extractJsonFromText(text: string): any {
  try {
    // First try parsing the entire text as JSON
    return JSON.parse(text);
  } catch (e) {
    // If that fails, try to find JSON object in the text
    const jsonRegex = /{[\s\S]*}/;
    const match = text.match(jsonRegex);

    if (match && match[0]) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        console.error('Failed to parse JSON from text match');
      }
    }

    // If all parsing attempts fail, return null
    return null;
  }
}