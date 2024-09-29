import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";

type props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
};

const ThreeDigitsInput = ({ id, value, onChange, disabled }: props) => {
  return (
    <InputOTP
      id={id}
      maxLength={3}
      pattern={REGEXP_ONLY_DIGITS}
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      o
    </InputOTP>
  );
};

export { ThreeDigitsInput };
