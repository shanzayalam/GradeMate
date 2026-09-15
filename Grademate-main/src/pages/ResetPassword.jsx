import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const [token, setToken] = useState(null);
  const { resetPassword, loading, error: authError } = useAuth();
  const [resetComplete, setResetComplete] = useState(false);

  // Extract token from various possible sources
  useEffect(() => {
    // Try to get token from URL params first
    let extractedToken = params.token;

    // If not found in params, try to extract from pathname
    if (!extractedToken) {
      const pathParts = location.pathname.split('/');
      if (pathParts.length > 2) {
        extractedToken = pathParts[pathParts.length - 1];
      }
    }

    // If still not found, check search params
    if (!extractedToken) {
      const searchParams = new URLSearchParams(location.search);
      extractedToken = searchParams.get('token');
    }

    // Remove any trailing slash if present
    if (extractedToken && extractedToken.endsWith('/')) {
      extractedToken = extractedToken.slice(0, -1);
    }

    console.log('Extracted token:', extractedToken);
    setToken(extractedToken);
  }, [params, location]);

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      if (!token) {
        setErrors({ submit: 'Invalid or missing token' });
        return;
      }

      console.log('Resetting password with token:', token);
      const response = await resetPassword(token, values.password);

      if (response.success) {
        setResetComplete(true);
      } else {
        setErrors({ submit: response.error || 'Failed to reset password. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state while determining token
  if (token === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-neutral-600">Loading reset page...</p>
        </Card>
      </div>
    );
  }

  // Invalid token check
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-red-600">Invalid or expired reset link</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => navigate('/forgot-password')}
          >
            Request new reset link
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-neutral-800">Reset Your Password</h1>
          <h2 className="mt-3 text-xl text-neutral-600">Enter your new password</h2>
        </div>

        <Card className="mt-8 shadow-medium">
          {resetComplete ? (
            <div className="text-center p-4">
              <h3 className="text-lg font-medium text-green-600">Password Reset Complete!</h3>
              <p className="mt-2 text-neutral-600">
                Your password has been reset successfully.
              </p>
              <Button 
                variant="primary" 
                className="mt-4"
                onClick={() => navigate('/')}
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <Formik
              initialValues={{ password: '', confirmPassword: '' }}
              validationSchema={ResetPasswordSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, touched, errors, getFieldProps }) => (
                <Form className="space-y-6">
                  {authError && (
                    <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                      {authError}
                    </div>
                  )}
                  
                  <InputField
                    id="password"
                    name="password"
                    type="password"
                    label="New Password"
                    required
                    {...getFieldProps('password')}
                    error={touched.password && errors.password}
                  />
                  
                  <InputField
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    label="Confirm New Password"
                    required
                    {...getFieldProps('confirmPassword')}
                    error={touched.confirmPassword && errors.confirmPassword}
                  />
                  
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting || loading}
                    className="w-full"
                  >
                    {isSubmitting || loading ? 'Updating password...' : 'Update password'}
                  </Button>
                  
                  {errors.submit && (
                    <div className="text-red-500 text-sm mt-2">{errors.submit}</div>
                  )}
                </Form>
              )}
            </Formik>
          )}
        </Card>

        <div className="text-center">
          <p className="text-sm text-neutral-600">
            Remember your password?{' '}
            <a href="/" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
