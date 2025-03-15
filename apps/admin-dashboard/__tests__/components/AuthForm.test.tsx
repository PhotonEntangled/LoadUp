import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthForm from '@/components/AuthForm';
import { signInSchema, signUpSchema } from '@/lib/validations';
import { signIn } from '@/lib/auth';
import { signUpUser } from '@/lib/supabase';
import { UserRole } from '@/lib/auth.config';

// Mock the necessary modules
jest.mock('@/lib/auth', () => ({
  signIn: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  signUpUser: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('AuthForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sign In Form', () => {
    const defaultValues = {
      email: '',
      password: '',
    };

    it('renders sign in form correctly', () => {
      render(
        <AuthForm
          formType="sign-in"
          schema={signInSchema}
          defaultValues={defaultValues}
        />
      );

      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });

    it('validates required fields', async () => {
      render(
        <AuthForm
          formType="sign-in"
          schema={signInSchema}
          defaultValues={defaultValues}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

      await waitFor(() => {
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
      });
    });

    it('calls signIn when form is submitted with valid data', async () => {
      render(
        <AuthForm
          formType="sign-in"
          schema={signInSchema}
          defaultValues={defaultValues}
        />
      );

      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password123',
          redirect: true,
          callbackUrl: '/dashboard',
        });
      });
    });
  });

  describe('Sign Up Form', () => {
    const defaultValues = {
      name: '',
      email: '',
      password: '',
      companyId: '',
      role: 'customer' as UserRole,
    };

    it('renders sign up form correctly', () => {
      render(
        <AuthForm
          formType="sign-up"
          schema={signUpSchema}
          defaultValues={defaultValues}
          showRoleSelector={true}
        />
      );

      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Company ID/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
    });

    it('validates required fields', async () => {
      render(
        <AuthForm
          formType="sign-up"
          schema={signUpSchema}
          defaultValues={defaultValues}
          showRoleSelector={true}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
      });
    });

    it('calls signUpUser when form is submitted with valid data', async () => {
      (signUpUser as jest.Mock).mockResolvedValue({ data: {}, error: null });

      render(
        <AuthForm
          formType="sign-up"
          schema={signUpSchema}
          defaultValues={defaultValues}
          showRoleSelector={true}
        />
      );

      fireEvent.change(screen.getByLabelText(/Full Name/i), {
        target: { value: 'Test User' },
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: 'password123' },
      });
      fireEvent.change(screen.getByLabelText(/Company ID/i), {
        target: { value: 'COMP123' },
      });
      
      // Select role
      fireEvent.change(screen.getByLabelText(/Role/i), {
        target: { value: 'driver' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

      await waitFor(() => {
        expect(signUpUser).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          companyId: 'COMP123',
          role: 'driver',
        });
      });
    });

    it('does not show role selector when showRoleSelector is false', () => {
      render(
        <AuthForm
          formType="sign-up"
          schema={signUpSchema}
          defaultValues={defaultValues}
          showRoleSelector={false}
        />
      );

      expect(screen.queryByLabelText(/Role/i)).not.toBeInTheDocument();
    });
  });
}); 