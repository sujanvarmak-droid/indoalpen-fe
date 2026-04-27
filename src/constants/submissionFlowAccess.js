export const SUBMISSION_FLOW_TEST_EMAIL = 'sujanvarmak@gmail.com';

export const canAccessSubmissionFlow = (email) =>
  String(email ?? '').trim().toLowerCase() === SUBMISSION_FLOW_TEST_EMAIL;
