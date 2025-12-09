const TEST_URL = 'https://infinite-wasp-terminally.ngrok-free.app/webhook-test/resources_refresh_dataset';
const PROD_URL = 'https://infinite-wasp-terminally.ngrok-free.app/webhook/resources_refresh_dataset';

export async function refreshDataset(isTestMode: boolean): Promise<{ success: boolean; message?: string }> {
  const url = isTestMode ? TEST_URL : PROD_URL;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh dataset: ${response.status}`);
  }

  const result = await response.json();
  return { success: true, message: result.message };
}
