import {
  type ChangeEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useFocusRef } from "../functional/useFocusRef";
import { Input, type InputProps } from "../ui/input";

type props = InputProps & {
  onTextSet: (text: string) => void;
  focus: boolean;
};

/**
 * focus が true のときに自動でフォーカスを当てるテキストボックス
 */
const AttractiveTextBox = ({ focus, onTextSet, ...props }: props) => {
  const [text, setText] = useState("");
  const DOMRef = useFocusRef(focus);

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

export { AttractiveTextBox };
