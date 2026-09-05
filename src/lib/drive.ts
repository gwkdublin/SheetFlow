export const getDriveAccessToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_OAUTH_CLIENT_ID;
    if (!clientId) {
      reject(new Error("OAuth Client ID is not configured"));
      return;
    }
    
    // @ts-ignore
    if (!window.google || !window.google.accounts) {
      reject(new Error("Google Identity Services script not loaded"));
      return;
    }

    // @ts-ignore
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (response: any) => {
        if (response.error !== undefined) {
          reject(response);
        }
        resolve(response.access_token);
      },
    });

    client.requestAccessToken();
  });
};

export const saveToDrive = async (filename: string, content: string, mimeType: string, token: string) => {
  const metadata = {
    name: filename,
    mimeType: mimeType,
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: mimeType }));

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to save to Google Drive: ${errorText}`);
  }

  return response.json();
};
