import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthForm from '../AuthForm';
import { signInSchema, signUpSchema } from '@/lib/validations';
import { useRouter } from 'next/navigation';
import * as auth from '@/lib/actions/auth';

// Mock the signInWithCredentials and signUp functions
jest.mock('@/lib/actions/auth', () => ({
  signInWithCredentials: jest.fn(),
  signUp: jest.fn(),
}));

// Mock the toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('AuthForm', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('Sign In Form', () => {
    const defaultValues = {
      email: '',
      password: '',
    };

    it('renders sign in form correctly', () => {
      render(
        <AuthForm
          schema={signInSchema}
          defaultValues={defaultValues}
          formType="sign-in"
        />
      );

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('validates input fields', async () => {
      render(
        <AuthForm
          schema={signInSchema}
          defaultValues={defaultValues}
          formType="sign-in"
        />
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });

      expect(auth.signInWithCredentials).not.toHaveBeenCalled();
    });

    it('submits the form with valid data', async () => {
      (auth.signInWithCredentials as jest.Mock).mockResolvedValue({ success: true });

      render(
        <AuthForm
          schema={signInSchema}
          defaultValues={defaultValues}
          formType="sign-in"
        />
      );

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(auth.signInWithCredentials).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });
  });

  describe('Sign Up Form', () => {
    const defaultValues = {
      name: '',
      email: '',
      password: '',
      companyId: '',
    };

    it('renders sign up form correctly', () => {
      render(
        <AuthForm
          schema={signUpSchema}
          defaultValues={defaultValues}
          formType="sign-up"
        />
      );

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('validates input fields', async () => {
      render(
        <AuthForm
          schema={signUpSchema}
          defaultValues={defaultValues}
          formType="sign-up"
        />
      );

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });

      expect(auth.signUp).not.toHaveBeenCalled();
    });

    it('submits the form with valid data', async () => {
      (auth.signUp as jest.Mock).mockResolvedValue({ success: true });

      render(
        <AuthForm
          schema={signUpSchema}
          defaultValues={defaultValues}
          formType="sign-up"
        />
      );

      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'Test User' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(auth.signUp).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          companyId: '',
        });
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });
  });
}); 