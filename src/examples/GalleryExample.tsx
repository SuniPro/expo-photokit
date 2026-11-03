import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewToken,
} from 'react-native';
import { Image } from 'expo-image';
import SuniPhotoKit, {
  getPhotoAlbums,
  getPhotoAssetsPage,
  PhotoThumbnailLoader,
  requestPhotoPermission,
  type NativeAlbum,
} from '@suni_pro/expo-photokit';

type Asset = Awaited<ReturnType<typeof getPhotoAssetsPage>>['assets'][number];

type Session = {
  albumId: string;
  cursor: string | null;
  hasNextPage: boolean;
  loading: boolean;
  thumbnails: PhotoThumbnailLoader;
};

const PAGE_SIZE = 100;
const COLUMNS = 3;

const toError = (error: unknown) => (error instanceof Error ? error.message : String(error));

export default function GalleryExample() {
  const { width } = useWindowDimensions();
  const cellSize = Math.floor(width / COLUMNS);

  const [permission, setPermission] = useState<boolean | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [albums, setAlbums] = useState<NativeAlbum[]>([]);
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const mounted = useRef(false);
  const sessionRef = useRef<Session | null>(null);
  const thumbnailSizeRef = useRef(cellSize);
  thumbnailSizeRef.current = cellSize;

  const loadPage = useCallback(async (session: Session) => {
    if (
      !mounted.current ||
      sessionRef.current !== session ||
      session.loading ||
      !session.hasNextPage
    ) {
      return;
    }

    session.loading = true;
    setLoading(true);

    try {
      const previousCursor = session.cursor;

      const page = await getPhotoAssetsPage(session.albumId, PAGE_SIZE, previousCursor);

      if (!mounted.current || sessionRef.current !== session) return;

      session.cursor = page.endCursor;
      session.hasNextPage =
        page.hasNextPage && page.endCursor !== null && page.endCursor !== previousCursor;

      setAssets((prev) => {
        const existing = new Set(prev.map((asset) => asset.id));
        const incoming = page.assets.filter((asset) => !existing.has(asset.id));

        return incoming.length ? [...prev, ...incoming] : prev;
      });
    } catch (cause) {
      if (mounted.current && sessionRef.current === session) {
        setError(toError(cause));
      }
    } finally {
      session.loading = false;

      if (mounted.current && sessionRef.current === session) {
        setLoading(false);
      }
    }
  }, []);

  const selectAlbum = useCallback(
    (album: NativeAlbum) => {
      if (!mounted.current) return;

      const session: Session = {
        albumId: album.id,
        cursor: null,
        hasNextPage: true,
        loading: false,
        thumbnails: new PhotoThumbnailLoader(),
      };

      sessionRef.current = session;

      setActiveAlbumId(album.id);
      setAssets([]);
      setLoading(false);
      setError(null);

      void loadPage(session);
    },
    [loadPage],
  );

  useEffect(() => {
    mounted.current = true;
    let cancelled = false;

    const initialize = async () => {
      setInitializing(true);
      setPermission(null);
      setError(null);

      try {
        const granted = await requestPhotoPermission();

        if (cancelled) return;

        setPermission(granted);

        if (!granted) return;

        const result = await getPhotoAlbums();

        if (cancelled) return;

        setAlbums(result.albums);

        const initialAlbum =
          result.albums.find((album) => album.systemKey === 'recent') ?? result.albums[0];

        if (initialAlbum) selectAlbum(initialAlbum);
      } catch (cause) {
        if (!cancelled) setError(toError(cause));
      } finally {
        if (!cancelled) setInitializing(false);
      }
    };

    void initialize();

    return () => {
      cancelled = true;
      mounted.current = false;
      sessionRef.current = null;

      void SuniPhotoKit.stopPreloading().catch(() => {});
    };
  }, [retryKey, selectAlbum]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<Asset>[] }) => {
      const session = sessionRef.current;
      if (!session || !mounted.current) return;

      const ids = viewableItems
        .filter(({ item, isViewable }) => isViewable && !item.thumbnailUri)
        .map(({ item }) => item.id);

      if (!ids.length) return;

      void session.thumbnails
        .load(ids, {
          width: thumbnailSizeRef.current,
          height: thumbnailSizeRef.current,
        })
        .then((results) => {
          if (!mounted.current || sessionRef.current !== session) return;

          setAssets((prev) => {
            let changed = false;

            const next = prev.map((asset) => {
              const uri = results[asset.id];

              if (!uri || asset.thumbnailUri) return asset;

              changed = true;
              return { ...asset, thumbnailUri: uri };
            });

            return changed ? next : prev;
          });
        })
        .catch((cause) => {
          if (mounted.current && sessionRef.current === session) {
            setError(toError(cause));
          }
        });
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 1,
  }).current;

  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (permission !== true) {
    return (
      <View style={styles.center}>
        <Text>
          {error ??
            (permission === false
              ? 'Photo library permission is required.'
              : 'Unable to initialize the gallery.')}
        </Text>

        <Button title="Retry" onPress={() => setRetryKey((value) => value + 1)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={albums}
        keyExtractor={(album) => album.id}
        style={styles.albumList}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable onPress={() => selectAlbum(item)} style={styles.albumButton}>
            <Text style={[styles.albumText, item.id === activeAlbumId && styles.activeAlbum]}>
              {item.title}
            </Text>
          </Pressable>
        )}
      />

      <FlatList
        key={COLUMNS}
        data={assets}
        numColumns={COLUMNS}
        keyExtractor={(asset) => asset.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={() => {
          const session = sessionRef.current;
          if (session) void loadPage(session);
        }}
        onEndReachedThreshold={0.3}
        renderItem={({ item }) => (
          <View
            style={{
              width: cellSize,
              height: cellSize,
              padding: 1,
            }}
          >
            {item.thumbnailUri ? (
              <Image source={{ uri: item.thumbnailUri }} style={styles.image} contentFit="cover" />
            ) : (
              <View style={styles.placeholder} />
            )}
          </View>
        )}
        ListFooterComponent={loading ? <ActivityIndicator style={styles.footer} /> : null}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No photos found.</Text> : null}
      />

      {error && (
        <View style={styles.error}>
          <Text>{error}</Text>
          <Button
            title="Retry"
            onPress={() => {
              const session = sessionRef.current;
              if (!session) {
                setRetryKey((value) => value + 1);
                return;
              }

              setError(null);
              void loadPage(session);
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  albumList: {
    flexGrow: 0,
  },
  albumButton: {
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  albumText: {
    color: '#666',
  },
  activeAlbum: {
    color: '#111',
    fontWeight: '700',
  },
  image: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#eee',
  },
  footer: {
    padding: 16,
  },
  empty: {
    padding: 24,
    textAlign: 'center',
  },
  error: {
    padding: 12,
    gap: 8,
  },
});
