async function processJSONResponse(res) {
  if (!res.ok) {
    const errorData = await res.json();
    //const error = new Error(`This request was not successful: ${res.statusText} (${res.status}). Error=${JSON.stringify(errorData)}`);
    const error = new Error(errorData.error || "Unknown error");
    error.status = res.status;
    throw error;
  }
  return res.json();
};

function handleError(err) {
  console.error('Error in fetch', err);
  throw err;
};

export default {
  get: (url) => {
    return fetch(url, {
      credentials: 'include'
    })
      .then(processJSONResponse)
      .catch(handleError);
  },

  post: (url, data) => {
    return fetch(url, {

      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
      .then(processJSONResponse)
      .catch(handleError);
  },

  put: (url, data) => {
    return fetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include"
    })
      .then(processJSONResponse)
      .catch(handleError);

  },

  delete: (url) => {
    return fetch(url, {
      method: 'DELETE',
      headers: {
      },
      credentials: "include"
    })
      .then(processJSONResponse)
      .catch(handleError);
  },

};