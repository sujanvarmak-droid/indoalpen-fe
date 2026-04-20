import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-sm px-4">
        <p className="text-6xl font-bold text-brand mb-2">403</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Access Denied</h1>
        <p className="text-sm text-gray-500 mb-6">
          You don't have permission to view this page.
        </p>
        <Button
          variant="primary"
          onClick={() => {
            try {
              navigate(-1);
            } catch {
              navigate('/dashboard');
            }
          }}
        >
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
