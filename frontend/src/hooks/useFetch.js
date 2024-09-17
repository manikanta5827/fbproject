import { useState, useEffect } from 'react';
import axios from 'axios';

// Define the custom hook
function useFetch(url) {
  console.log('usefetch hook loaded');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data when the component mounts or the URL changes
    async function fetchData() {
      try {
        setLoading(true);
        const response = await axios.get(url);
        const out = await response.data;
        setData(out.list);
        setError(null);
      } catch (err) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [url]); // Dependency array ensures that data is fetched when the URL changes

  return { data, loading, error };
}

export default useFetch;
