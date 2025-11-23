import { GoogleAuth } from '@/components/auth';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <GoogleAuth />
    </div>
  );
}
