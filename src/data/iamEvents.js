export const iamEvents = [
  {
    id: 1,
    user: "admin@org.com",
    action: "SetIamPolicy",
    resource: "prod-project",
    severity: "CRITICAL"
  },
  {
    id: 2,
    user: "dev@org.com",
    action: "AddMember",
    resource: "staging-project",
    severity: "HIGH"
  }
];
