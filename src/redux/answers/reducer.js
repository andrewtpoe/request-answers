import { handleActions } from 'redux-actions';

import { LOAD_ANSWER } from '../constants';

export const initialState = {
  answer: undefined,
  image: undefined,
};

function saveAnswer(state, { payload: { body: { answer, image } } }) {
  return {
    answer,
    image,
  };
}

export default handleActions(
  {
    [LOAD_ANSWER]: saveAnswer,
  },
  initialState,
);
