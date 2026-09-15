import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

const SignUpSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const SignUp = () => {
  const navigate = useNavigate();
  const { signup, loading, error: authError } = useAuth();

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const userData = {
        name: values.name,
        email: values.email,
        password: values.password
      };
      
      const response = await signup(userData);
      
      if (response.success) {
        navigate('/');
      } else {
        setErrors({ submit: response.error || 'Signup failed. Please try again.' });
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
          <h1 className="text-3xl font-semibold text-neutral-800">Create Account</h1>
          <h2 className="mt-3 text-xl text-neutral-600">Sign up for Grade-Mate</h2>
        </div>
        
        <Card className="mt-8 shadow-medium">
          <Formik
            initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
            validationSchema={SignUpSchema}
            onSubmit={handleSubmit}
            validateOnBlur={true}
            validateOnChange={false}
          >
            {({ isSubmitting, touched, errors, getFieldProps, handleSubmit: formikSubmit }) => {
              return (
                <Form className="space-y-6" onSubmit={(e) => {
                  formikSubmit(e);
                }}>
                  {authError && (
                    <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">
                      {authError}
                    </div>
                  )}
                  
                  <InputField
                    id="name"
                    name="name"
                    type="text"
                    label="Full Name"
                    required
                    {...getFieldProps('name')}
                    error={touched.name && errors.name}
                  />
                  
                  <InputField
                    id="email"
                    name="email"
                    type="email"
                    label="Email address"
                    required
                    {...getFieldProps('email')}
                    error={touched.email && errors.email}
                  />
                  
                  <InputField
                    id="password"
                    name="password"
                    type="password"
                    label="Password"
                    required
                    {...getFieldProps('password')}
                    error={touched.password && errors.password}
                  />
                  
                  <InputField
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    label="Confirm Password"
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
                    {isSubmitting || loading ? 'Creating account...' : 'Create account'}
                  </Button>
                  
                  {errors.submit && (
                    <div className="text-red-500 text-sm mt-2">{errors.submit}</div>
                  )}
                </Form>
              );
            }}
          </Formik>
        </Card>
        
        <div className="text-center">
          <p className="text-sm text-neutral-600">
            Already have an account?{' '}
            <a href="/" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
