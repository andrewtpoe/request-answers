# Request Answers

This project correlates with an upcoming series of articles describing the request management system found in src/redux. This unique system builds a queue of requests that are de-duped and processed through in a performant manner. Request pending and failed status is not tracked with a flag, but is instead looked up with efficient selectors.

The code required to create this request management system is complex, but it makes dispatching and tracking requests very simple.

## How it works

1. Creating a request action:

  Request actions are created with the `createRequestAction` helper. This helper is called with two arguments, `requestType` and `request`. `requestType` is the action type that will be dispatched with a successful response payload, and the key a failed request's response will be stored under. `request` is a function that accepts the request's payload and returns a promise that encapsulates the network request.

2. Queueing a request:

  This is done by dispatching a request action the same way as all other action dispatches, but is processed much differently. Dispatching this action will add a request action to `state.requests.queue`.

3. Processing the request:

  A subscriber now monitors the redux store for queued requests, performs deduping logic to ensure we don't have multiple queued or pending requests active with the same endpoint and details within a 16ms(ish) window, and batch processes those requests.

4. Handling successful responses:

  When a request is successful, an action will be dispatched with the response as the payload and a type that was the `requestType` in the `createRequestAction` helper. This can be used to trigger sagas for data normalization or an update to the redux store.

5. Handling failed responses:

  When a request fails, an error action is generated and added to `state.requests.failed`. The key that the error action is kept under is the `requestType` from the `createRequestAction` helper. The original payload is kept in the meta of that request, and the payload contains the response body.

## How do I...

  - **create a request action?**

    ```
    import { createRequestAction } from 'redux/utils/createRequestAction';

    import {
      YOUR_REQUEST_TYPE,
    } from '../constants';

    import {
      yourApiCallThatReturnsAPromise,
    } from './api';

    export const yourRequestAction = createRequestAction(YOUR_REQUEST_TYPE, yourApiCallThatReturnsAPromise);
    ```

  - **get request status?**
    Create a selector for the requests slice of the redux store that parse through the pending and failed requests properties, looking for the `requestType`.

    ```
    export const yourRequestFailedSelector = createSelector(
      requestsStoreSelector,
      requestsStore => requestsStore.failed[YOUR_REQUEST_TYPE],
    );

    export const yourRequestPendingSelector = createSelector(
      pendingRequestsSelector,
      pendingRequests =>
        !findIndex(
          pendingRequests,
          pendingRequest => pendingRequest.meta.requestType === YOUR_REQUEST_TYPE,
        ),
    );
    ```

  - **access error data?**

    Use a selector to retrieve the data from the failed section of the redux store. A failed request for `YOUR_REQUEST_TYPE` will be stored at `requests.failed[YOUR_REQUEST_TYPE]`.

  - **handle sending the same request from multiple components?**

    Just dispatch the actions! This request management system has basic deduping functionality built in. While processing the queue, the subscriber will block the processing of any requests that are exact duplicates of already queued or pending requests (based on comparing both the requestType and the payload).

    If you have multiple components that could be rendered at the same time and need the same data, but you want them to be fully independent and able to trigger a request, just include a bit of logic in your component to ensure you don't trigger a request for data you already have.
