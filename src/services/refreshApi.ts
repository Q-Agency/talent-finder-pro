const BASE_URLS = {
  public: 'https://infinite-wasp-terminally.ngrok-free.app',
  local: 'http://192.168.20.70:5678',
};

const getRefreshUrl = (isTestMode: boolean, isLocalNetwork: boolean) => {
  const baseUrl = isLocalNetwork ? BASE_URLS.local : BASE_URLS.public;
  const path = isTestMode ? '/webhook-test/resources_refresh_dataset' : '/webhook/resources_refresh_dataset';
  return `${baseUrl}${path}`;
};

export async function refreshDataset(isTestMode: boolean, isLocalNetwork: boolean = false): Promise<{ success: boolean; message?: string }> {
  const url = getRefreshUrl(isTestMode, isLocalNetwork);
  
  // Use AbortController with 60 second timeout since refresh takes 10-20 seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to refresh dataset: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, message: result.message };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out after 60 seconds');
    }
    throw error;
  }
}
