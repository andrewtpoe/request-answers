import { find } from 'lodash';
import { createSelector } from 'reselect';

import { LOAD_ANSWER } from 'redux/constants';

const requestsStoreSelector = state => state.requests;

export const queuedRequestsSelector = createSelector(
  requestsStoreSelector,
  requestsStore => requestsStore.queue,
);

export const pendingRequestsSelector = createSelector(
  requestsStoreSelector,
  requestsStore => requestsStore.pending,
);

export const loadAnswerRequestFailedSelector = createSelector(
  requestsStoreSelector,
  requestsStore => requestsStore.failed[LOAD_ANSWER],
);

export const loadAnswerRequestPendingSelector = createSelector(
  pendingRequestsSelector,
  pendingRequests =>
    !!find(
      pendingRequests,
      pendingRequest => pendingRequest.meta.requestType === LOAD_ANSWER,
    ),
);
