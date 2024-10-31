import {
  isRouteErrorResponse,
  useRouteError,
  useSearchParams,
} from "@remix-run/react";
import { orderConverter } from "common/firebase-utils/converter";
import { documentSub } from "common/firebase-utils/subscription";
import { useEffect, useState } from "react";
import useSWRSubscription from "swr/subscription";
import logoMotion from "~/assets/cafeore_logo_motion.webm";
import { cn } from "~/lib/utils";

export default function Welcome() {
  const [searchParam, setSearchParam] = useSearchParams();
  const [videoShown, setVideoShown] = useState(true);
  const id = searchParam.get("id") ?? "none";

  useEffect(() => {
    const timer = setTimeout(() => {
      setVideoShown(false);
    }, 1300);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const order = useSWRSubscription(
    ["orders", id],
    documentSub({ converter: orderConverter }),
  );

  return (
    <>
      <div
        className={cn(
          "absolute top-0 left-0 h-screen w-screen transition-all duration-300",
          "flex items-center justify-center bg-black",
          "grid columns-4",
          !videoShown && "opacity-0",
        )}
      >
        <video
          playsInline
          muted
          autoPlay
          src={logoMotion}
          className="h-3/5 w-full object-contain"
        />
      </div>
      <div
        className={cn(
          "opacity-0 transition-all duration-500",
          !videoShown && "z-10 opacity-100",
        )}
      >
        <h1 className="text-center font-serif text-4xl">珈琲・俺へようこそ</h1>
        <code>{JSON.stringify(order.data?.toOrder(), null, 2)}</code>
      </div>
    </>
  );
}

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  }
  if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  }
  return <h1>Unknown Error</h1>;
};
