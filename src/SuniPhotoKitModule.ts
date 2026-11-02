import { NativeModule, requireNativeModule } from 'expo';
import type {
  NativeAlbum,
  NativeAlbumAssetsResult,
  ThumbnailBatchResult,
  ThumbnailOptions,
} from './SuniPhotoKit.types';

declare class SuniPhotoKitModule extends NativeModule<Record<string, never>> {
  getAlbums(): Promise<Array<NativeAlbum>>;

  getAssetsInAlbum(
    albumId: string,
    first: number,
    after?: string | null,
  ): Promise<NativeAlbumAssetsResult>;

  getThumbnailBatch(assetIds: string[], options: ThumbnailOptions): Promise<ThumbnailBatchResult>;

  getOriginalAsset(assetId: string): Promise<string>;

  stopPreloading(): Promise<null>;
}

export default requireNativeModule<SuniPhotoKitModule>('SuniPhotoKit');
