export const logger = (message, isError: boolean = true): void => {
    if (isError) {
        throw new Error(message);
    }

    if (process.env.REACT_APP_NODE_ENV === "development") {
        if (isError) {
            console.error(message);
        } else {
            console.log(message);
        }
    }
};

export const isJSONParsable = (data: string) => {
    if (!data) return false;

    try {
        JSON.parse(data);
        return true;
    } catch {
        return false;
    }
};