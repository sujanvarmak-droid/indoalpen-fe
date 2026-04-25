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
    <div className="mt-8 flex flex-col-reverse gap-2.5 border-t border-gray-100 pt-5 sm:mt-9 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:pt-6">
      <div className="w-full sm:w-auto">
        {canGoBack ? (
          <Button type="button" onClick={onBack} variant="secondary" fullWidth size="md" className="sm:w-auto">
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
            size="md"
            fullWidth
            className="sm:w-auto"
          >
            {isLoading ? 'Submitting...' : labels?.submitButton ?? 'Submit'}
          </Button>
        ) : (
          <Button type="button" onClick={onNext} fullWidth size="md" className="sm:w-auto">
            {labels?.nextButton ?? 'Next →'}
          </Button>
        )}
      </div>
    </div>
  );
}
