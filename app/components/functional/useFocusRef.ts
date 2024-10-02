import { useEffect, useRef } from "react";

/**
 * focus が true に変化した際に ref が指す DOM にフォーカスを当てる
 * @param focus フォーカスを当てるかどうか
 * @returns
 */
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
