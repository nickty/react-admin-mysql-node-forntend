// import jsonServerProvider from "ra-data-json-server";

// export const dataProvider = jsonServerProvider(
//   import.meta.env.VITE_JSON_SERVER_URL
// );



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
  update: (resource, params) => {
    const { id, data } = params;

    // Make a PUT request to update the record with the specified ID
    return fetch(`http://localhost:3000/${resource}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data), // Send the updated data
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((updatedData) => {
        return {
          data: updatedData, // The updated record data
        };
      });
  },
  // Other data provider methods...
};

