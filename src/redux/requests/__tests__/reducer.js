import { noop } from 'lodash';

import * as actions from '../actions';
import reducer, { initialState } from '../reducer';

import {
  ADD_PENDING_REQUEST,
  ADD_FAILED_REQUEST,
  FINALIZE_REQUEST,
  CLEAR_FAILED_REQUEST,
  CLEAR_QUEUED_REQUEST,
  QUEUE_REQUEST,
} from 'redux/constants';

const requestType = 'TEST_REQUEST_SUCCESS';
const payload = { id: 3 };

const queuedRequestAction = {
  type: QUEUE_REQUEST,
  meta: {
    request: noop,
    requestType,
  },
  payload,
};

const pendingRequestAction = {
  type: ADD_PENDING_REQUEST,
  meta: {
    request: noop,
    requestType,
  },
  payload,
};

const failedRequestAction = {
  type: ADD_FAILED_REQUEST,
  error: true,
  payload: { message: 'this request was a failure, doomed from the start' },
  meta: {
    requestType,
    requestPayload: payload,
  },
};

const finalizeRequestAction = {
  type: FINALIZE_REQUEST,
  meta: {
    requestType,
  },
  payload,
};

const clearFailedRequestAction = {
  type: CLEAR_FAILED_REQUEST,
  payload: {
    requestType,
  },
};

const clearQueuedRequestAction = {
  ...queuedRequestAction,
  type: CLEAR_QUEUED_REQUEST,
};

test('calling queueRequest action adds the action to the queue', () => {
  const action = actions.queueRequest({ meta: { requestType }, payload });
  const newState = reducer(initialState, action);
  expect(newState.queue.length).toEqual(1);
  const queuedRequest = newState.queue[0];
  expect(queuedRequest.payload.meta.requestType).toEqual(requestType);
});

test('addPendingRequestHandler action removes the matching request from the queue', () => {
  const state = {
    queue: [queuedRequestAction],
    pending: [],
    failed: {},
  };
  const newState = reducer(state, pendingRequestAction);
  expect(newState.queue.length).toEqual(0);
});

test('addPendingRequestHandler action does not remove the request from the queue with same key but different payload', () => {
  const testQueuedRequestAction = {
    ...queuedRequestAction,
    payload: { id: 7 },
  };
  const state = {
    queue: [testQueuedRequestAction],
    pending: [],
    failed: {},
  };
  const newState = reducer(state, pendingRequestAction);
  expect(newState.queue.length).toEqual(1);
});

test('addPendingRequestHandler action adds the request to pending', () => {
  const state = {
    queue: [queuedRequestAction],
    pending: [],
    failed: {},
  };
  const newState = reducer(state, pendingRequestAction);
  expect(newState.pending.length).toEqual(1);
  const pending = newState.pending[0];
  expect(pending.meta.requestType).toEqual(requestType);
});

test('addPendingRequestHandler removes any action with the same requestType from failed', () => {
  const state = {
    queue: [queuedRequestAction],
    pending: [],
    failed: {
      [requestType]: pendingRequestAction,
    },
  };
  const newState = reducer(state, pendingRequestAction);
  expect(newState.failed[requestType]).toEqual(undefined);
});

test('addFailedRequestHandler adds the request to failed under key of requestType', () => {
  const newState = reducer(initialState, failedRequestAction);
  expect(newState.failed[requestType]).toEqual(failedRequestAction);
});

test('finalizeRequestHandler removes the matching request from pending', () => {
  const state = {
    queue: [],
    pending: [pendingRequestAction],
    failed: {},
  };
  const newState = reducer(state, finalizeRequestAction);
  expect(newState.pending.length).toEqual(0);
});

test('finalizeRequestHandler action does not remove the request from pending with same key but different payload', () => {
  const testFinalizeRequestAction = {
    type: FINALIZE_REQUEST,
    meta: {
      requestType,
    },
    payload: { id: 7 },
  };
  const state = {
    queue: [],
    pending: [pendingRequestAction],
    failed: {},
  };
  const newState = reducer(state, testFinalizeRequestAction);
  expect(newState.pending.length).toEqual(1);
});

test('clearFailedRequestHandler removes the key and value matching the requestType', () => {
  const state = {
    queue: [],
    pending: [],
    failed: {
      [requestType]: pendingRequestAction,
    },
  };
  const newState = reducer(state, clearFailedRequestAction);
  expect(newState.failed[requestType]).toEqual(undefined);
});

test('clearQueuedRequestHandler removes matching request from the queue', () => {
  const state = {
    queue: [queuedRequestAction],
    pending: [],
    failed: {},
  };
  const newState = reducer(state, clearQueuedRequestAction);
  expect(newState.queue.length).toEqual(0);
});

test('clearQueuedRequestHandler only removes first matching request from the queue', () => {
  const state = {
    queue: [queuedRequestAction, queuedRequestAction],
    pending: [],
    failed: {},
  };
  const newState = reducer(state, clearQueuedRequestAction);
  expect(newState.queue.length).toEqual(1);
  expect(newState.queue[0]).toEqual(queuedRequestAction);
});

test('clearQueuedRequestHandler does not remove the request from the queue with the same key but a different payload', () => {
  const testClearQueuedRequestAction = {
    ...clearQueuedRequestAction,
    payload: { id: 7 },
  };
  const state = {
    queue: [queuedRequestAction],
    pending: [],
    failed: {},
  };
  const newState = reducer(state, testClearQueuedRequestAction);
  expect(newState.queue.length).toEqual(1);
});
