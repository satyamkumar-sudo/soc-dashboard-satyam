export const fetchSummary = () =>
  Promise.resolve({
    iamChangesToday: 14,
    anomaliesDetected: 3,
    riskScore: 76,
    systemHealth: "DEGRADED",
  });

export const fetchIamActivities = () =>
  Promise.resolve([
    {
      time: "02:43 AM",
      actor: "admin@org.com",
      action: "OWNER_ROLE_GRANTED",
      resource: "prod-project",
      risk: "HIGH",
    },
    {
      time: "10:12 AM",
      actor: "ci-bot@org.com",
      action: "SERVICE_ACCOUNT_CREATED",
      resource: "billing-service",
      risk: "MEDIUM",
    },
  ]);

export const fetchAnomalies = () =>
  Promise.resolve({
    baseline: 3,
    data: [
      { time: "01:00", events: 2 },
      { time: "02:00", events: 18 },
      { time: "03:00", events: 4 },
    ],
    anomalies: ["02:00"],
  });
