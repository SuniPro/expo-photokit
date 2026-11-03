# @suni_pro/expo-photokit

Native iOS PhotoKit utilities for Expo and React Native.

Access photo albums, browse assets with pagination, generate thumbnails, preload images, and export original media files through a simple TypeScript API.

## Platform Support

| Platform | Status |
| --- | --- |
| iOS | ✅ Supported |
| Android | 🚧 Coming Soon |

> **Android support is coming soon!** We're actively working on bringing the same photo gallery features to Android. Stay tuned for future updates.

Currently, the package supports iOS through Apple's native PhotoKit framework. Android support will be added in an upcoming release.

## Features

- **Photo albums** — Retrieve user and system albums, including Recents, Favorites, and Videos.
- **Asset pagination** — Load photo and video assets incrementally.
- **Thumbnails** — Generate and cache thumbnails for individual assets or batches.
- **Preloading** — Preload thumbnails to improve gallery scrolling performance.
- **Original media** — Export original PhotoKit resources to local file URIs.
- **Expo Modules** — Native Swift implementation compatible with Expo development builds.

## Requirements

- Expo / React Native
- iOS
- A development build or production build with native modules enabled

> **Platform support:** iOS only. Android is not currently implemented.
>
> This package requires native code and cannot be tested using Expo Go alone.

## Installation

```bash
npm install @suni_pro/expo-photokit
```

Or with Yarn:

```bash
yarn add @suni_pro/expo-photokit
```

Rebuild your iOS application after installation:

```bash
npx expo run:ios --device
```

For EAS Build, include the package in your project dependencies and create a new native build.

## Quick Start

### Get photo albums

```ts
import { getPhotoAlbums } from '@suni_pro/expo-photokit';

const { albums, systemAlbumIds } = await getPhotoAlbums();

console.log(albums);
console.log(systemAlbumIds.recent);
```

### Get assets from an album

```ts
import { getPhotoAssetsPage } from '@suni_pro/expo-photokit';

const page = await getPhotoAssetsPage(albumId, 100);

console.log(page.assets);
console.log(page.hasNextPage);
console.log(page.endCursor);
```

Load the next page using the returned cursor:

```ts
if (page.hasNextPage && page.endCursor) {
  const nextPage = await getPhotoAssetsPage(
    albumId,
    100,
    page.endCursor
  );
}
```

### Load thumbnails

```ts
import { PhotoThumbnailLoader } from '@suni_pro/expo-photokit';

const thumbnails = await PhotoThumbnailLoader.load(
  assets.map((asset) => asset.id),
  { width: 300, height: 300 }
);
```

### Export original media

```ts
import { getOriginalPhotoAsset } from '@suni_pro/expo-photokit';

const fileUri = await getOriginalPhotoAsset(assetId);

console.log(fileUri);
// file:///.../expo-photokit-originals/...
```

The returned URI points to a temporary local file. The exported resource retains its original file format rather than being converted to JPEG.

## API Reference

| API | Description |
| --- | --- |
| `getPhotoAlbums()` | Retrieve available photo albums and system album IDs |
| `getPhotoAssetsPage(albumId, first?, after?)` | Fetch a paginated list of assets |
| `PhotoThumbnailLoader.load(ids, options)` | Load thumbnails for multiple assets |
| `getOriginalPhotoAsset(assetId)` | Export an original PhotoKit resource to a local file URI |
| `requestPhotoPermission()` | Request photo library access |

### Album

```ts
type NativeAlbum = {
  id: string;
  title: string;
  count: number;
  type: 'smart' | 'user';
  systemKey?: 'recent' | 'favorites' | 'videos';
};
```

### Asset

An asset includes the following fields:

```ts
type GalleryAsset = {
  id: string;
  uri: string;
  thumbnailUri: string | null;
  mediaType: 'photo' | 'video';
  width: number;
  height: number;
  duration?: number;
};
```

## Example: Photo Gallery

Build a native iOS photo gallery with album selection, cursor-based pagination, and on-demand thumbnail loading.

### Features

- Photo library permission handling
- System and user album selection
- Cursor-based asset pagination
- On-demand thumbnail loading for visible assets
- Loading states and error handling

### Usage in Your Project

When using this example in your own project, import the APIs directly from the npm package:

```tsx
import SuniPhotoKitModule, {
  getPhotoAlbums,
  getPhotoAssetsPage,
  PhotoThumbnailLoader,
  requestPhotoPermission,
  type NativeAlbum,
} from '@suni_pro/expo-photokit';
```

> **Note:** The example source uses relative imports for internal development. Replace them with the package imports shown above when copying the example into your own project.

### Dependencies

Install `expo-image` to render thumbnails:

```bash
npx expo install expo-image
```

### Complete Example

See the full implementation in [`examples/GalleryExample.tsx`](./examples/GalleryExample.tsx).

This example uses React state and React Native components without requiring an external state management library.

**Platform support:** iOS is supported. Android support is coming soon.

## Important Notes

### Photo library permissions

Your application must request appropriate photo library permissions before accessing assets. Configure the required iOS permission descriptions in your Expo app configuration.

### Asset URIs

PhotoKit asset identifiers and local file URIs serve different purposes.

- `ph://...` identifies an asset in the Photos library.
- `file://...` points to a local file that image components or file-processing APIs can access.

Use the original media export API when a local file URI is required.

### Temporary files

Exported originals and generated thumbnails are stored in temporary app storage. Temporary files may be removed by the operating system and should not be treated as permanent storage.

### iCloud assets

Fetching an asset stored in iCloud may require a network connection and additional loading time.

## License

Specify the license under which you distribute this package.
