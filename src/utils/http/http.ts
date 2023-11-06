import axios, { AxiosInstance } from "axios";
import { fetchUtils } from "react-admin";

import { inMemoryJWT } from "../../services";
import { isJSONParsable, logger } from "./helpers";

const user = localStorage.getItem("user");

const expressToken = isJSONParsable(user) ? JSON.parse(user).expressToken : "";

export const httpClient = (
    url: string,
    options: object = {},
    isBaseUrl: boolean = false
) => {
    const URL = isBaseUrl
        ? process.env.REACT_APP_API_URL.split("/admin")[0]
        : process.env.REACT_APP_API_URL;

    if (!options.headers) {
        options.headers = new Headers({ Accept: "application/json" });
    }

    if (options.body) {
        options.headers.set(
            "Content-Type",
            "application/x-www-form-urlencoded"
        );
    }

    const token = inMemoryJWT.getToken();

    if (token) {
        options.headers.set("Authorization", `Bearer ${token}`);
        return fetchUtils.fetchJson(`${URL}${url}`, options);
    } else {
        inMemoryJWT.setRefreshTokenEndpoint(
            `${
                process.env.REACT_APP_API_URL.split("/admin")[0]
            }/v1/auth/token/refresh/`
        );
        return inMemoryJWT
            .getRefreshedToken()
            .then((gotFreshToken) => {
                if (gotFreshToken) {
                    options.headers.set(
                        "Authorization",
                        `Bearer ${inMemoryJWT.getToken()}`
                    );
                }
                return fetchUtils.fetchJson(`${URL}${url}`, options);
            })
            .catch((err) => logger(err));
    }
};