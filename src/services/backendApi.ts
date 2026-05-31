const BASE_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? 'https://passcopy-backend-2.onrender.com' : '/api');

// Helper: fetch with a timeout to handle Render free-tier cold starts (~30s wake up)
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 40000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export interface UsageStats {
  used: number;
  limit: number;
  remaining: number;
}

export async function fetchUsageStats(): Promise<UsageStats> {
  const response = await fetchWithTimeout(`${BASE_URL}/usage`);
  if (!response.ok) {
    throw new Error('Failed to fetch usage stats');
  }
  return response.json();
}

export async function processWhiteBackgroundApi(file: File): Promise<Blob> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetchWithTimeout(`${BASE_URL}/white-background`, {
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
