import {
  type ChangeEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Input, type InputProps } from "../ui/input";

type props = InputProps & {
  onTextSet: (text: string) => void;
  focus: boolean;
};

// focus が true のときにフォーカスを当てるテキストボックス
const AttractiveTextBox = ({ focus, onTextSet, ...props }: props) => {
  const [text, setText] = useState("");
  const DOMRef = useRef<HTMLInputElement>(null);

  const onChangeHandler: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => setText(event.target.value),
    [],
  );

  useEffect(() => {
    onTextSet(text);
  }, [text, onTextSet]);

  useEffect(() => {
    if (focus) {
      DOMRef.current?.focus();
    }
  }, [focus]);

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

export { AttractiveTextBox };
