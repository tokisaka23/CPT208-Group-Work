export function applyImageFallback(event, fallbackImage) {
  const imageElement = event?.currentTarget;

  if (!imageElement || !fallbackImage || imageElement.dataset.fallbackApplied === 'true') {
    return;
  }

  imageElement.dataset.fallbackApplied = 'true';
  imageElement.src = fallbackImage;
}
