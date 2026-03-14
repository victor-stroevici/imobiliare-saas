'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function GoogleSuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      router.replace('/');
    } else {
      router.replace('/auth/login');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white font-bold">IF</span>
        </div>
        <p className="text-gray-600">Se conectează cu Google...</p>
      </div>
    </div>
  );
}

export default function GoogleSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Se încarcă...</p></div>}>
      <GoogleSuccessInner />
    </Suspense>
  );
}
