import { useCallback, useMemo, useState } from "react";

type UISession = {
  date: Date;
  key: string;
};

const useUISession = (): [UISession, () => void] => {
  const [date, setDate] = useState(new Date());

  const UISession = useMemo(() => {
    return {
      date,
      key: date.toJSON(),
    };
  }, [date]);

  const renewUISession = useCallback(() => {
    setDate(new Date());
  }, []);

  return [UISession, renewUISession];
};

export { useUISession };
