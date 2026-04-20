export const ProgressBar = ({ progress = 0, label }) => {
  const clamped = Math.min(100, Math.max(0, progress));
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">{label}</span>
          <span className="text-sm font-medium text-brand">{clamped}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 bg-brand-light rounded-full transition-all duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {!label && (
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-500">{clamped}%</span>
        </div>
      )}
    </div>
  );
};
