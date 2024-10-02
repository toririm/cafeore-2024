import { useCallback, useState } from "react";

const InputStatusList = [
  "discount",
  "items",
  "received",
  "description",
  "submit",
] as const;

/**
 * CashierV2 のドメイン固有のフック
 * 入力ステータスを管理する
 */
const useInputStatus = () => {
  const [inputStatus, setInputStatus] =
    useState<(typeof InputStatusList)[number]>("discount");

  const proceedStatus = useCallback(() => {
    const idx = InputStatusList.indexOf(inputStatus);
    setInputStatus(InputStatusList[(idx + 1) % InputStatusList.length]);
  }, [inputStatus]);

  const previousStatus = useCallback(() => {
    const idx = InputStatusList.indexOf(inputStatus);
    setInputStatus(
      InputStatusList[
        (idx - 1 + InputStatusList.length) % InputStatusList.length
      ],
    );
  }, [inputStatus]);

  return { inputStatus, proceedStatus, previousStatus, setInputStatus };
};

export { useInputStatus };
