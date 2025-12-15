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

import { BASE_URL } from "./apiConfig";

const getPropertiesUrl = (isTestMode: boolean) => {
  const path = isTestMode ? '/webhook-test/resourcing_get_properties' : '/webhook/resourcing_get_properties';
  return `${BASE_URL}${path}`;
};

export async function fetchProperties(isTestMode: boolean): Promise<PropertiesResponse> {
  const url = getPropertiesUrl(isTestMode);
  
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
