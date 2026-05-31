'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema, RegisterForm } from '@/lib/validations';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Register as Borrower</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Full Name" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" loading={loading} className="w-full">
            Register
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}
