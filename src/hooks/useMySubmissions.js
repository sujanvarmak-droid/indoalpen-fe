import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMySubmissions } from '@/features/submissions/submissionThunks';
import {
  selectAllSubmissions,
  selectDraftSubmissions,
} from '@/features/submissions/submissionsSlice';

export const useMySubmissions = ({ page = 0, size = 10, autoFetch = true } = {}) => {
  const dispatch = useDispatch();
  const submissions = useSelector(selectAllSubmissions);
  const drafts = useSelector(selectDraftSubmissions);
  const status = useSelector((state) => state.submissions.status);
  const error = useSelector((state) => state.submissions.error);
  const [totalElements, setTotalElements] = useState(0);

  const refetch = useCallback(async () => {
    const result = await dispatch(fetchMySubmissions({ page, size }));
    if (fetchMySubmissions.fulfilled.match(result)) {
      setTotalElements(result.payload?.totalElements ?? 0);
    }
    return result;
  }, [dispatch, page, size]);

  useEffect(() => {
    if (!autoFetch) return;
    void refetch();
  }, [autoFetch, refetch]);

  return {
    submissions,
    drafts,
    status,
    error,
    totalElements,
    refetch,
  };
};
