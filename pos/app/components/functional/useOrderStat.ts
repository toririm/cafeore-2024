import { masterStateConverter } from "common/firebase-utils/converter";
import { documentSub } from "common/firebase-utils/subscription";
import { MasterStateEntity } from "common/models/global";
import useSWRSubscription from "swr/subscription";

/**
 * オーダーストップの状態を取得するフック
 * オーダーストップなら false, 稼働中なら true を返す
 * @returns オーダーの状態が稼働中かどうか
 */
export const useOrderStat = (): boolean => {
  const { data: masterRemoStat } = useSWRSubscription(
    ["global", "master-state"],
    documentSub({ converter: masterStateConverter }),
  );
  const masterStat = masterRemoStat ?? MasterStateEntity.createNew();

  return masterStat.isOrderOperational();
};
