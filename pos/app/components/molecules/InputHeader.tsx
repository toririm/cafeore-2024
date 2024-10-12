import { memo } from "react";
import { cn } from "~/lib/utils";
import { Circle } from "../atoms/Circle";

type props = {
  title: string;
  focus: boolean;
  number: number;
};

const InputHeader = memo(({ title, focus, number }: props) => {
  return (
    <div className="flex items-center p-3">
      <Circle focus={focus} className="flex-initial">
        {number}
      </Circle>
      <h2
        className={cn(
          "pl-5 font-semibold text-stone-500 text-xl",
          focus && "text-black",
        )}
      >
        {title}
      </h2>
    </div>
  );
});

export { InputHeader };
