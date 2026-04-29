import { createAsyncThunk } from '@reduxjs/toolkit';
import * as submissionService from '@/services/submissionService';

export const fetchMySubmissions = createAsyncThunk(
  'submissions/fetchMySubmissions',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await submissionService.getMySubmissions(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message ?? error.message);
    }
  }
);

export const createDraft = createAsyncThunk(
  'submissions/createDraft',
  async (formData, { rejectWithValue }) => {
    try {
      return await submissionService.createDraft(formData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message ?? error.message);
    }
  }
);

export const updateDraft = createAsyncThunk(
  'submissions/updateDraft',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await submissionService.updateDraft({ id, data: formData });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message ?? error.message);
    }
  }
);

export const submitForReview = createAsyncThunk(
  'submissions/submitForReview',
  async (id, { rejectWithValue }) => {
    try {
      return await submissionService.submitForReview(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message ?? error.message);
    }
  }
);

export const getPresignedUrl = createAsyncThunk(
  'submissions/getPresignedUrl',
  async ({ fileName, contentType, publicationId }, { rejectWithValue }) => {
    try {
      return await submissionService.getPresignedUrl({ fileName, contentType, publicationId });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message ?? error.message);
    }
  }
);

export const attachFile = createAsyncThunk(
  'submissions/attachFile',
  async ({ publicationId, s3Key, fileName, contentType, fileType }, { rejectWithValue }) => {
    try {
      return await submissionService.attachFile({ publicationId, s3Key, fileName, contentType, fileType });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message ?? error.message);
    }
  }
);
