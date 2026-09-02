export interface UploadedMedia {
  id: string;
  url: string;
  original_name: string;
  mime_type: string;
  size: number;
  width?: number | null;
  height?: number | null;
}

interface UploadSignature {
  cloud_name: string;
  api_key: string;
  timestamp: number;
  folder: string;
  public_id: string;
  signature: string;
}

interface CloudinaryUpload {
  secure_url?: string;
  public_id?: string;
  width?: number;
  height?: number;
  bytes?: number;
}

async function readJson<T>(response: Response): Promise<T> {
  try {
    return await response.json() as T;
  } catch {
    return {} as T;
  }
}

async function uploadThroughServer(file: File, altText: string): Promise<UploadedMedia> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("alt_text", altText);

  const response = await fetch("/api/v1/media", { method: "POST", body: formData });
  const json = await readJson<{ success?: boolean; error?: string; data?: UploadedMedia }>(response);
  if (!response.ok || !json.success || !json.data?.url) {
    throw new Error(json.error || "Upload failed");
  }
  return json.data as UploadedMedia;
}

export async function uploadMediaFile(file: File, altText = ""): Promise<UploadedMedia> {
  // Keep the existing server path available for local/non-Cloudinary deployments.
  if (file.size <= 4 * 1024 * 1024) {
    try {
      return await uploadThroughServer(file, altText);
    } catch (error) {
      // Fall through to the signed path if the server path is unavailable or
      // the deployment has Cloudinary configured.
      if (error instanceof Error && !/Payload|payload|body|413|too large/i.test(error.message)) {
        throw error;
      }
    }
  }

  const signatureResponse = await fetch("/api/v1/media/signature", { method: "POST" });
  const signatureJson = await readJson<{ success?: boolean; error?: string; data?: UploadSignature }>(signatureResponse);
  if (!signatureResponse.ok || !signatureJson.success || !signatureJson.data) {
    throw new Error(signatureJson.error || "Direct upload is not available");
  }
  const signature = signatureJson.data as UploadSignature;

  const cloudinaryForm = new FormData();
  cloudinaryForm.append("file", file);
  cloudinaryForm.append("api_key", signature.api_key);
  cloudinaryForm.append("timestamp", String(signature.timestamp));
  cloudinaryForm.append("folder", signature.folder);
  cloudinaryForm.append("public_id", signature.public_id);
  cloudinaryForm.append("signature", signature.signature);

  const cloudinaryResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloud_name)}/auto/upload`,
    { method: "POST", body: cloudinaryForm }
  );
  const cloudinaryJson = await readJson<CloudinaryUpload & { error?: { message?: string } }>(cloudinaryResponse);
  if (!cloudinaryResponse.ok || !cloudinaryJson.secure_url) {
    throw new Error(cloudinaryJson.error?.message || "Cloudinary upload failed");
  }

  // Register the already-uploaded asset with the app using a small JSON request.
  // This avoids sending the file through a Vercel serverless function.
  const registerResponse = await fetch("/api/v1/media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: cloudinaryJson.secure_url,
      alt_text: altText,
      original_name: file.name,
      mime_type: file.type,
      size: file.size,
      width: cloudinaryJson.width,
      height: cloudinaryJson.height,
      public_id: cloudinaryJson.public_id,
    }),
  });
  const registerJson = await readJson<{ success?: boolean; error?: string; data?: UploadedMedia }>(registerResponse);
  if (!registerResponse.ok || !registerJson.success || !registerJson.data?.url) {
    throw new Error(registerJson.error || "Uploaded file could not be registered");
  }
  return registerJson.data as UploadedMedia;
}
