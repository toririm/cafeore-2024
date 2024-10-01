import { type ChangeEventHandler, useCallback, useEffect, useRef } from "react";
import { Input, type InputProps } from "../ui/input";

type props = InputProps & {
  onTextSet: (text: string) => void;
  focus: boolean;
};

// focus が true のときにフォーカスを当てるテキストボックス
const AttractiveTextBox = ({ focus, onTextSet, ...props }: props) => {
  const DOMRef = useRef<HTMLInputElement>(null);

  const handler: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      onTextSet(event.target.value);
    },
    [onTextSet],
  );

  useEffect(() => {
    if (focus) {
      DOMRef.current?.focus();
    }
  }, [focus]);

  return <Input onChange={handler} ref={DOMRef} {...props} />;
};

export { AttractiveTextBox };
