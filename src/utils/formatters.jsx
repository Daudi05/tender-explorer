import { formatDistanceToNow, format } from 'date-fns';

export const formatKES = (amount) => {
  if (!amount) return 'KES 0';

  return `KES ${Number(amount).toLocaleString()}`;
};

export const formatRelativeDate = (date) => {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
  });
};

export const formatFullDate = (date) => {
  return format(new Date(date), 'PPP p');
};