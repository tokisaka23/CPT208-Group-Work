const localGardenAssetEntries = import.meta.glob(
  [
    '../assets/gardens/*.jpg',
    '../assets/gardens/*.jpeg',
    '../assets/gardens/*.png',
    '../assets/gardens/*.webp',
    '../assets/gardens/*.avif',
  ],
  {
    eager: true,
    import: 'default',
  },
);

const localGardenAssets = Object.fromEntries(
  Object.entries(localGardenAssetEntries).map(([filePath, assetUrl]) => {
    const fileName = filePath.split('/').pop() || '';
    const assetKey = fileName.replace(/\.[^.]+$/, '');
    return [assetKey, assetUrl];
  }),
);

const pickGardenAsset = (candidates, fallback) => {
  const matchedAsset = candidates.map((key) => localGardenAssets[key]).find(Boolean);
  return matchedAsset || fallback;
};

export const resolveGardenCardImage = (slug, fallback) =>
  pickGardenAsset([slug, `${slug}-card`, `${slug}-cover`], fallback);

export const resolveGardenHeroImage = (slug, fallback) =>
  pickGardenAsset([slug, `${slug}-hero`, `${slug}-cover`], fallback);

export const resolveGardenGalleryImage = (slug, index, fallback) =>
  pickGardenAsset(
    [`${slug}${index + 1}`, `${slug}-gallery-${index + 1}`, `${slug}-gallery`],
    fallback,
  );