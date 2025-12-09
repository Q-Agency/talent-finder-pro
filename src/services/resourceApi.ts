import { Filters } from '@/components/FilterSidebar';

const API_ENDPOINTS = {
  test: 'https://infinite-wasp-terminally.ngrok-free.app/webhook-test/api/resources/search',
  production: 'https://infinite-wasp-terminally.ngrok-free.app/webhook/api/resources/search',
};

export interface ResourceSkills {
  senior: string[];
  mid: string[];
  junior: string[];
}

export interface Resource {
  resource_id: string;
  resource_name: string;
  role_category: string;
  seniority_level: string;
  technical_domain: string;
  skills: ResourceSkills;
  industries: string[];
  employment_type: string;
  vertical: string;
  certificates?: string[];
  similarity_score?: number;
  match_reasons?: string[];
  description?: string;
  notes?: string;
  superior?: string;
  el?: string;
  eh?: string;
  director?: string;
  department?: string;
}

export interface SearchResponse {
  success: boolean;
  count: number;
  filters_applied: Record<string, unknown>;
  results: Resource[];
  metadata: {
    query_time_ms: number;
    semantic_search_used: boolean;
  };
}

interface SearchRequestBody {
  filters: {
    role?: string[];
    seniority?: string[];
    skills?: string[];
    industries?: string[];
    employment_type?: string[];
    vertical?: string[];
    domain?: string[];
    certificates?: string[];
  };
  search: {
    query: string;
    use_semantic: boolean;
  };
  options: {
    limit: number;
    include_availability: boolean;
    min_similarity: number;
  };
}

export async function searchResources(
  filters: Filters,
  searchQuery: string,
  isTestMode: boolean
): Promise<SearchResponse> {
  const endpoint = isTestMode ? API_ENDPOINTS.test : API_ENDPOINTS.production;

  const requestBody: SearchRequestBody = {
    filters: {
      ...(filters.roleTitles.length > 0 && { role: filters.roleTitles }),
      ...(filters.seniorities.length > 0 && { seniority: filters.seniorities }),
      ...(filters.skills.length > 0 && { skills: filters.skills }),
      ...(filters.industries.length > 0 && { industries: filters.industries }),
      ...(filters.employmentTypes.length > 0 && { employment_type: filters.employmentTypes.map(t => t.toLowerCase()) }),
      ...(filters.certificates.length > 0 && { certificates: filters.certificates }),
    },
    search: {
      query: searchQuery,
      use_semantic: searchQuery.length > 0,
    },
    options: {
      limit: 300,
      include_availability: true,
      min_similarity: 0.3,
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  
  // API returns array with single response object
  if (Array.isArray(data) && data.length > 0) {
    const result = data[0];
    // Filter out undefined/null results
    if (result?.results) {
      result.results = result.results.filter((r: Resource | undefined) => r && r.resource_id);
    }
    return result;
  }
  
  // Handle case where data itself has results
  if (data?.results) {
    data.results = data.results.filter((r: Resource | undefined) => r && r.resource_id);
    return data;
  }
  
  // Return empty results if no valid data
  return {
    success: true,
    count: 0,
    filters_applied: {},
    results: [],
    metadata: { query_time_ms: 0, semantic_search_used: false }
  };
}
