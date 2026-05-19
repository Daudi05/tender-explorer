import '../stub.css'

import { useEffect, useState } from 'react';
import {apiFetch} from '../../api/client';
import TenderCard from '../../components/TenderCard';

export default function BrowseTenders() {
  const [tenders, setTenders] = useState([]);

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      const data = await apiFetch('/tenders');

      setTenders(data.tenders || []);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Browse Tenders</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
        }}
      >
        {tenders.map((tender) => (
          <TenderCard
            key={tender.id}
            tender={tender}
          />
        ))}
      </div>
    </div>
  );
}
