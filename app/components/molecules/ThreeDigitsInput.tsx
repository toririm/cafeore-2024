import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";

const ThreeDigitsInput = forwardRef<
  ElementRef<typeof InputOTP>,
  Omit<
    ComponentPropsWithoutRef<typeof InputOTP>,
    "maxLength" | "pattern" | "render"
  >
>(({ ...props }, ref) => {
  return (
    <InputOTP ref={ref} maxLength={3} pattern={REGEXP_ONLY_DIGITS} {...props}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
    </InputOTP>
  );
});

export { ThreeDigitsInput };
