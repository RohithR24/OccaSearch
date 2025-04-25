// This is an async function
export const getCountryCode = async (): Promise<string> => {
    const res = await fetch(process.env.NEXT_PUBLIC_COUNTRY_API?? '');
    const data = await res.json();
    return data.country_code || 'US'; // default fallback
  };
  