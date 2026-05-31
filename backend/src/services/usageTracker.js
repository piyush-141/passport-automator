const MAX_LIMIT = 100;

// In-memory usage counter (resets on server restart, safe for ephemeral filesystems like Render)
let successfulGenerations = 0;

function getUsageData() {
  return { successfulGenerations };
}

function incrementUsage() {
  successfulGenerations += 1;
  return { successfulGenerations };
}

function getUsageStats() {
  const used = successfulGenerations;
  return {
    used,
    limit: MAX_LIMIT,
    remaining: Math.max(0, MAX_LIMIT - used)
  };
}

module.exports = {
  getUsageData,
  incrementUsage,
  getUsageStats,
  MAX_LIMIT
};
