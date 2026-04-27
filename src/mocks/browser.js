import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/authHandlers';
import { submissionHandlers } from './handlers/submissionHandlers';

export const worker = setupWorker(...authHandlers, ...submissionHandlers);
