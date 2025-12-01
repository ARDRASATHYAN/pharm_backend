const cron = require('node-cron');
const db = require('../models');
const { RefreshToken } = db;
const { Op } = require('sequelize');

function startCleanupJob() {
  // Schedule: every day at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      const deleted = await RefreshToken.destroy({
        where: {
          [Op.or]: [
            { revoked: true },                        // revoked tokens
            { expires_at: { [Op.lt]: new Date() } },  // expired tokens
          ],
        },
      });

      if (deleted) {
        console.log(`🧹 Cleaned up ${deleted} old/invalid refresh tokens`);
      }
    } catch (err) {
      console.error('❌ Cleanup job error:', err);
    }
  });
}

module.exports = startCleanupJob;
