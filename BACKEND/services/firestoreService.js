const admin = require('firebase-admin');

// Ensure Firebase is initialized only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

/**
 * Fetches dashboard summary data.
 * Returns:
 *  - totalForms
 *  - totalResponses
 *  - responsesPerForm[]
 *  - overallAvgDurationSeconds
 */
async function getDashboardSummary() {
  const formsSnapshot = await db.collection('formConfigs').get();
  const formsData = {};
  formsSnapshot.forEach(doc => {
    const data = doc.data();
    formsData[doc.id] = {
      title: data.config?.title || 'Untitled Form',
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

    // Count submissions per form
    if (!responseMap[formId]) responseMap[formId] = 0;
    responseMap[formId]++;

    // Track durations
    if (typeof data.durationMs === 'number') {
      if (!durationMap[formId]) durationMap[formId] = [];
      durationMap[formId].push(data.durationMs / 1000); // convert ms to seconds
    }
  });

  // Compile response data
  const responsesPerForm = Object.entries(formsData).map(([formId, form]) => {
    const count = responseMap[formId] || 0;
    const durations = durationMap[formId] || [];
    const avgDuration = durations.length
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : null;

    return {
      formId,
      title: form.title,
      createdAt: form.createdAt,
      responseCount: count,
      averageDurationSeconds: avgDuration,
    };
  });

  // Calculate overall average
  let totalDurationSum = 0;
  let totalResponsesWithDuration = 0;
  Object.values(durationMap).forEach(durations => {
    totalDurationSum += durations.reduce((a, b) => a + b, 0);
    totalResponsesWithDuration += durations.length;
  });

  const overallAvgDurationSeconds = totalResponsesWithDuration > 0
    ? totalDurationSum / totalResponsesWithDuration
    : null;

  return {
    totalForms: formsSnapshot.size,
    totalResponses: submissionsSnapshot.size,
    responsesPerForm,
    overallAvgDurationSeconds,
  };
}

/**
 * Fetches all submissions for a given formId.
 * Returns an array of submission objects (id + data).
 */
async function getSubmissionsByFormId(formId) {
  if (!formId) throw new Error('formId is required');
  const snapshot = await db.collection('formSubmissions').where('formId', '==', formId).get();
  const submissions = [];
  snapshot.forEach(doc => {
    //submissions.push({ id: doc.id, ...doc.data().elements });
    submissions.push({ ...doc.data().data });
  });
  return submissions;
}

module.exports = {
  getDashboardSummary,
  db, // Export db if you want to use it elsewhere
  getSubmissionsByFormId,
};
