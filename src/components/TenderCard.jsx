import { Link } from 'react-router-dom';
import { formatKES, formatRelativeDate } from '../utils/formatters';
import './TenderCard.css';

export default function TenderCard({ tender }) {
  return (
    <Link
      to={`/contractor/tenders/${tender.id}`}
      className="tender-card"
    >
      <h3>{tender.title}</h3>

      <p>{tender.description}</p>

      <h4>{formatKES(tender.budget)}</h4>

      <small>
        Posted {formatRelativeDate(tender.created_at)}
      </small>
    </Link>
  );
}