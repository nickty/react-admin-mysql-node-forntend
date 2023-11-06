import { logger } from "../utils/helpers";

const inMemoryJWTManager = () => {
    let inMemoryJWT: null | string = null;
    let isRefreshing: Promise<any> | null = null;
    let logoutEventName: string = "ra-logout";
    let refreshEndpoint: string = "/refresh-token";
    let refreshTimeOutId: number;

    const setLogoutEventName = (name: string): string =>
        (logoutEventName = name);
    const setRefreshTokenEndpoint = (endpoint: string): string =>
        (refreshEndpoint = endpoint);

    // This countdown feature is used to renew the JWT before it's no longer valid
    // in a way that is transparent to the user.
    const refreshToken = (delay: number): void => {
        abordRefreshToken();
        refreshTimeOutId = window.setTimeout(
            getRefreshedToken,
            delay * 1000 - 5000
        ); // Validity period of the token in seconds, minus 5 seconds
    };

    const abordRefreshToken = (): void => {
        if (refreshTimeOutId) {
            window.clearTimeout(refreshTimeOutId);
        }
    };

    const waitForTokenRefresh = (): Promise<boolean | void> => {
        if (!isRefreshing) {
            return Promise.resolve();
        }
        return isRefreshing
            .then(() => {
                isRefreshing = null;
                return true;
            })
            .catch((err) => logger(err));
    };

    // The method make a call to the refresh-token endpoint
    // If there is a valid cookie, the endpoint will set a fresh jwt in memory.
    const getRefreshedToken = (): Promise<boolean | void> => {
        const request = new Request(refreshEndpoint, {
            method: "POST",
            headers: new Headers({ "Content-Type": "application/json" }),
            credentials: "include",
        });

        isRefreshing = fetch(request)
            .then((response) => {
                if (response.status !== 200) {
                    ereaseToken();
                    global.console.log("Token renewal failure");
                    return { data: null };
                }
                return response.json();
            })
            .then(({ data }) => {
                if (data?.authToken) {
                    setToken(data?.authToken, data?.tokenExpiry);
                    return true;
                }
                ereaseToken();
                return false;
            })
            .catch((err) => logger(err));

        return isRefreshing;
    };

    const getToken = (): null | string => inMemoryJWT;

    const setToken = (token: string, delay: number): boolean => {
        inMemoryJWT = token;
        refreshToken(delay);
        return true;
    };

    const ereaseToken = (): boolean => {
        inMemoryJWT = null;
        abordRefreshToken();
        window.localStorage.setItem(logoutEventName, Date.now().toString());
        return true;
    };

    // This listener will allow to disconnect a session of ra started in another tab
    window.addEventListener("storage", (e: StorageEvent) => {
        if (e.key === logoutEventName) {
            inMemoryJWT = null;
        }
    });

    return {
        ereaseToken,
        getRefreshedToken,
        getToken,
        setLogoutEventName,
        setRefreshTokenEndpoint,
        setToken,
        waitForTokenRefresh,
    };
};

export default inMemoryJWTManager();
