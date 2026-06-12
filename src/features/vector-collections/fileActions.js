export function reserveFilePreviewTab() {
  const opened = window.open('', '_blank');

  if (!opened) {
    throw new Error('Tab baru tidak bisa dibuka. Izinkan pop-up browser lalu coba lagi.');
  }

  opened.opener = null;
  opened.document.title = 'Memuat file...';
  opened.document.body.textContent = 'Memuat file collection...';
  return opened;
}

export function openFilePreview({ blob, contentType }, targetWindow) {
  const fileBlob = blob.type ? blob : new Blob([blob], { type: contentType });
  const objectUrl = URL.createObjectURL(fileBlob);
  const opened = targetWindow || window.open(objectUrl, '_blank', 'noopener,noreferrer');

  if (!opened) {
    URL.revokeObjectURL(objectUrl);
    throw new Error('Tab baru tidak bisa dibuka. Izinkan pop-up browser lalu coba lagi.');
  }

  if (targetWindow) {
    opened.location.href = objectUrl;
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
