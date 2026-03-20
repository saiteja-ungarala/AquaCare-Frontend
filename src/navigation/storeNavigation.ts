export type StoreCategoryNavigationParams = {
    initialSearchQuery?: string;
};

type MinimalNavigation = {
    navigate: (routeName: string, params?: any) => void;
    getState?: () => { routeNames?: string[] };
    getParent?: () => MinimalNavigation | undefined;
};

const STORE_HOME_ROUTE = 'StoreHome';
const CUSTOMER_TABS_ROUTE = 'CustomerTabs';

const buildStoreHomeParams = (params?: StoreCategoryNavigationParams) => {
    if (!params || !params.initialSearchQuery?.trim()) {
        return undefined;
    }

    return {
        initialSearchQuery: params.initialSearchQuery.trim(),
    };
};

export const navigateToStoreCategories = (
    navigation: MinimalNavigation,
    params?: StoreCategoryNavigationParams
): void => {
    const routeNames = navigation.getState?.()?.routeNames ?? [];
    const storeHomeParams = buildStoreHomeParams(params);

    if (routeNames.includes(STORE_HOME_ROUTE)) {
        navigation.navigate(STORE_HOME_ROUTE, storeHomeParams);
        return;
    }

    if (routeNames.includes(CUSTOMER_TABS_ROUTE)) {
        navigation.navigate(CUSTOMER_TABS_ROUTE, {
            screen: 'Store',
            params: {
                screen: STORE_HOME_ROUTE,
                params: storeHomeParams,
            },
        });
        return;
    }

    const parent = navigation.getParent?.();
    if (parent) {
        navigateToStoreCategories(parent, params);
    }
};
