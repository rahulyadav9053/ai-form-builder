const { getDashboardSummary, getSubmissionsByFormId: getSubmissionsByFormIdService } = require('../services/firestoreService');

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
    res.json({ submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};
