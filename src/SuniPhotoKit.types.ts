import type { StyleProp, ViewStyle } from 'react-native';

export type OnLoadEventPayload = {
  url: string;
};

export type ChangeEventPayload = {
  value: string;
};

export type JpMediaThumbnailsViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};

export type ThumbnailQuality = {
  width: number;
  height: number;
};

export type ThumbnailOptions = {
  width: number;
  height: number;
  quality?: ThumbnailQuality;
};

/**
 * Native stamps each onThumbnailReady event with the sourceGeneration that was
 * active when the underlying request/preload work started.
 *
 * This is intentionally *not* the generation at emit time.
 *
 * JS stores the latest accepted generation in a ref and ignores events whose
 * sourceGeneration is older, which prevents late events from a previous album
 * or source from mutating the current screen state.
 */
export type JpMediaThumbnailsModuleEvents = Record<string, never>;

export type ThumbnailBatchResult = Record<string, string | null>;

export type SystemAlbumKey = 'recent' | 'favorites' | 'videos';

export type NativeAlbum = {
  id: string;
  title: string;
  count: number;
  type: 'smart' | 'user';
  systemKey?: SystemAlbumKey;
};

export type NativeGalleryAsset = {
  id: string;
  mediaType: 'photo' | 'video';
  width: number;
  height: number;
  duration?: number;
};

export type NativeAlbumAssetsResult = {
  assets: NativeGalleryAsset[];
  hasNextPage: boolean;
  endCursor: string | null;
};
