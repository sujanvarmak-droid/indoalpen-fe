const SkeletonText = () => (
  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
);

const SkeletonCard = () => (
  <div className="h-40 w-full bg-gray-200 rounded-lg animate-pulse" />
);

const SkeletonTableRow = () => (
  <div className="flex gap-4 w-full animate-pulse">
    <div className="h-4 flex-1 bg-gray-200 rounded" />
    <div className="h-4 flex-1 bg-gray-200 rounded" />
    <div className="h-4 flex-1 bg-gray-200 rounded" />
    <div className="h-4 flex-1 bg-gray-200 rounded" />
  </div>
);

const variants = {
  text: SkeletonText,
  card: SkeletonCard,
  'table-row': SkeletonTableRow,
};

export const Skeleton = ({ variant = 'text', count = 1 }) => {
  const Component = variants[variant] ?? SkeletonText;
  return (
    <div className="flex flex-col gap-3 w-full">
      {Array.from({ length: count }, (_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
};
