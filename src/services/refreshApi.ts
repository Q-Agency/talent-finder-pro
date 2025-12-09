const TEST_URL = 'https://infinite-wasp-terminally.ngrok-free.app/webhook-test/resources_refresh_dataset';
const PROD_URL = 'https://infinite-wasp-terminally.ngrok-free.app/webhook/resources_refresh_dataset';

export async function refreshDataset(isTestMode: boolean): Promise<{ success: boolean; message?: string }> {
  const url = isTestMode ? TEST_URL : PROD_URL;
  
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
