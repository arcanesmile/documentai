"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore, getFirebaseErrorMessage } from "@/store/authStore";
import { loginSchema, LoginInput } from "@/lib/validations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";

export default function LoginForm() {
  const { isAuthenticated, login, loginWithGoogle } = useAuthStore();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsSubmitting(true);
      await login(data.email, data.password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error) {
      const message = getFirebaseErrorMessage(error);
      if (message) toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error) {
      const message = getFirebaseErrorMessage(error);
      if (message) toast.error(message);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
        <p className="text-gray-500 dark:text-surface-400">Sign in to your realAI account</p>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 text-gray-900 dark:text-surface-100 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors mb-6"
      >
        <FontAwesomeIcon icon={faGoogle} className="h-5 w-5" />
        Continue with Google
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-surface-700" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white dark:bg-surface-900 px-4 text-gray-500 dark:text-surface-400">or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-gray-500 dark:text-surface-400 hover:text-gray-900 dark:hover:text-surface-100"
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="h-4 w-4" />
          </button>
        </div>

        <div className="flex justify-end">
          <a
            href="/forgot-password"
            className="text-sm text-primary-400 hover:text-primary-300 font-medium"
          >
            Forgot password?
          </a>
        </div>

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-surface-400">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="text-primary-400 hover:text-primary-300 font-medium">
          Sign up
        </a>
      </p>
    </div>
  );
}
