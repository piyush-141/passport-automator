const fs = require('fs');
const path = require('path');

const usageFilePath = path.join(__dirname, '../../storage/usage.json');
const MAX_LIMIT = 100;

function getUsageData() {
  try {
    if (!fs.existsSync(usageFilePath)) {
      const defaultData = { successfulGenerations: 0 };
      fs.writeFileSync(usageFilePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const data = fs.readFileSync(usageFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading usage data:', error);
    return { successfulGenerations: 0 };
  }
}

function incrementUsage() {
  try {
    const data = getUsageData();
    data.successfulGenerations += 1;
    fs.writeFileSync(usageFilePath, JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error incrementing usage:', error);
    throw new Error('Failed to update usage');
  }
}

function getUsageStats() {
  const data = getUsageData();
  const used = data.successfulGenerations;
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
