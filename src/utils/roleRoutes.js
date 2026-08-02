export const ROLE_ROUTES = {
  tenant: "/",
  student: "/",
  landlord: "/landlord/dashboard",
  agent: "/agentdashboard/home",
  admin: "/admindashboard/home",
};

export const getRoleRoute = (role) => {
  return ROLE_ROUTES[role] || "/";
};