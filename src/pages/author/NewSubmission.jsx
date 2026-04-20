import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createDraft } from '@/features/submissions/submissionThunks';
import { Button } from '@/components/ui/Button';

const NewSubmission = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const createNewDraft = async () => {
    setError(null);
    const result = await dispatch(createDraft({}));
    if (createDraft.fulfilled.match(result)) {
      navigate(`/submissions/${result.payload.id}/edit`, { replace: true });
    } else {
      setError(result.payload ?? 'Failed to create draft. Please try again.');
    }
  };

  useEffect(() => {
    createNewDraft();
  }, []);

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-danger text-sm">{error}</p>
        <Button variant="primary" onClick={createNewDraft}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-brand-light border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Creating new draft...</p>
    </div>
  );
};

export default NewSubmission;
