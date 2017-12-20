import { noop } from 'lodash';

import {
  buildClearQueuedRequestAction,
  buildPendingRequestAction,
  requestsMatch,
  isRequestUnique,
  handleRequestsQueueChange,
} from '../subscriber';

import {
  ADD_PENDING_REQUEST,
  ADD_FAILED_REQUEST,
  FINALIZE_REQUEST,
  CLEAR_QUEUED_REQUEST,
  QUEUE_REQUEST,
} from '../../constants';

const store = {
  dispatch: noop,
  getState: noop,
};

const request = () => new Promise(() => {});
const requestType = 'TEST_REQUEST_SUCCESS';
const payload = { id: 3 };

const queuedRequestAction = {
  type: QUEUE_REQUEST,
  meta: {
    request,
    requestType,
  },
  payload,
};

const pendingRequestAction = {
  type: ADD_PENDING_REQUEST,
  meta: {
    request,
    requestType,
  },
  payload,
};

const clearQueuedRequestAction = {
  ...queuedRequestAction,
  type: CLEAR_QUEUED_REQUEST,
};

test('buildClearQueuedRequestAction returns the expected action', () => {
  expect(buildClearQueuedRequestAction(queuedRequestAction)).toEqual({
    ...queuedRequestAction,
    type: CLEAR_QUEUED_REQUEST,
  });
});

test('buildPendingRequestAction returns an object with the expected shape', () => {
  expect(buildPendingRequestAction(store, queuedRequestAction)).toMatchObject({
    type: ADD_PENDING_REQUEST,
    meta: {
      requestType: queuedRequestAction.meta.requestType,
    },
    payload,
  });
});

test('buildPendingRequestAction assembles the correct promise chain for a successfully resolved request', () => {
  const dispatch = jest.fn();
  const testStore = {
    dispatch,
  };
  const response = { success: true };
  const testRequest = () =>
    new Promise(resolve => {
      resolve({ response });
    });
  const testQueuedRequestAction = {
    type: QUEUE_REQUEST,
    meta: {
      request: testRequest,
      requestType,
    },
    payload,
  };
  const pendingRequest = buildPendingRequestAction(
    testStore,
    testQueuedRequestAction,
  );
  const finalRequest = pendingRequest.meta.request;
  return finalRequest.then(() => {
    expect(dispatch).toHaveBeenCalledWith({
      type: requestType,
      payload: response,
      meta: {
        requestPayload: payload,
      },
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: FINALIZE_REQUEST,
      meta: {
        requestType,
      },
      payload,
    });
  });
});

test('buildPendingRequestAction assembles the correct promise chain for a request that returns an error', () => {
  const dispatch = jest.fn();
  const testStore = {
    dispatch,
  };
  const error = { message: 'This request failed' };
  const testRequest = () =>
    new Promise(resolve => {
      resolve({ error });
    });
  const testQueuedRequestAction = {
    type: QUEUE_REQUEST,
    meta: {
      request: testRequest,
      requestType,
    },
    payload,
  };
  const pendingRequest = buildPendingRequestAction(
    testStore,
    testQueuedRequestAction,
  );
  const finalRequest = pendingRequest.meta.request;
  return finalRequest.then(() => {
    expect(dispatch).toHaveBeenCalledWith({
      type: ADD_FAILED_REQUEST,
      error: true,
      payload: error,
      meta: {
        requestType,
        requestPayload: payload,
      },
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: FINALIZE_REQUEST,
      meta: {
        requestType,
      },
      payload,
    });
  });
});

test('requestsMatch returns true if both requests are the same', () => {
  expect(requestsMatch(pendingRequestAction, pendingRequestAction)).toEqual(
    true,
  );
});

test('requestsMatch returns true if both request types and payloads are the same', () => {
  const secondPendingRequestAction = {
    type: ADD_PENDING_REQUEST,
    meta: {
      request,
      requestType,
    },
    payload,
  };
  expect(
    requestsMatch(pendingRequestAction, secondPendingRequestAction),
  ).toEqual(true);
});

test('requestsMatch returns false if the requests have different types but similar payloads', () => {
  const secondPendingRequestAction = {
    type: ADD_PENDING_REQUEST,
    meta: {
      request,
      requestType: 'DIFFERENT_TEST_REQUEST',
    },
    payload,
  };
  expect(
    requestsMatch(pendingRequestAction, secondPendingRequestAction),
  ).toEqual(false);
});

test('requestsMatch returns false if the requests have different payloads but similar types', () => {
  const secondPendingRequestAction = {
    type: ADD_PENDING_REQUEST,
    meta: {
      request,
      requestType,
    },
    payload: { different: 'payload' },
  };
  expect(
    requestsMatch(pendingRequestAction, secondPendingRequestAction),
  ).toEqual(false);
});

test('request is unique if it only appears once in queue', () => {
  const queuedRequests = [queuedRequestAction];
  const pendingRequests = [];
  expect(
    isRequestUnique(queuedRequestAction, queuedRequests, pendingRequests),
  ).toEqual(true);
});

test('request is NOT unique if it appears twice in queued requests', () => {
  const queuedRequests = [queuedRequestAction, queuedRequestAction];
  const pendingRequests = [];
  expect(
    isRequestUnique(queuedRequestAction, queuedRequests, pendingRequests),
  ).toEqual(false);
});

test('request is NOT unique if it appears in queued and pending requests', () => {
  const queuedRequests = [queuedRequestAction];
  const pendingRequests = [pendingRequestAction];
  expect(
    isRequestUnique(queuedRequestAction, queuedRequests, pendingRequests),
  ).toEqual(false);
});

test('request is NOT unique if it appears in pending requests only', () => {
  const queuedRequests = [];
  const pendingRequests = [pendingRequestAction];
  expect(
    isRequestUnique(queuedRequestAction, queuedRequests, pendingRequests),
  ).toEqual(false);
});

test('handleRequestsQueueChange does not dispatch actions if queue is empty', () => {
  const dispatch = jest.fn();
  const testStore = {
    dispatch,
    getState: () => ({
      requests: {
        queue: [],
        pending: [],
        failed: {},
      },
    }),
  };
  handleRequestsQueueChange(testStore);
  expect(dispatch).not.toHaveBeenCalled();
});

test('handleRequestsQueueChange dispatches add pending request action if queue is contains requests', () => {
  const dispatch = jest.fn(() => true);
  const testStore = {
    dispatch,
    getState: () => ({
      requests: {
        queue: [queuedRequestAction],
        pending: [],
        failed: {},
      },
    }),
  };
  handleRequestsQueueChange(testStore);
  expect(dispatch).toHaveBeenCalled();
  const dispatchedAction = dispatch.mock.calls[0][0];
  expect(dispatchedAction).toMatchObject({
    type: ADD_PENDING_REQUEST,
    meta: {
      requestType,
    },
    payload,
  });
});

test('handleRequestsQueueChange dispatches clear queued request actions if queue is contains duplicate requests', () => {
  const dispatch = jest.fn();
  const testStore = {
    dispatch,
    getState: () => ({
      requests: {
        queue: [queuedRequestAction],
        pending: [pendingRequestAction],
        failed: {},
      },
    }),
  };
  handleRequestsQueueChange(testStore);
  expect(dispatch).toHaveBeenCalledWith(clearQueuedRequestAction);
});
