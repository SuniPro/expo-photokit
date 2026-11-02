import * as MediaLibrary from 'expo-media-library';

export const requestPhotoPermission = async (): Promise<boolean> => {
  const current = await MediaLibrary.getPermissionsAsync();

  if (current.granted || current.accessPrivileges === 'limited') {
    return true;
  }

  const next = await MediaLibrary.requestPermissionsAsync(false, ['photo', 'video']);

  return next.granted || next.accessPrivileges === 'limited';
};
