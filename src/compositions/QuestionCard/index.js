import React from 'react';

import withData from './DataProvider';

function QuestionCard({
  answer,
  answerImage,
  loadAnswer,
  loadAnswerRequestFailed,
  loadAnswerRequestPending,
}) {
  return (
    <div>
      <button onClick={loadAnswer}>Click here for the answer.</button>
      <h3>Answer Request Pending:</h3>
      <p>{loadAnswerRequestPending ? 'true' : ''}</p>
      <h3>Answer Request Failed:</h3>
      <p>{loadAnswerRequestFailed ? 'true' : ''}</p>
      <h3>Your Answer:</h3>
      <p>{answer}</p>
      {answerImage && <img src={answerImage} alt="Answer GIF" />}
    </div>
  );
}

export default withData(QuestionCard);
