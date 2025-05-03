const { getDashboardSummary } = require('../services/firestoreService');

exports.getDashboardData = async (req, res) => {
    try {
      const data = await getDashboardSummary();
      res.json(data);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
      }
};
