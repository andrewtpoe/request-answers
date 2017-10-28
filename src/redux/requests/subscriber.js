import { curry, throttle } from 'lodash';

import { queuedRequestsSelector, pendingRequestsSelector } from './selectors';

import {
  ADD_PENDING_REQUEST,
  ADD_FAILED_REQUEST,
  CLEAR_QUEUED_REQUEST,
  FINALIZE_REQUEST,
} from '../constants';

export function buildClearQueuedRequestAction(queuedRequest) {
  return {
    ...queuedRequest,
    type: CLEAR_QUEUED_REQUEST,
  };
}

export function buildPendingRequestAction(
  store,
  { meta: { requestType, request }, payload },
) {
  return {
    type: ADD_PENDING_REQUEST,
    meta: {
      requestType,
      request: request(payload)
        .then(({ response, error }) => {
          if (error) {
            store.dispatch({
              type: ADD_FAILED_REQUEST,
              error: true,
              payload: error,
              meta: {
                requestType,
                requestPayload: payload,
              },
            });
          } else {
            store.dispatch({
              type: requestType,
              payload: response,
              meta: {
                requestPayload: payload,
              },
            });
          }
        })
        .then(() => {
          store.dispatch({
            type: FINALIZE_REQUEST,
            meta: {
              requestType,
            },
            payload,
          });
        }),
    },
    payload,
  };
}

export function requestsMatch(requestOne, requestTwo) {
  return (
    requestOne === requestTwo ||
    (requestOne.meta.requestType === requestTwo.meta.requestType &&
      requestOne.payload === requestTwo.payload)
  );
}

export function isRequestUnique(request, queuedRequests, pendingRequests) {
  const matcher = curry(requestsMatch)(request);

  // see if this request exists more than once in the request queue....
  const matchingQueuedRequests = queuedRequests.filter(matcher);
  if (matchingQueuedRequests.length > 1) {
    return false;
  }

  // not double-queued, see if this request is already pending...
  return !pendingRequests.find(matcher);
}

export function handleRequestsQueueChange(store) {
  const currentState = store.getState();
  const queuedRequests = queuedRequestsSelector(currentState);
  if (queuedRequests.length > 0) {
    const pendingRequests = pendingRequestsSelector(currentState);
    queuedRequests.forEach(queuedRequest => {
      if (isRequestUnique(queuedRequest, queuedRequests, pendingRequests)) {
        const pendingRequestAction = buildPendingRequestAction(
          store,
          queuedRequest,
        );
        store.dispatch(pendingRequestAction);
      } else {
        const clearQueuedRequestAction = buildClearQueuedRequestAction(
          queuedRequest,
        );
        store.dispatch(clearQueuedRequestAction);
      }
      return true;
    });
  }
}

function addSubscriber(store) {
  // In a real production app, you'd want to set the throttle to a much lower value, maybe 16ms.
  // Just enough time for the page to render and queue up all of the requests that need to happen.
  const onStateChange = throttle(() => {
    handleRequestsQueueChange(store);
  }, 16);
  return store.subscribe(onStateChange);
}

export default addSubscriber;
