import { SUBMISSION_STATUS } from '@/constants/submissionStatus';
import { cn } from '@/utils/cn';

const statusConfig = {
  [SUBMISSION_STATUS.DRAFT]: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-600',
  },
  [SUBMISSION_STATUS.SUBMITTED]: {
    label: 'Submitted',
    className: 'bg-blue-100 text-blue-700',
  },
  [SUBMISSION_STATUS.UNDER_REVIEW]: {
    label: 'Under Review',
    className: 'bg-amber-100 text-amber-700',
  },
};

export const StatusChip = ({ status }) => {
  const config = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  );
};
