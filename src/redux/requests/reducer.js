import { omit } from 'lodash';
import { handleActions } from 'redux-actions';

import {
  ADD_FAILED_REQUEST,
  ADD_PENDING_REQUEST,
  CLEAR_FAILED_REQUEST,
  CLEAR_QUEUED_REQUEST,
  FINALIZE_REQUEST,
  QUEUE_REQUEST,
} from '../constants';

export const initialState = {
  failed: {},
  pending: [],
  queue: [],
};

/**
 * removeActionFromList is called in several of the action handlers. It creates a new array
 * with all elements except for the matching request(s). In the case of multiple duplicates,
 * it removes only the first instance.
 */
function removeActionFromList(state, key, action) {
  const list = state[key];
  return list.reduce((acc, request) => {
    if (
      request.meta.requestType === action.meta.requestType &&
      request.payload === action.payload
    ) {
      return acc;
    }
    return acc.concat(request);
  }, []);
}

/**
 * addPendingRequestHandler is called after some deduping logic is performed. This action removes
 * a request from the queue, adds it to pending, and (if the request has previously failed)
 * removes the failure from the store.
 */
function addPendingRequestHandler(state, action) {
  return {
    failed: omit(state.failed, action.meta.requestType),
    pending: state.pending.concat(action),
    queue: removeActionFromList(state, 'queue', action),
  };
}

/**
 * addFailedRequestHandler is called in the event of a request failing. It saves the action under
 * the key of the requestType.
 */
function addFailedRequestHandler(state, action) {
  return {
    ...state,
    failed: {
      ...state.failed,
      [action.meta.requestType]: action,
    },
  };
}

/**
 * finalizeRequestHandler is called when a request has completed, regardless of success or failure.
 * It removes the request action from pending.
 */
function finalizeRequestHandler(state, action) {
  return {
    ...state,
    pending: removeActionFromList(state, 'pending', action),
  };
}

/**
 * clearFailedRequestHandler removes a failed request object from the store. It is not a part of
 * the normal request processing lifecycle, but a separate action that can be called.
 */
function clearFailedRequestHandler(state, action) {
  return {
    ...state,
    failed: omit(state.failed, action.payload.requestType),
  };
}

/**
 * clearQueuedRequestHandler is called in the event a duplicated request is found, before the
 * request is added to pending. This effectively cancels the request before it is submitted.
 */
function clearQueuedRequestHandler(state, action) {
  return {
    ...state,
    queue: removeActionFromList(state, 'queue', action),
  };
}

/**
 * queueRequestHandler is the actual action dispatched wherever an api request is triggered. Its
 * purpose is to add the request to a queue, which is then efficiently batch processed later.
 */
function queueRequestHandler(state, action) {
  return {
    ...state,
    queue: state.queue.concat(action),
  };
}

export default handleActions(
  {
    [ADD_FAILED_REQUEST]: addFailedRequestHandler,
    [ADD_PENDING_REQUEST]: addPendingRequestHandler,
    [CLEAR_FAILED_REQUEST]: clearFailedRequestHandler,
    [CLEAR_QUEUED_REQUEST]: clearQueuedRequestHandler,
    [FINALIZE_REQUEST]: finalizeRequestHandler,
    [QUEUE_REQUEST]: queueRequestHandler,
  },
  initialState,
);
