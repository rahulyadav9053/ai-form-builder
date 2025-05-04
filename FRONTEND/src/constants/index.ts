export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  FORMS: "/forms",
  BUILDER: (formId: string = "new") => `/builder/${formId}`,
  ANALYSIS: (formId: string) => `/analysis/${formId}`,
  FORM: (formId: string) => `/forms/${formId}`,
};

export const COLLECTIONS = {
  FORM_CONFIGS: "formConfigs",
  FORM_SUBMISSIONS: "formSubmissions",
};

export const ENDPOINTS = {
  DASHBOARD: '/api/dashboard',
  ANALYSIS: '/api/dashboard/analysis',
};
