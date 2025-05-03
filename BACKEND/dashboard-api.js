require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// Dashboard analysis endpoint
app.get('/api/dashboard', async (req, res) => {
  try {
    const formsSnapshot = await db.collection('formConfigs').get();
    const formsData = {};
    formsSnapshot.forEach(doc => {
      const data = doc.data();
      formsData[doc.id] = {
        title: data.config?.title || "Untitled Form",
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
      };
    });

    const submissionsSnapshot = await db.collection('formSubmissions').get();
    const responseMap = {};
    const durationMap = {};
    submissionsSnapshot.forEach(doc => {
      const data = doc.data();
      const formId = data.formId;
      if (!formId) return;
      if (!responseMap[formId]) responseMap[formId] = 0;
      responseMap[formId]++;
      if (typeof data.durationMs === 'number') {
        if (!durationMap[formId]) durationMap[formId] = [];
        durationMap[formId].push(data.durationMs / 1000);
      }
    });


    const responsesPerForm = Object.entries(formsData).map(([formId, form]) => {
      const count = responseMap[formId] || 0;
      const durations = durationMap[formId] || [];
      const avgDuration = durations.length
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : null;
      return {
        formId,
        title: form.title || "Untitled Form",
        createdAt: form.createdAt,
        responseCount: count,
        averageDurationSeconds: avgDuration,
      };
    });
    // Calculate overall average submission time (server-side)
    let totalDurationSum = 0;
    let totalResponsesWithDuration = 0;
    Object.entries(formsData).forEach(([formId, form]) => {
      const count = responseMap[formId] || 0;
      const durations = durationMap[formId] || [];
      if (durations.length > 0) {
        totalDurationSum += durations.reduce((a, b) => a + b, 0);
        totalResponsesWithDuration += durations.length;
      }
    });
    const overallAvgDurationSeconds = totalResponsesWithDuration > 0
      ? totalDurationSum / totalResponsesWithDuration
      : null;

      res.json({
        totalForms: formsSnapshot.size,
        totalResponses: submissionsSnapshot.size,
        responsesPerForm,
        overallAvgDurationSeconds, // <-- add this
      });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});


const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Dashboard API running on http://localhost:${PORT}`);
});