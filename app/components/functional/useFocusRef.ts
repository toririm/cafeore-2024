import { useEffect, useRef } from "react";

const useFocusRef = (focus: boolean) => {
  const DOMRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focus) {
      DOMRef.current?.focus();
    }
  }, [focus]);

  return DOMRef;
};

export { useFocusRef };
