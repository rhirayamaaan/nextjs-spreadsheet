import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { loadable } from "jotai/utils";
import { useCallback, useMemo } from "react";
import type { Query, QueryFamily } from "./queryAtom";

export type QueryResult<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
};

export type SuspenseQueryResult<T> = {
  data: T;
  refetch: () => void;
};

/**
 * Suspense 前提のクエリフック (TanStack Query の useSuspenseQuery に相当)
 */
export function useSuspenseQuery<Response>(
  query: Query<Response>,
): SuspenseQueryResult<Response>;
export function useSuspenseQuery<Param, Response>(
  queryFamily: QueryFamily<Param, Response>,
  param: Param,
): SuspenseQueryResult<Response>;
export function useSuspenseQuery<Param, Response>(
  queryOrFamily: Query<Response> | QueryFamily<Param, Response>,
  param?: Param,
): SuspenseQueryResult<Response> {
  const targetAtom = useMemo(() => {
    return typeof queryOrFamily === "function"
      ? queryOrFamily(param as Param)
      : queryOrFamily;
  }, [queryOrFamily, param]);

  const [data, dispatchRefetch] = useAtom(targetAtom);
  const refetch = useCallback(() => {
    dispatchRefetch();
  }, [dispatchRefetch]);

  return { data, refetch };
}

/**
 * Suspense を使わず、状態 (isLoading, isError) をハンドリングする汎用クエリフック (TanStack Query の useQuery に相当)
 */
export function useQuery<Response>(
  query: Query<Response>,
): QueryResult<Response>;
export function useQuery<Param, Response>(
  queryFamily: QueryFamily<Param, Response>,
  param: Param,
): QueryResult<Response>;
export function useQuery<Param, Response>(
  queryOrFamily: Query<Response> | QueryFamily<Param, Response>,
  param?: Param,
): QueryResult<Response> {
  const targetAtom = useMemo(() => {
    return typeof queryOrFamily === "function"
      ? queryOrFamily(param as Param)
      : queryOrFamily;
  }, [queryOrFamily, param]);

  const loadableAtom = useMemo(() => {
    return loadable(targetAtom);
  }, [targetAtom]);

  const value = useAtomValue(loadableAtom);
  const dispatchRefetch = useSetAtom(targetAtom);

  const refetch = useCallback(() => {
    dispatchRefetch();
  }, [dispatchRefetch]);

  return {
    data: value.state === "hasData" ? value.data : undefined,
    isLoading: value.state === "loading",
    isError: value.state === "hasError",
    error: value.state === "hasError" ? value.error : null,
    refetch,
  };
}
