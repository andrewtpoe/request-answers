import { noop } from 'lodash';

import * as selectors from '../selectors';

import {
  ADD_PENDING_REQUEST,
  LOAD_ANSWER,
  QUEUE_REQUEST,
} from 'redux/constants';

const requestType = LOAD_ANSWER;
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

const state = {
  requests: {
    queue: [queuedRequestAction],
    pending: [pendingRequestAction],
    failed: {
      [LOAD_ANSWER]: pendingRequestAction,
    },
  },
};

const loadAnswerActiveSelector = selectors.createHasActiveRequestSelectorFor(
  LOAD_ANSWER,
);

const loadAnswerErrorSelector = selectors.createFailedRequestSelectorFor(
  LOAD_ANSWER,
);

test('queuedRequestsSelector returns the queued requests', () => {
  expect(selectors.queuedRequestsSelector(state)).toEqual([
    queuedRequestAction,
  ]);
});

test('pendingRequestsSelector returns the pending requests', () => {
  expect(selectors.pendingRequestsSelector(state)).toEqual([
    pendingRequestAction,
  ]);
});

test('loadAnswerErrorSelector returns the failed request action if present', () => {
  expect(loadAnswerErrorSelector(state)).toEqual(pendingRequestAction);
});

test('loadAnswerErrorSelector returns the undefined if no failed request present', () => {
  const testState = {
    requests: {
      queue: [queuedRequestAction],
      pending: [pendingRequestAction],
      failed: {},
    },
  };
  expect(loadAnswerErrorSelector(testState)).toEqual(undefined);
});

test('loadAnswerActiveSelector returns true if there is a pending loadAnswer request', () => {
  const testState = {
    requests: {
      queue: [],
      pending: [pendingRequestAction],
      failed: {},
    },
  };
  expect(loadAnswerActiveSelector(testState)).toEqual(true);
});

test('loadAnswerActiveSelector returns true if there is a queued loadAnswer request', () => {
  const testState = {
    requests: {
      queue: [queuedRequestAction],
      pending: [],
      failed: {},
    },
  };
  expect(loadAnswerActiveSelector(testState)).toEqual(true);
});

test('loadAnswerActiveSelector returns false if there is no queued or pending loadAnswer request', () => {
  const testState = {
    requests: {
      queue: [],
      pending: [],
      failed: {},
    },
  };
  expect(loadAnswerActiveSelector(testState)).toEqual(false);
});
