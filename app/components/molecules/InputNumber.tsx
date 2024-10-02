import { type ComponentPropsWithRef, useEffect } from "react";
import { AttractiveTextBox } from "./AttractiveTextBox";

type props = ComponentPropsWithRef<typeof AttractiveTextBox>;

const InputNumber = ({ ...props }: props) => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        // 上下キーで数値を増減させない
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", handler);
    window.addEventListener("keyup", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("keyup", handler);
    };
  }, []);

  return <AttractiveTextBox type="number" {...props} />;
};

export { InputNumber };
