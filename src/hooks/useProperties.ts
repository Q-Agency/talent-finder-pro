import { useState, useEffect, useRef } from 'react';
import { fetchProperties, PropertiesResponse } from '@/services/propertiesApi';

interface UsePropertiesResult {
  properties: PropertiesResponse | null;
  isLoading: boolean;
  error: string | null;
}

// Cache key format: "test", "prod"
const propertiesCache: Record<string, PropertiesResponse | null> = {};

export function useProperties(isTestMode: boolean): UsePropertiesResult {
  const cacheKey = isTestMode ? 'test' : 'prod';
  
  const [properties, setProperties] = useState<PropertiesResponse | null>(
    propertiesCache[cacheKey] || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    // Only fetch if not already cached
    if (propertiesCache[cacheKey]) {
      setProperties(propertiesCache[cacheKey]);
      return;
    }
    
    // Only fetch if not already fetching
    if (fetchedRef.current[cacheKey]) {
      return;
    }
    
    fetchedRef.current[cacheKey] = true;
    
    const loadProperties = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await fetchProperties(isTestMode);
        propertiesCache[cacheKey] = result;
        setProperties(result);
      } catch (err) {
        console.error('Failed to fetch properties:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch properties');
        fetchedRef.current[cacheKey] = false; // Allow retry on error
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProperties();
  }, [isTestMode, cacheKey]);

  return { properties, isLoading, error };
}
