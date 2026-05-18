import '../stub.css'

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {apiFetch} from '../../api/client';
import { formatKES } from '../../utils/formatters';

export default function TenderDetail() {
  const { id } = useParams();

  const [tender, setTender] = useState(null);

  useEffect(() => {
    fetchTender();
  }, []);

  const fetchTender = async () => {
    try {
      const data = await apiFetch(`/tenders/${id}`);

      setTender(data.tender);
    } catch (error) {
      console.error(error);
    }
  };

  if (!tender) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>{tender.title}</h1>

      <p>{tender.description}</p>

      <h2>{formatKES(tender.budget)}</h2>

      <button>
        Submit Bid
      </button>
    </div>
  );
}