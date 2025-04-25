import { db } from '@/api/firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface Holiday {
  name: string;
  date: { iso: string };
  description: string;
}

interface OccasionEvent {
  name: string;
  date: string;
  description: string;
}

export const checkAndSyncOccasions = async (countryCode: string, year: number): Promise<{ status: string }> => {
  const docId = `${countryCode}_${year}`;
  const docRef = doc(db, 'occasion', docId);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    return { status: 'exists' };
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_CALENDARIFIC_API_KEY;
    const url = `${process.env.NEXT_PUBLIC_CALENDARIFIC_API_URL}?api_key=${apiKey}&country=${countryCode}&year=${year}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || data.meta.code !== 200) {
      throw new Error('Failed to fetch from Calendarific');
    }

    const events: OccasionEvent[] = data.response.holidays.map((h: Holiday) => ({
      name: h.name,
      date: h.date.iso,
      description: h.description,
    }));

    await setDoc(docRef, {
      country: countryCode,
      year,
      events,
      last_synced: new Date().toISOString().split('T')[0],
    });

    return { status: 'created' };
  } catch (error) {
    console.error('Error syncing occasions:', error);
    return { status: 'error' };
  }
};
