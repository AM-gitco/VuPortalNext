import { useState, useRef, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { otpVerificationSchema, type OTPVerificationData } from "@/lib/db/schema";
import { verifySignupAction, verifyResetOtpAction, resendOtpAction } from "@/app/actions/auth";

interface OTPVerificationFormProps {
  email: string;
  fromSignup?: boolean;
  onSwitchToLogin: () => void;
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
  onSwitchToResetPassword?: (email: string, code: string) => void;
}

export function OTPVerificationForm({ email, fromSignup = false, onSwitchToLogin, onSwitchToSignup, onSwitchToForgotPassword, onSwitchToResetPassword }: OTPVerificationFormProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<OTPVerificationData>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      email,
      code: "",
    },
  });

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerify = (otpCode: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("code", otpCode);

      try {
        if (fromSignup) {
          const result = await verifySignupAction(null, formData);
          if (result && !result.success) {
            toast({
              title: "Verification Failed",
              description: result.message || "Invalid or expired verification code",
              variant: "destructive",
            });
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
          } else {
            // Redirect handled by action
            toast({
              title: "Email Verified Successfully",
              description: "Redirecting...",
            });
          }
        } else {
          // Password Reset Flow
          const result = await verifyResetOtpAction(null, formData);
          if (result && result.success && result.canResetPassword) {
            toast({
              title: "OTP Verified",
              description: "Please set your new password.",
            });
            onSwitchToResetPassword?.(email, otpCode);
          } else {
            toast({
              title: "Verification Failed",
              description: result?.message || "Invalid or expired verification code",
              variant: "destructive",
            });
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
          }
        }
      } catch (error) {
        // Next.js redirect might throw
        console.error("Verification error client:", error);
      }
    });
  };

  const handleResend = () => {
    if (canResend) {
      const formData = new FormData();
      formData.append("email", email);

      // We can't use useTransition here easily unless we track loading state separately 
      // because resendOtpMutation was separate.
      // Let's just fire it.
      resendOtpAction(null, formData).then(result => {
        if (result && result.success) {
          toast({
            title: "Code Resent",
            description: "A new verification code has been sent to your email.",
          });
          setTimer(300);
          setCanResend(false);
          setOtp(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        } else {
          toast({
            title: "Resend Failed",
            description: result?.message || "Failed to resend verification code",
            variant: "destructive",
          });
        }
      });
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are filled
    if (newOtp.every(digit => digit !== "")) {
      const otpCode = newOtp.join("");
      form.setValue("code", otpCode);
      handleVerify(otpCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Smartphone className="text-green-600" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Verification Code</h2>
        <p className="text-gray-500 mb-2">We've sent a 6-digit code to</p>
        <p className="text-blue-600 font-semibold">{email}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => { })} className="space-y-6">
          <div>
            <FormLabel className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Verification Code
            </FormLabel>
            <div className="flex space-x-3 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center border border-gray-300 rounded-lg text-xl font-bold focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
              ))}
            </div>
            <FormMessage />
          </div>

          <div className="text-center">
            <p className="text-gray-500 text-sm mb-4">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend}
                className={`font-semibold transition-colors ${canResend
                  ? "text-purple-600 hover:text-purple-800 cursor-pointer"
                  : "text-gray-400 cursor-not-allowed"
                  }`}
              >
                Resend Code
              </button>
            </p>
            {!canResend && (
              <p className="text-gray-400 text-xs">Code expires in {formatTime(timer)}</p>
            )}
          </div>

          <Button
            type="button"
            variant="default" // Changed from success to default as success might not exist in shadcn
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isPending || otp.some(digit => digit === "")}
            onClick={() => {
              const otpCode = otp.join("");
              if (otpCode.length === 6) {
                handleVerify(otpCode);
              }
            }}
          >
            {isPending ? "Verifying..." : "Verify Code"}
            <Check className="ml-2" size={16} />
          </Button>
        </form>
      </Form>

      {/* Back Button */}
      <div className="mt-6 text-center">
        <button
          onClick={fromSignup ? onSwitchToSignup : onSwitchToForgotPassword}
          className="text-blue-600 hover:text-purple-600 font-semibold transition-colors flex items-center justify-center w-full"
        >
          <ArrowLeft className="mr-2" size={16} />
          {fromSignup ? "Back to Sign Up" : "Back to Reset Password"}
        </button>
      </div>
    </div>
  );
}
