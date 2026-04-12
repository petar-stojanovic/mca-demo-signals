import { patchState, signalStoreFeature, withMethods, withState } from '@ngrx/signals';
import { HttpErrorResponse } from '@angular/common/http';
import { OperatorFunction, pipe } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

export type RequestState = {
  requestLoading: boolean;
  requestSuccess: boolean | undefined;
  requestError: string | null;
};

export const withRequestStateAndErrorHandling = () => {
  return signalStoreFeature(
    withState<RequestState>({
      requestLoading: false,
      requestSuccess: undefined,
      requestError: null,
    }),
    withMethods((store) => {
      return {
        setLoading() {
          patchState(store, {
            requestLoading: true,
            requestSuccess: undefined,
            requestError: null,
          });
        },
        handleRequest<T>(config: {
          next: (response: T) => void;
          error: (error: HttpErrorResponse) => void;
          finalize?: () => void;
        }): OperatorFunction<T, T> {
          return pipe(
            tapResponse({
              next: (response: T) => {
                config.next(response);
                patchState(store, { ...requestStateSuccess(), requestLoading: false });
              },
              error: (error: HttpErrorResponse) => {
                patchState(store, { ...requestStateError(error.error), requestLoading: false });
                config.error(error);
              },
              finalize: config.finalize,
            }),
          );
        },
      };
    }),
  );
};

export function requestStateSuccess(): Omit<RequestState, 'requestLoading'> {
  return {
    requestSuccess: true,
    requestError: null,
  };
}

export function requestStateError(error: string): Omit<RequestState, 'requestLoading'> {
  return {
    requestSuccess: false,
    requestError: error,
  };
}

export function requestStateReset(): RequestState {
  return {
    requestLoading: false,
    requestSuccess: undefined,
    requestError: null,
  };
}
