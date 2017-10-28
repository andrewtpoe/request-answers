import React from 'react';
import { connect } from 'react-redux';

import { clearAnswer, loadAnswer } from 'redux/answers/actions';
import { answerSelector, answerImageSelector } from 'redux/answers/selectors';
import {
  loadAnswerRequestFailedSelector,
  loadAnswerRequestPendingSelector,
} from 'redux/requests/selectors';

const withData = WrappedComponent => {
  function WrappedComponentWithData(props) {
    return <WrappedComponent {...props} />;
  }

  function mapStateToProps(state) {
    return {
      answer: answerSelector(state),
      answerImage: answerImageSelector(state),
      loadAnswerRequestFailed: loadAnswerRequestFailedSelector(state),
      loadAnswerRequestPending: loadAnswerRequestPendingSelector(state),
    };
  }

  function mapDispatchToProps(dispatch) {
    return {
      clearAnswer: () => dispatch(clearAnswer()),
      loadAnswer: () => dispatch(loadAnswer()),
    };
  }

  return connect(mapStateToProps, mapDispatchToProps)(WrappedComponentWithData);
};

export default withData;
