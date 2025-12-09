import { useState, useEffect, useRef } from 'react';
import { fetchProperties, PropertiesResponse } from '@/services/propertiesApi';

interface UsePropertiesResult {
  properties: PropertiesResponse | null;
  isLoading: boolean;
  error: string | null;
}

// Cache to store fetched properties per mode
const propertiesCache: { test: PropertiesResponse | null; prod: PropertiesResponse | null } = {
  test: null,
  prod: null,
};

export function useProperties(isTestMode: boolean): UsePropertiesResult {
  const [properties, setProperties] = useState<PropertiesResponse | null>(
    isTestMode ? propertiesCache.test : propertiesCache.prod
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef<{ test: boolean; prod: boolean }>({ test: false, prod: false });

  useEffect(() => {
    const cacheKey = isTestMode ? 'test' : 'prod';
    
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
  }, [isTestMode]);

  return { properties, isLoading, error };
}
