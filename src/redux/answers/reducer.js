import { handleActions } from 'redux-actions';

import { CLEAR_ANSWER, LOAD_ANSWER } from '../constants';

export const initialState = {
  answer: undefined,
  image: undefined,
};

function clearAnswer() {
  return initialState;
}

function saveAnswer(state, { payload: { body: { answer, image } } }) {
  return {
    answer,
    image,
  };
}

export default handleActions(
  {
    [CLEAR_ANSWER]: clearAnswer,
    [LOAD_ANSWER]: saveAnswer,
  },
  initialState,
);
