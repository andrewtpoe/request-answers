import { createSelector } from 'reselect';

const answersStoreSelector = state => state.answers;

export const answerSelector = createSelector(
  answersStoreSelector,
  answersStore => answersStore.answer,
);

export const answerImageSelector = createSelector(
  answersStoreSelector,
  answersStore => answersStore.image,
);
