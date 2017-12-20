import React, { Component } from 'react';

import withData from './DataProvider';

class QuestionCard extends Component {
  state = {
    textError: undefined,
    textInput: '',
  };

  handleAnswer = () => {
    if (this.state.textInput) {
      this.setState({ textError: undefined });
      this.props.loadAnswer();
    } else {
      this.setState({ textError: 'Question required' });
    }
  };

  handleReset = () => {
    this.setState({ textInput: '' });
    this.props.clearAnswer();
  };

  updateText = e => {
    if (e.target.value && this.state.textError) {
      this.setState({ textError: undefined });
    }
    this.setState({ textInput: e.target.value });
  };

  render() {
    const {
      answer,
      answerImage,
      loadAnswerError,
      loadAnswerActive,
    } = this.props;

    return (
      <div className="card">
        {answer && (
          <div>
            <div className="card__item">
              <button
                className="button button--block"
                onClick={this.handleReset}
              >
                Ask a new question
              </button>
            </div>
            <div className="card__item">
              <h3>Your Answer:</h3>
              <p>{answer}</p>
              <img className="card__image" src={answerImage} alt="Answer GIF" />
            </div>
          </div>
        )}
        {!answer && (
          <div>
            <div className="card__item">
              <h2>What is your question?</h2>
            </div>
            {this.state.textError && (
              <div className="card__item">
                <div className="card__message card__message--error">
                  {this.state.textError}
                </div>
              </div>
            )}
            <div className="card__item">
              <textarea
                className="card__input"
                required
                rows="5"
                onChange={this.updateText}
                placeholder="Ask a yes/no question. Get your answer from the internet. 100% accurate."
                value={this.state.textInput}
              />
            </div>
            <div className="card__item">
              <button
                className="button button--block"
                onClick={this.handleAnswer}
              >
                Request Answer
              </button>
            </div>
            {loadAnswerActive && (
              <div className="card__item">
                <div className="card__message card__message--success">
                  Request Pending
                </div>
              </div>
            )}
            {loadAnswerError && (
              <div className="card__item">
                <div className="card__message card__message--error">
                  Request Failed
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default withData(QuestionCard);
