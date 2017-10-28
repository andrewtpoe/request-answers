import React from 'react';

import QuestionCard from 'compositions/QuestionCard';

function Home() {
  return (
    <div>
      <div className="content">
        <QuestionCard />
      </div>
      <div className="content">
        <div className="content__link">
          <a href="https://github.com/andrewtpoe/request-answers">
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;
