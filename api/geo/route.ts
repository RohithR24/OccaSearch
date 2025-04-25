// export async function GET() {
//     try {
//       const URL = process.env.NEXT_PUBLIC_COUNTRY_API ??'';
//       const res = await fetch(URL);
//       const data = await res.json();
//       return Response.json({ country: data?.country_code || 'US' });
//     } catch (err) {
//       return Response.json({ country: 'US', error: 'fallback used' }, { status: 500 });
//     }
//   }