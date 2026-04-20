import { createSlice, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { SUBMISSION_STATUS } from '@/constants/submissionStatus';
import {
  fetchMySubmissions,
  createDraft,
  updateDraft,
  submitForReview,
} from '@/features/submissions/submissionThunks';

const adapter = createEntityAdapter();

const initialState = adapter.getInitialState({
  status: 'idle',
  error: null,
  uploadProgress: {},
  uploadStatus: {},
});

const submissionsSlice = createSlice({
  name: 'submissions',
  initialState,
  reducers: {
    setUploadProgress(state, { payload: { submissionId, progress } }) {
      state.uploadProgress[submissionId] = progress;
    },
    setUploadStatus(state, { payload: { submissionId, status } }) {
      state.uploadStatus[submissionId] = status;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMySubmissions.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMySubmissions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        adapter.setAll(state, action.payload.content);
      })
      .addCase(fetchMySubmissions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      .addCase(createDraft.fulfilled, (state, action) => {
        adapter.addOne(state, action.payload);
      })

      .addCase(updateDraft.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload);
      })

      .addCase(submitForReview.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload);
      });
  },
});

export const { setUploadProgress, setUploadStatus } = submissionsSlice.actions;

const adapterSelectors = adapter.getSelectors((state) => state.submissions);
export const selectAllSubmissions = adapterSelectors.selectAll;
export const selectSubmissionById = adapterSelectors.selectById;

export const selectDraftSubmissions = createSelector(
  selectAllSubmissions,
  (submissions) => submissions.filter((s) => s.status === SUBMISSION_STATUS.DRAFT)
);

export default submissionsSlice.reducer;
