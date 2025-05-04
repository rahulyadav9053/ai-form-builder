const { getDashboardSummary, getSubmissionsByFormId: getSubmissionsByFormIdService } = require('../services/firestoreService');
const axios = require('axios');

function generateAnalysisPrompt(jsonData) {
  return `\nAnalyze this JSON data and provide:\n1. 2-3 one-line insights about key findings (avoid using the word \"dataset\")\n2. 1-2 chart recommendations with clear categorization\n\nFor each chart, specify:\n- Chart type (bar, line, pie, area)\n- Title\n- Category being analyzed (e.g., \"Sales by Product Category\", \"Revenue by Month\")\n- Exact data structure for visualization, including:\n  - Categories/labels\n  - Numerical values\n  - Time periods (if applicable)\n\nReturn your response in this JSON format:\n{\n  \"insights\": [\n    {\n      \"title\": \"Brief, one-line insight\",\n      \"description\": \"One-sentence explanation\"\n    }\n  ],\n  \"charts\": [\n    {\n      \"type\": \"bar|line|pie|area\",\n      \"title\": \"Chart title\",\n      \"description\": \"What this chart shows\",\n      \"category\": \"Main category being analyzed\",\n      \"dataPoints\": [\n        {\n          \"name\": \"Category name\",\n          \"value\": 123\n        }\n      ]\n    }\n  ]\n}\n\nHere's the data to analyze:\n${JSON.stringify(jsonData, null, 2)}\n`;
}

function extractJsonFromText(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const jsonRegex = /{[\s\S]*}/;
    const match = text.match(jsonRegex);
    if (match && match[0]) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        console.error('Failed to parse JSON from text match');
      }
    }
    return null;
  }
}

function parseAnalysisResponse(apiResponse, originalData) {
  try {
    const content = apiResponse.choices[0].message.content;
    const responseObj = extractJsonFromText(content);
    if (!responseObj) {
      throw new Error('Could not parse AI response as JSON');
    }
    const charts = (responseObj.charts || []).map((chart, index) => ({
      type: chart.type || 'bar',
      title: chart.title || `Chart ${index + 1}`,
      description: chart.description || '',
      data: chart.dataPoints || [],
      keys: { category: 'name', value: 'value' },
      id: `chart-${index}`
    }));
    const insights = (responseObj.insights || []).map((insight, index) => ({
      title: insight.title || `Insight ${index + 1}`,
      description: insight.description || '',
      id: `insight-${index}`
    }));
    return { insights, charts, rawResponse: content };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {
      insights: [{
        title: 'Error analyzing data',
        description: 'Could not generate insights from the provided data.',
        id: 'error-insight'
      }],
      charts: [],
      rawResponse: apiResponse.choices?.[0]?.message?.content || 'No response'
    };
  }
}

exports.getDashboardData = async (req, res) => {
    try {
      const data = await getDashboardSummary();
      res.json(data);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
      }
};

exports.getSubmissionsByFormId = async (req, res) => {
  const { formId } = req.params;
  if (!formId) {
    return res.status(400).json({ error: 'formId is required' });
  }
  try {
    const submissions = await getSubmissionsByFormIdService(formId);
    if (!submissions.length) {
      return res.json({ insights: [], charts: [], rawResponse: '', message: 'No submissions found.' });
    }
    // Azure OpenAI config from env
    const API_KEY = process.env.AZURE_OPENAI_API_KEY;
    const BASE_PATH = process.env.AZURE_OPENAI_BASE_PATH;
    const DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT;
    const API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2023-12-01-preview';
    if (!API_KEY || !BASE_PATH || !DEPLOYMENT_NAME) {
      return res.status(500).json({ error: 'Azure OpenAI config missing in environment variables.' });
    }
    const prompt = generateAnalysisPrompt(submissions);
    const response = await axios.post(
      `${BASE_PATH}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`,
      {
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
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY,
        },
      }
    );
    const result = parseAnalysisResponse(response.data, submissions);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to analyze submissions' });
  }
};
