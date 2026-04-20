import { Link, useLocation } from 'react-router-dom';

const VerifyEmailPending = () => {
  const { state } = useLocation();
  const email = state?.email;

  return (
    <div className="max-w-md mx-auto mt-20 bg-white shadow rounded-xl p-8 text-center">
      <div className="w-14 h-14 bg-brand-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="h-7 w-7 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-2">Check your email</h2>
      <p className="text-sm text-gray-600 mb-1">
        We've sent a confirmation email
        {email ? (
          <> to <span className="font-medium text-brand">{email}</span></>
        ) : ' to your inbox'}.
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Please click the link in that email to activate your account.
      </p>

      <div className="bg-brand-muted rounded-lg px-4 py-3 text-xs text-gray-500 mb-6 text-left space-y-1">
        <p className="font-medium text-gray-700">Didn't receive it?</p>
        <p>• Check your spam or junk folder.</p>
        <p>• The link expires after <span className="font-medium">24 hours</span>.</p>
        <p>• If the link has expired, please sign up again or contact support.</p>
      </div>

      <Link to="/login" className="text-brand font-medium hover:underline text-sm">
        Back to Login
      </Link>
    </div>
  );
};

export default VerifyEmailPending;
