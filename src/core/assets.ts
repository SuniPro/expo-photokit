import SuniPhotoKitModule from '../SuniPhotoKitModule';
import type { NativeGalleryAsset } from '../SuniPhotoKit.types';

export type PhotoAsset = NativeGalleryAsset & {
  uri: string;
  thumbnailUri: string | null;
};

export function toPhotoAsset(asset: NativeGalleryAsset): PhotoAsset {
  return {
    ...asset,
    uri: `ph://${asset.id}`,
    thumbnailUri: null,
  };
}

export async function getPhotoAssetsPage(
  albumId: string,
  first = 1000,
  after: string | null = null,
) {
  if (!albumId) {
    throw new Error('albumId is required');
  }

  const pageSize = Number.isFinite(first) ? Math.max(1, Math.floor(first)) : 1000;

  const result = await SuniPhotoKitModule.getAssetsInAlbum(albumId, pageSize, after);

  return {
    ...result,
    assets: result.assets.map(toPhotoAsset),
  };
}

export async function getOriginalPhotoAsset(assetId: string): Promise<string> {
  if (!assetId) {
    throw new Error('assetId is required');
  }

  return SuniPhotoKitModule.getOriginalAsset(assetId);
}
