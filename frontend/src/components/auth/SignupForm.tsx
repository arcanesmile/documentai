"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore, getFirebaseErrorMessage } from "@/store/authStore";
import { signupSchema, SignupInput } from "@/lib/validations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";

export default function SignupForm() {
  const { signup, loginWithGoogle } = useAuthStore();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    try {
      setIsSubmitting(true);
      await signup(data.name, data.email, data.password);
      toast.success("Welcome to realAI!");
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
      toast.success("Welcome to realAI!");
      router.push("/dashboard");
    } catch (error) {
      const message = getFirebaseErrorMessage(error);
      if (message) toast.error(message);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
        <p className="text-gray-500 dark:text-surface-400">Start your AI-powered search journey</p>
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
          <span className="bg-white dark:bg-surface-900 px-4 text-gray-500 dark:text-surface-400">or sign up with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="John Doe"
          error={errors.name?.message}
          {...register("name")}
        />
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
            placeholder="Create a password"
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
        <Input
          label="Confirm Password"
          type={showPassword ? "text" : "password"}
          placeholder="Confirm your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-surface-400">
        Already have an account?{" "}
        <a href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
          Sign in
        </a>
      </p>
    </div>
  );
}
