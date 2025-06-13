const baseURL = '/api' // use this when running w/ docker compose up
// const baseURL = 'http://localhost/api' // use this when running w/ npm start

const httpRequest = async (url, method, body = null, headers = {}) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : null
  }

  try {
    const response = await fetch(`${baseURL}/${url}`, options)

    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`)
    }

    // const data = await response.json()
    // return data
    return response

  } catch(error) {
    console.error(`Error occurred while making HTTP call`, error);
    throw error;
  }
}

export { baseURL, httpRequest }