import { find, curry } from 'lodash';
import { createSelector } from 'reselect';

const requestsStoreSelector = state => state.requests;

export const queuedRequestsSelector = createSelector(
  requestsStoreSelector,
  requestsStore => requestsStore.queue,
);

export const pendingRequestsSelector = createSelector(
  requestsStoreSelector,
  requestsStore => requestsStore.pending,
);

/**
 * A factory function that creates a selector for the pending request of a given type
 */
export const createHasActiveRequestSelectorFor = curry(
  (queuedRequestsSel, pendingRequestsSel, REQUEST_TYPE) =>
    createSelector(
      queuedRequestsSel,
      pendingRequestsSel,
      (queuedRequests, pendingRequests) =>
        !!(
          find(
            queuedRequests,
            request => request.meta.requestType === REQUEST_TYPE,
          ) ||
          find(
            pendingRequests,
            request => request.meta.requestType === REQUEST_TYPE,
          )
        ),
    ),
)(queuedRequestsSelector, pendingRequestsSelector);

const failedRequestsSelector = createSelector(
  requestsStoreSelector,
  requestsStore => requestsStore.failed,
);

/**
 * A factory function that creates a selector for the failed request of a given type
 */
export const createFailedRequestSelectorFor = curry(
  (failedRequestsSel, REQUEST_TYPE) =>
    createSelector(
      failedRequestsSel,
      failedRequests => failedRequests[REQUEST_TYPE],
    ),
)(failedRequestsSelector);
