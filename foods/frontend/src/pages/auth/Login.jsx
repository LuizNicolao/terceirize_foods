import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useLogin } from '../../hooks/useLogin';
import { LoginForm } from './components/LoginForm';
import { LoginHeader } from './components/LoginHeader';

const Login = () => {
  const navigate = useNavigate();
  const { showPassword, isLoading, onSubmit } = useLogin(navigate);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm();

  const handleFormSubmit = async (data) => {
    const result = await onSubmit(data, setError);
    if (result?.success) {
      navigate('/foods');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-500 to-green-700">
      <div className="bg-white rounded-xl shadow-2xl p-10 w-full max-w-md animate-fadeInUp">
        <LoginHeader />
        
        <LoginForm
          register={register}
          handleSubmit={handleSubmit}
          onSubmit={handleFormSubmit}
          errors={errors}
          showPassword={showPassword}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Login;
