import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, loading, error: authError } = useAuth();
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await forgotPassword(values.email);
      
      if (response.success) {
        setResetSent(true);
      } else {
        setErrors({ submit: response.error || 'Failed to send reset instructions. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-neutral-800">Reset Password</h1>
          <h2 className="mt-3 text-xl text-neutral-600">We'll send you reset instructions</h2>
        </div>
        
        <Card className="mt-8 shadow-medium">
          {resetSent ? (
            <div className="text-center p-4">
              <h3 className="text-lg font-medium text-green-600">Reset instructions sent!</h3>
              <p className="mt-2 text-neutral-600">
                We've sent reset instructions to your email. Please check your inbox.
              </p>
              <Button 
                variant="secondary" 
                className="mt-4"
                onClick={() => navigate('/')}
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <Formik
              initialValues={{ email: '' }}
              validationSchema={ForgotPasswordSchema}
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
                    id="email"
                    name="email"
                    type="email"
                    label="Email address"
                    required
                    {...getFieldProps('email')}
                    error={touched.email && errors.email}
                  />
                  
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting || loading}
                    className="w-full"
                  >
                    {isSubmitting || loading ? 'Sending...' : 'Send reset instructions'}
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
              Back to login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
