import { LOAD_ANSWER } from 'redux/constants';
import { createRequestAction } from 'redux/utils/createRequestAction';

import { getAnswer } from './api';

export const loadAnswer = createRequestAction(LOAD_ANSWER, getAnswer);
