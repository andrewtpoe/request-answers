import { combineReducers } from 'redux';

import answersReducer from 'redux/answers/reducer';
import requestsReducer from 'redux/requests/reducer';

export default combineReducers({
  answers: answersReducer,
  requests: requestsReducer,
});
