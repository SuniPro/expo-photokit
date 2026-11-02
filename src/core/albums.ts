import SuniPhotoKitModule from '../SuniPhotoKitModule';

export async function getPhotoAlbums() {
  const albums = await SuniPhotoKitModule.getAlbums();

  return {
    albums,
    systemAlbumIds: {
      recent: albums.find((album) => album.systemKey === 'recent')?.id ?? null,
      favorites: albums.find((item) => item.systemKey === 'favorites')?.id ?? null,
      videos: albums.find((item) => item.systemKey === 'videos')?.id ?? null,
    },
  };
}
