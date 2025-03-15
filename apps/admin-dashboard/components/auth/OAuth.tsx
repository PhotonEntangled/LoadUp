'use client';

import React from 'react';
import Image from 'next/image';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import CustomButton from './CustomButton';

const OAuth = () => {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      });
    } catch (error) {
      console.error('OAuth error:', error);
    }
  };

  return (
    <div>
      <div className="flex flex-row justify-center items-center mt-4 gap-x-3">
        <div className="flex-1 h-[1px] bg-gray-200" />
        <span className="text-lg">Or</span>
        <div className="flex-1 h-[1px] bg-gray-200" />
      </div>

      <CustomButton
        title="Log In with Google"
        className="mt-5 w-full shadow-none"
        IconLeft={() => (
          <Image
            src="/assets/icons/google.svg"
            alt="Google"
            width={20}
            height={20}
            className="mx-2"
          />
        )}
        bgVariant="outline"
        textVariant="primary"
        onClick={handleGoogleSignIn}
      />
    </div>
  );
};

export default OAuth; 