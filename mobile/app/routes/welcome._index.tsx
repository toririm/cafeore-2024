import { useSearchParams } from "@remix-run/react";
import { orderConverter } from "common/firebase-utils/converter";
import { documentSub } from "common/firebase-utils/subscription";
import { useEffect, useState } from "react";
import useSWRSubscription from "swr/subscription";
import logoVideo from "~/assets/cafeore_logo_in.webm";
import { cn } from "~/lib/utils";

export default function Welcome() {
  const [searchParam, setSearchParam] = useSearchParams();
  const [videoShown, setVideoShown] = useState(true);
  const [logoShown, setLogoShown] = useState(true);
  const id = searchParam.get("id");
  if (!id) {
    return <div>Missing ID</div>;
  }

  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setLogoShown(false);
    }, 1000);
    const timer = setTimeout(() => {
      setVideoShown(false);
    }, 1300);
    return () => {
      clearTimeout(logoTimer);
      clearTimeout(timer);
    };
  }, []);

  const order = useSWRSubscription(
    ["orders", id],
    documentSub({ converter: orderConverter }),
  );

  if (videoShown) {
    return (
      <div
        className={cn(
          "h-screen w-screen transition-all duration-300",
          "opacity-0",
          logoShown && "opacity-100",
        )}
      >
        <div className="h-1/4" />
        <video
          playsInline
          muted
          autoPlay
          src={logoVideo}
          className="h-1/2 w-full object-cover"
        />
      </div>
    );
  }

  return (
    <>
      <div>
        <code>{JSON.stringify(order.data?.toOrder(), null, 2)}</code>
      </div>
    </>
  );
}
