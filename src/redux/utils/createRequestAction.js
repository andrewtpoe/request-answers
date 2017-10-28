import invariant from 'invariant';
import { identity, isFunction, isNull } from 'lodash';

import { QUEUE_REQUEST } from 'redux/constants';

export function createRequestAction(
  type,
  request,
  payloadCreator = identity,
  metaCreator,
) {
  invariant(isFunction(request), 'Expected request to be a function');

  invariant(
    isFunction(payloadCreator) || isNull(payloadCreator),
    'Expected payloadCreator to be a function, undefined or null',
  );

  const finalPayloadCreator =
    isNull(payloadCreator) || payloadCreator === identity
      ? identity
      : (head, ...args) =>
          head instanceof Error ? head : payloadCreator(head, ...args);

  const hasMeta = isFunction(metaCreator);

  const actionCreator = (...args) => {
    const payload = finalPayloadCreator(...args);
    const action = {
      type: QUEUE_REQUEST,
      meta: { request, requestType: type },
    };

    if (payload instanceof Error) {
      action.error = true;
    }

    if (payload !== undefined) {
      action.payload = payload;
    }

    if (hasMeta) {
      action.meta = metaCreator(...args);
    }

    return action;
  };

  return actionCreator;
}
