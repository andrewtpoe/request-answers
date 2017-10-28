import { createAction } from 'redux-actions';

import { QUEUE_REQUEST } from '../constants';

export const queueRequest = createAction(QUEUE_REQUEST);
