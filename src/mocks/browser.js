import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/authHandlers';
import { userHandlers } from './handlers/userHandlers';
import { submissionHandlers } from './handlers/submissionHandlers';

export const worker = setupWorker(...authHandlers, ...userHandlers, ...submissionHandlers);
