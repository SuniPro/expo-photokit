import SuniPhotoKitModule from '../SuniPhotoKitModule';

export type ThumbnailResult = Record<string, string | null>;

export class PhotoThumbnailLoader {
  private pending = new Set<string>();

  async load(
    assetIds: string[],
    options: {
      width: number;
      height: number;
      exclude?: (id: string) => boolean;
    },
  ): Promise<ThumbnailResult> {
    const ids = [...new Set(assetIds)].filter(
      (id) => Boolean(id) && !this.pending.has(id) && !options.exclude?.(id),
    );

    if (ids.length === 0) {
      return {};
    }

    ids.forEach((id) => this.pending.add(id));

    try {
      return await SuniPhotoKitModule.getThumbnailBatch(ids, {
        width: options.width,
        height: options.height,
      });
    } finally {
      ids.forEach((id) => this.pending.delete(id));
    }
  }
}
