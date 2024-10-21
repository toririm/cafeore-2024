import { Input, type InputProps } from "common/components/ui/input";
import {
  type ChangeEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useFocusRef } from "../functional/useFocusRef";

type props = InputProps & {
  onTextSet: (text: string) => void;
  focus: boolean;
};

/**
 * focus が true のときに自動でフォーカスを当てる input
 */
const AttractiveInput = ({ focus, onTextSet, ...props }: props) => {
  const [text, setText] = useState("");
  const DOMRef = useFocusRef<HTMLInputElement>(focus);

  const onChangeHandler: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => setText(event.target.value),
    [],
  );

  useEffect(() => {
    onTextSet(text);
  }, [text, onTextSet]);

  return (
    <Input
      value={text}
      onChange={onChangeHandler}
      ref={DOMRef}
      disabled={!focus}
      {...props}
    />
  );
};

export { AttractiveInput };
