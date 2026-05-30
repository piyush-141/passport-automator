const BASE_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? 'https://passcopy-backend-2.onrender.com' : '/api');

export interface UsageStats {
  used: number;
  limit: number;
  remaining: number;
}

export async function fetchUsageStats(): Promise<UsageStats> {
  const response = await fetch(`${BASE_URL}/usage`);
  if (!response.ok) {
    throw new Error('Failed to fetch usage stats');
  }
  return response.json();
}

export async function processWhiteBackgroundApi(file: File): Promise<Blob> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${BASE_URL}/white-background`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred while processing the image';
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  return response.blob();
}
