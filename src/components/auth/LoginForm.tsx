"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import Link from "next/link";
import { authService } from "lib/services/auth.service";
import type { LoginRequest } from "lib/types/auth";
import { useRouter } from "next/navigation";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useSearchParams } from 'next/navigation';
import { useDeviceStore } from 'lib/store/deviceStore';
import { sensorsService } from "lib/services/sensor.service";

const AnimatedInput = styled("div")({
  position: "relative",
  overflow: "hidden",
  borderRadius: "40px",
  padding: "2px",
  width: "100%",
  minWidth: "300px",

  "&::before": {
    content: '""',
    position: "absolute",
    width: "150px",
    height: "150%",
    background:
      "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)",
    animation: "rotate 3s linear infinite",
    top: "-25%",
    left: "-50px",
    transform: "rotate(45deg)",
  },

  "@keyframes rotate": {
    "0%": {
      transform: "translateX(-100%) rotate(45deg)",
    },
    "100%": {
      transform: "translateX(200%) rotate(45deg)",
    },
  },
});

const StyledInput = styled("input")({
  width: "100%",
  minWidth: "300px",
  padding: "12px 24px",
  background: "rgba(24, 24, 27, 0.2)",
  border: "none",
  outline: "none",
  color: "white",
  fontSize: "14px",
  borderRadius: "40px",
  "&::placeholder": {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "12px",
  },
});

const Label = styled("label")({
  display: "block",
  color: "white",
  marginBottom: "8px",
  fontSize: "14px",
});

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

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginRequest>({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const setDeviceSN = useDeviceStore(state => state.setDeviceSN);

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
  setError('');
  setIsLoading(true);

  try {
    const response = await authService.login({
      username: formData.username,
      password: formData.password,
    });

    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
      const cookieOptions = 'path=/; secure; samesite=strict';
      document.cookie = `token=${response.token}; ${cookieOptions}`;
      
      const isSetup = searchParams.get("setup") === "true";
      const scannedSN = searchParams.get("LCSN"); 
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        if (isSetup) {
          if (scannedSN) {
            const validation = await sensorsService.validateQRData(`https://mygrow.leafai.de/ibn/${scannedSN}`);
            if (validation.isValid && validation.data?.type === 'lclite') {
              setDeviceSN(scannedSN);
              router.push("/mobile/location");
            } else {
              router.push("/mobile/device-setup");
            }
          } else {
            router.push("/mobile/device-setup");
          }
        } else {
          router.push("/mobile/dashboard");
        }
      } else {
        router.push("/dashboard");
      }
    } else {
      setError(response.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    setError('An error occurred. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="w-full">
        <div className="mb-12">
          <h1 className="text-3xl m-0 font-semibold text-white text-center pb-2">
            Nice to see you!
          </h1>
          <div className="text-xs text-center text-slate-400 font-semibold">
            Enter your username and password to login
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="pl-4">Username</Label>
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

            <div>
              <Label className="pl-4">Password</Label>
              <AnimatedInput>
                <div className="relative">
                  <StyledInput
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <VisibilityOffIcon sx={{ fontSize: 20 }} />
                    ) : (
                      <VisibilityIcon sx={{ fontSize: 20 }} />
                    )}
                  </button>
                </div>
              </AnimatedInput>
            </div>
            <Link href="/forget-password" className="inline-block">
              <span
                className="text-slate-400 text-xs pl-5 py-2"
              >
                I forgot my password
              </span>
            </Link>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
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
              {isLoading ? "LOGGING IN..." : "LOGIN"}
            </Button>
          </div>

          <div className="text-center">
            <Link href="/signup" className="inline-block">
              <span className="text-sm text-zinc-400">
                Don&apos;t have an account?{" "}
              </span>
              <span className="text-sm text-blue-500 hover:text-blue-400">
                Sign up
              </span>
            </Link>
          </div>
        </form>
      </div>
    </ThemeProvider>
  );
}
