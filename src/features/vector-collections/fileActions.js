export function openFilePreview({ blob, contentType }) {
  const fileBlob = blob.type ? blob : new Blob([blob], { type: contentType });
  const objectUrl = URL.createObjectURL(fileBlob);
  const opened = window.open(objectUrl, '_blank', 'noopener,noreferrer');

  if (!opened) {
    URL.revokeObjectURL(objectUrl);
    throw new Error('Tab baru tidak bisa dibuka. Izinkan pop-up browser lalu coba lagi.');
  }

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}

export function downloadFile({ blob, contentType, filename, fallbackName }) {
  const fileBlob = blob.type ? blob : new Blob([blob], { type: contentType });
  const objectUrl = URL.createObjectURL(fileBlob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename || fallbackName || 'collection-file';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}
