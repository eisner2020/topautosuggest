import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  // Parse the path
  const path = event.path.replace('/.netlify/functions/api/', '');

  try {
    // Handle different endpoints
    if (path === 'clients' && event.httpMethod === 'GET') {
      // Mock data for now - replace with actual database calls later
      const clients = [
        { id: '1', name: 'Test Client 1', keywords: ['seo', 'marketing'] },
        { id: '2', name: 'Test Client 2', keywords: ['digital', 'advertising'] }
      ];

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(clients)
      };
    }

    // Handle 404
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Not Found' })
    };

  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }
};

export { handler };
