import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { book, chapter } = req.query;

    if (!book || !chapter) {
      res.status(400).json({ error: 'Missing book or chapter parameter' });
      return;
    }

    const apiUrl = `http://127.0.0.1:5000/api/search?book=${encodeURIComponent(
      book as string
    )}&chapter=${encodeURIComponent(chapter as string)}&version=KRV`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Error fetching KRV passage: ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error in KRV API route:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch KRV passage' });
  }
}
