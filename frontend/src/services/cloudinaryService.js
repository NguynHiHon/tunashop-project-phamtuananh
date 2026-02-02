import axios from 'axios';
import { axiosPublic } from '../config/axiosPublic';

const SIGNATURE_ENDPOINT = '/api/cloudinary/signature';

export async function getCloudinarySignature(folder = 'tunashop', upload_preset = null) {
  try {
    const res = await axiosPublic.post(SIGNATURE_ENDPOINT, { folder, upload_preset });
    // if backend returned HTML (e.g., index.html) instead of JSON, throw a clearer error
    if (typeof res.data === 'string' && /^\s*<!doctype/i.test(res.data)) {
      const e = new Error('Signature endpoint trả về HTML (index.html). Kiểm tra baseURL/proxy/backend.');
      e.original = res.data;
      throw e;
    }
    return res.data; // { signature, timestamp, api_key, cloud_name, upload_preset }
  } catch (err) {
    console.error('Failed to get cloudinary signature', err.response?.data || err.message || err);
    throw err;
  }
}

// Upload file to Cloudinary using signed upload returned by backend
export async function uploadFileToCloudinary(file, folder = 'tunashop', upload_preset = null) {
  const sig = await getCloudinarySignature(folder, upload_preset);
  const cloudName = sig.cloud_name;
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  const fd = new FormData();
  fd.append('file', file);
  fd.append('api_key', sig.api_key);
  fd.append('timestamp', sig.timestamp);
  fd.append('signature', sig.signature);
  if (sig.upload_preset) fd.append('upload_preset', sig.upload_preset);
  if (sig.folder) fd.append('folder', sig.folder);

  try {
    // Use plain axios (no withCredentials) to avoid sending credentials and CORS issues
    const res = await axios.post(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    // Cloudinary response contains `secure_url` (or `url`) field
    return res.data;
  } catch (err) {
    // surface cloudinary error details to aid debugging
    console.error('Cloudinary upload error', err.response?.status, err.response?.data || err.message || err);
    // rethrow with helpful message
    const msg = err.response?.data?.error?.message || err.response?.data || err.message || 'Cloudinary upload failed';
    const e = new Error(`Cloudinary upload failed: ${msg}`);
    e.original = err;
    throw e;
  }
}

export default { getCloudinarySignature, uploadFileToCloudinary };
