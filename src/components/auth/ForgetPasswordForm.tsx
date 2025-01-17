"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Link from "next/link";
import { authService } from "lib/services/auth.service";
import {
  AnimatedInput,
  StyledInput,
  FormLabel,
} from "@components/common/form/StyledComponents";

interface FormData {
  username: string;
  email: string;
}

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#2196f3",
    },
    background: {
      paper: "#18181b",
      default: "#09090b",
    },
  },
});

export default function ForgetPasswordForm() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.resetPassword({
        username: formData.username,
        email: formData.email,
      });

      if (response.success) {
        setIsSuccess(true);
      } else {
        setError(response.message || "Password reset failed");
      }
    } catch (error) {
      setError(`An error occurred: ${error}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <ThemeProvider theme={darkTheme}>
      <div className="w-full">
        <div className="mb-12">
          <h1 className="text-3xl m-0 font-semibold text-white text-center pb-2">
            Forgot Password?
          </h1>
          <div className="text-xs text-center text-slate-400 font-semibold">
            Enter your username and email to reset your password
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-[rgba(24,24,27,0.2)] p-6 rounded-2xl backdrop-blur-sm border border-zinc-800 min-h-[420px] w-[350px] flex flex-col justify-center"
        >
          {isSuccess ? (
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-white mb-4">
                Check Your Email
              </h2>
              <p className="text-slate-400 mb-8">
              We&apos;ve sent a new password to your registered email address.
                            </p>
              <Link
                href="/login"
                className="text-blue-500 hover:text-blue-400 text-sm"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <FormLabel className="pl-4">Username</FormLabel>
                  <div className="flex justify-center">
                    <AnimatedInput>
                      <StyledInput
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter your username"
                        required
                      />
                    </AnimatedInput>
                  </div>
                </div>

                <div>
                  <FormLabel className="pl-4">Email</FormLabel>
                  <div className="flex justify-center">
                    <AnimatedInput>
                      <StyledInput
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                      />
                    </AnimatedInput>
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-xs text-center">{error}</div>
              )}

              <div className="m-1">
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    py: 1,
                    textTransform: "none",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    borderRadius: "12px",
                  }}
                >
                  {isLoading ? "SENDING..." : "RESET PASSWORD"}
                </Button>
              </div>

              <div className="text-center">
                <Link href="/login" className="inline-block">
                  <span className="text-sm text-zinc-400">
                    Remember your password?{" "}
                  </span>
                  <span className="text-sm text-blue-500 hover:text-blue-400">
                    Sign in
                  </span>
                </Link>
              </div>
            </>
          )}
        </form>
      </div>
    </ThemeProvider>
  );
}
