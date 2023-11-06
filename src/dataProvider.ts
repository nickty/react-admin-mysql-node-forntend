// import jsonServerProvider from "ra-data-json-server";

import { httpClient } from "./utils/http/http";

// export const dataProvider = jsonServerProvider(
//   import.meta.env.VITE_JSON_SERVER_URL
// );

export const toQueryString = (obj, prefix: string = ""): string => {
    var str = [],
        k,
        v;
    for (var p in obj) {
        if (!obj.hasOwnProperty(p)) {
            continue;
        }
        // Skip things from the prototype.
        if (~p.indexOf("[")) {
            k = prefix
                ? prefix +
                  "[" +
                  p.substring(0, p.indexOf("[")) +
                  "]" +
                  p.substring(p.indexOf("["))
                : p;
            // Only put whatever is before the bracket into new brackets; append the rest.
        } else {
            k = prefix ? prefix + "[" + p + "]" : p;
        }
        v = obj[p];
        if (
            null === v ||
            false === v ||
            undefined === v ||
            (typeof v === "object" && !Object.keys(v).length)
        ) {
            v = "";
        }
        str.push(
            typeof v === "object"
                ? toQueryString(v, k)
                : encodeURIComponent(k) + "=" + encodeURIComponent(v)
        );
    }

    return str.join("&");
};



export const dataProvider = {
  getList: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;

    // Customize the API endpoint based on the resource name
    const apiUrl = `http://localhost:3000/${resource}`;

    // Construct query parameters for pagination and sorting
    const queryParams = `?_page=${page}&_limit=${perPage}&_sort=${field}&_order=${order}`;

    // Make a request to the API to retrieve the list of records
    return fetch(apiUrl + queryParams)
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        return {
          data: data, // The list of records
          total: data.length, // Total number of records (optional)
        };
      });
  },
  getOne: (resource, params) => {
    const { id } = params;

    // Fetch the record based on the ID from your API or database
    return fetch(`http://localhost:3000/${resource}/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        return {
          data: {
            id: data.id,  // Ensure 'id' is included
            ...data,      // Include other record data
          },
        };
      });
  },
update: (resource: string, params: { id: number; data }) => {
        const url = `/${resource}/${params.id}`;

        return httpClient(url, {
            method: "POST",
            body: toQueryString(params.data),
        }).then(({ json }: any) => {
            if (json?.status !== Status.SUCCESS) {
                throw new Error(
                    !!json?.message
                        ? json.message
                        : "Something went wrong! Please try again!"
                );
            }
            return {
                data: json.data,
            };
        });
    },
  // Other data provider methods...
};

