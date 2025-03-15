'use client';

import React from 'react';
import Image from 'next/image';
import { InputFieldProps } from '@/types/auth';

const InputField = ({
  label,
  icon,
  secureTextEntry = false,
  labelStyle,
  containerStyle,
  inputStyle,
  iconStyle,
  className,
  ...props
}: InputFieldProps) => {
  return (
    <div className="my-2 w-full">
      <label className={`text-lg font-semibold mb-3 block ${labelStyle}`}>
        {label}
      </label>
      <div
        className={`flex flex-row justify-start items-center relative bg-neutral-100 rounded-full border border-neutral-100 focus-within:border-blue-500 ${containerStyle}`}
      >
        {icon && (
          <div className="ml-4">
            <Image src={icon} alt={label} width={24} height={24} className={`${iconStyle}`} />
          </div>
        )}
        <input
          className={`rounded-full p-4 font-semibold text-[15px] flex-1 bg-transparent outline-none ${inputStyle}`}
          type={secureTextEntry ? 'password' : 'text'}
          {...props}
        />
      </div>
    </div>
  );
};

export default InputField; 