import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const LOCATION_CACHE_KEY = '@ioncare_location_display';

interface LocationState {
    locationName: string | null;
    isFetching: boolean;
}

interface LocationActions {
    /** Restore last known location name from cache instantly */
    loadCached: () => Promise<void>;
    /** Fetch fresh coordinates and reverse-geocode to area name */
    fetchAndSet: () => Promise<void>;
    clearLocation: () => void;
}

type LocationStore = LocationState & LocationActions;

export const useLocationStore = create<LocationStore>((set) => ({
    locationName: null,
    isFetching: false,

    loadCached: async () => {
        try {
            const cached = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
            if (cached) {
                set({ locationName: cached });
            }
        } catch {
            // ignore
        }
    },

    fetchAndSet: async () => {
        set({ isFetching: true });
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status !== 'granted') {
                return;
            }

            const pos = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const results = await Location.reverseGeocodeAsync(pos.coords);
            const geo = results[0];

            // Prefer the most specific area name: district > city > subregion
            const name = geo?.district || geo?.city || geo?.subregion || null;
            if (name) {
                set({ locationName: name });
                await AsyncStorage.setItem(LOCATION_CACHE_KEY, name);
            }
        } catch {
            // silently fail — "Select Location" remains
        } finally {
            set({ isFetching: false });
        }
    },

    clearLocation: () => {
        set({ locationName: null });
        AsyncStorage.removeItem(LOCATION_CACHE_KEY).catch(() => {});
    },
}));
