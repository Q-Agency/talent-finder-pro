export interface PropertyItem {
  valueId: string;
  readableValue: string;
}

// Roles have different field names in the API
export interface RoleItem {
  id: string;
  value: string;
}

// Verticals use id/value like roles
export interface VerticalItem {
  id: string;
  value: string;
}

export interface PropertiesResponse {
  industries: PropertyItem[];
  roles: RoleItem[];
  skills: PropertyItem[];
  certificates: PropertyItem[];
  verticals: VerticalItem[];
}

const TEST_URL = 'https://infinite-wasp-terminally.ngrok-free.app/webhook-test/resourcing_get_properties';
const PROD_URL = 'https://infinite-wasp-terminally.ngrok-free.app/webhook/resourcing_get_properties';

export async function fetchProperties(isTestMode: boolean): Promise<PropertiesResponse> {
  const url = isTestMode ? TEST_URL : PROD_URL;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch properties: ${response.status}`);
  }

  const data = await response.json();
  
  // Response is wrapped in an array
  const result = Array.isArray(data) ? data[0] : data;
  
  return {
    industries: result.industries || [],
    roles: result.roles || [],
    skills: result.skills || [],
    certificates: result.certificates || [],
    verticals: result.verticals || [],
  };
}
