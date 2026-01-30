// mockData.js - Simulates GCP logs and AI anomaly detection

/**
 * Generate realistic mock security logs
 */
export function generateMockLogs() {
  const logs = [];
  const now = new Date();
  
  const users = [
    'john.doe@company.com',
    'jane.smith@company.com',
    'admin@company.com',
    'bob.johnson@company.com',
    'alice.williams@company.com',
    'charlie.brown@company.com',
    'service-account@company.com'
  ];
  
  const ipAddresses = [
    '192.168.1.100',
    '192.168.1.101',
    '192.168.1.102',
    '10.0.0.50',
    '10.0.0.51',
    // Suspicious IPs
    '45.123.45.67',  // Russia
    '123.45.67.89',  // China
    '201.45.67.89',  // Brazil
  ];
  
  // Generate logs for the past 24 hours
  for (let i = 0; i < 500; i++) {
    const hoursAgo = Math.random() * 24;
    const timestamp = new Date(now - hoursAgo * 60 * 60 * 1000);
    const user = users[Math.floor(Math.random() * users.length)];
    const ip = ipAddresses[Math.floor(Math.random() * ipAddresses.length)];
    
    // 80% success, 20% failure for variety
    const isFailure = Math.random() < 0.2;
    
    logs.push({
      id: `log_${i}`,
      timestamp: timestamp,
      type: isFailure ? 'login_failure' : 'login_success',
      user: user,
      sourceIp: ip,
      method: 'google.login.LoginService.' + (isFailure ? 'loginFailure' : 'loginSuccess'),
      country: getCountryFromIP(ip)
    });
  }
  
  // Add some IAM change logs
  for (let i = 0; i < 20; i++) {
    const hoursAgo = Math.random() * 24;
    const timestamp = new Date(now - hoursAgo * 60 * 60 * 1000);
    
    logs.push({
      id: `iam_${i}`,
      timestamp: timestamp,
      type: 'iam_change',
      user: users[Math.floor(Math.random() * users.length)],
      sourceIp: ipAddresses[Math.floor(Math.random() * 3)], // Only local IPs for IAM
      method: getRandomIAMMethod(),
      resource: `projects/my-project/serviceAccounts/sa-${i}@my-project.iam.gserviceaccount.com`
    });
  }
  
  return logs;
}

/**
 * AI-POWERED ANOMALY DETECTION
 * This is the "intelligence" that analyzes logs and detects threats
 */
export function detectAnomalies(logs) {
  const anomalies = [];
  const iamChanges = [];
  
  // 1. DETECT BRUTE FORCE ATTACKS
  const failedAttempts = {};
  logs.filter(l => l.type === 'login_failure').forEach(log => {
    const key = `${log.sourceIp}_${log.user}`;
    failedAttempts[key] = failedAttempts[key] || { count: 0, logs: [] };
    failedAttempts[key].count++;
    failedAttempts[key].logs.push(log);
  });
  
  Object.entries(failedAttempts).forEach(([key, data]) => {
    if (data.count >= 5) {
      const [ip, user] = key.split('_');
      anomalies.push({
        id: `brute_${Date.now()}_${Math.random()}`,
        timestamp: data.logs[0].timestamp,
        severity: data.count > 10 ? 'critical' : 'medium',
        type: 'brute_force',
        description: `${data.count} failed login attempts for ${user}`,
        user: user,
        sourceIp: ip,
        confidence: Math.min(95, 70 + data.count * 2)
      });
    }
  });
  
  // 2. DETECT UNUSUAL LOGIN VOLUMES (Z-Score Analysis)
  const userLoginCounts = {};
  logs.filter(l => l.type === 'login_success').forEach(log => {
    userLoginCounts[log.user] = (userLoginCounts[log.user] || 0) + 1;
  });
  
  const counts = Object.values(userLoginCounts);
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
  const stdDev = Math.sqrt(
    counts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / counts.length
  );
  
  Object.entries(userLoginCounts).forEach(([user, count]) => {
    const zScore = (count - mean) / stdDev;
    if (zScore > 2) { // More than 2 standard deviations
      anomalies.push({
        id: `volume_${Date.now()}_${Math.random()}`,
        timestamp: new Date(),
        severity: zScore > 3 ? 'critical' : 'medium',
        type: 'unusual_login',
        description: `User has ${count} logins (avg: ${mean.toFixed(1)}, σ=${zScore.toFixed(2)})`,
        user: user,
        sourceIp: 'multiple',
        confidence: Math.min(95, 60 + zScore * 10)
      });
    }
  });
  
  // 3. DETECT GEOGRAPHIC ANOMALIES
  const userCountries = {};
  logs.filter(l => l.type === 'login_success').forEach(log => {
    if (!userCountries[log.user]) {
      userCountries[log.user] = new Set();
    }
    userCountries[log.user].add(log.country);
  });
  
  Object.entries(userCountries).forEach(([user, countries]) => {
    if (countries.size >= 3) {
      anomalies.push({
        id: `geo_${Date.now()}_${Math.random()}`,
        timestamp: new Date(),
        severity: countries.size >= 5 ? 'critical' : 'medium',
        type: 'geo_anomaly',
        description: `User logged in from ${countries.size} different countries`,
        user: user,
        sourceIp: 'multiple',
        confidence: Math.min(95, 65 + countries.size * 5)
      });
    }
  });
  
  // 4. DETECT SUSPICIOUS IAM CHANGES
  const iamLogs = logs.filter(l => l.type === 'iam_change');
  iamLogs.forEach(log => {
    const hour = new Date(log.timestamp).getHours();
    const day = new Date(log.timestamp).getDay();
    const isOffHours = day === 0 || day === 6 || hour < 8 || hour > 18;
    
    // Add to IAM changes list
    iamChanges.push({
      timestamp: log.timestamp,
      changedBy: log.user,
      action: log.method,
      resource: log.resource
    });
    
    // Flag suspicious ones
    if (isOffHours) {
      anomalies.push({
        id: `iam_${Date.now()}_${Math.random()}`,
        timestamp: log.timestamp,
        severity: 'medium',
        type: 'iam_suspicious',
        description: `IAM change outside business hours: ${log.method}`,
        user: log.user,
        sourceIp: log.sourceIp,
        confidence: 75
      });
    }
    
    // Flag admin/owner role changes
    if (log.method.includes('SetIamPolicy') && log.resource.includes('owner')) {
      anomalies.push({
        id: `privilege_${Date.now()}_${Math.random()}`,
        timestamp: log.timestamp,
        severity: 'critical',
        type: 'privilege_escalation',
        description: `Potential privilege escalation: Admin role granted`,
        user: log.user,
        sourceIp: log.sourceIp,
        confidence: 90
      });
    }
  });
  
  // 5. DETECT LOGIN FROM SUSPICIOUS COUNTRIES
  const suspiciousCountries = ['Russia', 'China', 'North Korea'];
  logs.filter(l => l.type === 'login_success').forEach(log => {
    if (suspiciousCountries.includes(log.country)) {
      anomalies.push({
        id: `suspicious_country_${Date.now()}_${Math.random()}`,
        timestamp: log.timestamp,
        severity: 'medium',
        type: 'geo_anomaly',
        description: `Login from high-risk country: ${log.country}`,
        user: log.user,
        sourceIp: log.sourceIp,
        confidence: 80
      });
    }
  });
  
  // Sort anomalies by severity and time
  anomalies.sort((a, b) => {
    const severityOrder = { critical: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity] || 
           new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  // Sort IAM changes by time
  iamChanges.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return {
    anomalies: anomalies.slice(0, 15), // Top 15 anomalies
    iamChanges: iamChanges.slice(0, 10) // Top 10 IAM changes
  };
}

// Helper functions
function getCountryFromIP(ip) {
  if (ip.startsWith('192.168') || ip.startsWith('10.0')) return 'United States';
  if (ip.startsWith('45.')) return 'Russia';
  if (ip.startsWith('123.')) return 'China';
  if (ip.startsWith('201.')) return 'Brazil';
  return 'Unknown';
}

function getRandomIAMMethod() {
  const methods = [
    'google.iam.admin.v1.CreateServiceAccount',
    'google.iam.admin.v1.DeleteServiceAccount',
    'google.iam.admin.v1.SetIamPolicy',
    'google.iam.admin.v1.CreateServiceAccountKey',
    'google.iam.admin.v1.UpdateServiceAccount'
  ];
  return methods[Math.floor(Math.random() * methods.length)];
}

/**
 * EXPLANATION OF THE "AI" FOR DEMO:
 * 
 * 1. Brute Force Detection (Rule-based)
 *    - Counts failed login attempts
 *    - Flags if > 5 attempts from same IP
 * 
 * 2. Unusual Volume Detection (Statistical - Z-Score)
 *    - Calculates mean and standard deviation of login counts
 *    - Flags users with > 2 standard deviations from mean
 *    - This is actual statistical analysis!
 * 
 * 3. Geographic Anomaly (Pattern Recognition)
 *    - Tracks countries per user
 *    - Flags if logged in from 3+ countries
 * 
 * 4. IAM Suspicious Activity (Rule-based + Time Analysis)
 *    - Checks if changes happened outside business hours
 *    - Flags privilege escalation attempts
 * 
 * 5. High-risk Geography (Threat Intelligence)
 *    - Flags logins from known high-risk countries
 * 
 * For the demo, you can explain that this uses:
 * - Statistical analysis (Z-score)
 * - Pattern recognition
 * - Rule-based detection
 * - Threat intelligence
 * 
 * In production, you'd add:
 * - Machine learning models
 * - Behavioral baselining over time
 * - Real threat intelligence feeds
 * - More sophisticated algorithms
 */