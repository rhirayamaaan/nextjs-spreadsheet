import { type Atom, atom, type WritableAtom } from "jotai";
import { atomWithRefresh, unwrap } from "jotai/utils";
import { atomFamily } from "jotai-family";

export type QueryUpdater<Response> =
  | Response
  | ((prev: Response) => Response)
  | undefined;

export type Query<Response> = WritableAtom<
  Promise<Response>,
  [action?: QueryUpdater<Response>],
  void
> & {
  sync: Atom<Response>;
};

export type QueryFamily<Param, Response> = ((
  param: Param,
) => Query<Response>) & {
  sync: (param: Param) => Atom<Response>;
};

/**
 * 非同期クエリアトムファクトリ (Suspense 対応 & 同期派生 & refetch & 楽観的/直接更新可能)
 */
export const createQuery = <Response>(
  fetcher: () => Promise<Response>,
  fallback?: Response,
): Query<Response> => {
  const baseAtom = atomWithRefresh(async () => {
    return await fetcher();
  });

  // キャッシュ手動更新用のオーバーライド Atom
  const overrideAtom = atom<Promise<Response> | null>(null);

  let syncAtom: Atom<Response>;

  const mainAtom = atom(
    (get) => {
      const override = get(overrideAtom);
      if (override !== null) {
        return override;
      }
      return get(baseAtom);
    },
    (get, set, action?: QueryUpdater<Response>) => {
      if (action === undefined) {
        // 引数なしは refresh (サーバーからの再フェッチ)
        set(overrideAtom, null);
        set(baseAtom);
      } else if (typeof action === "function") {
        // 関数アップデータによるキャッシュ直接更新
        const prev = get(syncAtom);
        const next = (action as (prev: Response) => Response)(prev);
        set(overrideAtom, Promise.resolve(next));
      } else {
        // 値指定によるキャッシュ直接更新
        set(overrideAtom, Promise.resolve(action));
      }
    },
  );

  syncAtom = unwrap(mainAtom, (prev) => (prev ?? fallback) as Response);

  return Object.assign(mainAtom, { sync: syncAtom });
};

/**
 * 引数（ID等）を受け取る非同期クエリアトムファミリファクトリ (キー単位キャッシュ & 同期派生 & refetch & 楽観的更新可能)
 */
export const createQueryFamily = <Param, Response>(
  fetcher: (param: Param) => Promise<Response>,
  fallback?: Response | ((param: Param) => Response),
): QueryFamily<Param, Response> => {
  const family = atomFamily((param: Param) => {
    const defaultVal =
      typeof fallback === "function"
        ? (fallback as (param: Param) => Response)(param)
        : fallback;
    return createQuery(() => fetcher(param), defaultVal);
  });

  const syncFamily = atomFamily((param: Param) => {
    return family(param).sync;
  });

  return Object.assign(family, { sync: syncFamily });
};
