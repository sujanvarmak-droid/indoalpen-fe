import { Button } from '@/components/ui/Button';

interface StepNavigationProps {
  onNext?: () => void;
  onBack: () => void;
  canGoBack: boolean;
  showSubmit?: boolean;
  onSubmit?: () => void;
  isLoading?: boolean;
  labels?: {
    nextButton?: string;
    backButton?: string;
    submitButton?: string;
  };
}

export function StepNavigation({
  onNext,
  onBack,
  canGoBack,
  showSubmit,
  onSubmit,
  isLoading,
  labels,
}: StepNavigationProps) {
  return (
    <div className="mt-10 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
      <div className="w-full sm:w-auto">
        {canGoBack ? (
          <Button type="button" onClick={onBack} variant="secondary" fullWidth className="sm:w-auto">
            {labels?.backButton ?? '← Back'}
          </Button>
        ) : (
          <span />
        )}
      </div>

      <div className="w-full sm:w-auto">
        {showSubmit ? (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isLoading}
            loading={isLoading}
            fullWidth
            className="sm:w-auto"
          >
            {isLoading ? 'Submitting...' : labels?.submitButton ?? 'Submit'}
          </Button>
        ) : (
          <Button type="button" onClick={onNext} fullWidth className="sm:w-auto">
            {labels?.nextButton ?? 'Next →'}
          </Button>
        )}
      </div>
    </div>
  );
}
