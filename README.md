# Request Answers

_API request Status is application state._ It should be modeled and managed independently from the data the requests return.

This project correlates with an upcoming series of articles describing the request management system found in `src/redux/requests`. This unique system builds a queue of requests that are de-duped and processed through in a performant manner. Request active and failed status is not tracked with a flag, but is instead looked up with efficient selectors.

The code required to create this request management system is complex, but it makes dispatching and tracking requests very simple. Much of the implementation details below can be customized for use in your app once you understand how this sytem works. This app is just a demo of a concept.

### Creating a request action:

Request actions are created with the `createRequestAction` helper. This helper is called with two arguments, `requestType` and `request`.

* `requestType` is the action type that will be dispatched with a successful response payload, and the key a failed request's response will be stored under.
* `request` is a function that accepts the request's payload and returns a promise. This promise must resolve with an object of the following shape: `{ response, error }`

  **IMPORTANT:** If you are using `fetch`, the request function should handle resolving the bytestream before the promise is returned.

```javascript
import { createRequestAction } from 'redux/utils/createRequestAction';

const BASE_API_URL = 'https://my.api.com';
const LOAD_RESOURCE = 'LOAD_RESOURCE';

function loadResourceFromApi({ resourceId }) {
  return fetch(`${BASE_API_URL}/resource/${resourceId})
    .json()
    .then(response => ({ response }))
    .catch(error => ({ error });
}

const loadResourceAction = createRequestAction(LOAD_RESOURCE, loadResourceFromApi);
```

### Using a request action:

Using the request action is as simple as importing the action, and dispatching it with whatever the request function expects as an argument. For our example above that would be something like this.

```javascript
// You'll need to use something like `react-redux` and connect this action creator to your store.
import { connect } from 'react-redux';

import { loadResourceAction } from '../your/actions/file';

function mapDispatchToState(dispatch) {
  return {
    loadResource: resourceId => dispatch(loadResourceAction({ resourceId })),
  };
}

// Then in your component call the function.
function ResourceLoadingButton({ loadResource, resourceId }) {
  return (
    <button onClick={() => loadResource(resourceId)}>Load the resource</button>
  );
}

connect(undefined, mapDispatchToState)(ResourceLoadingButton);
```

### Request status:

The requests selectors file exports a factory function that allows you create a selector for getting the active status of a request. It returns a boolean indicating if the matching request is queued or pending.

First, create your selector:

```javascript
// create your selector using the helper.
import { createHasActiveRequestSelectorFor } from 'redux/requests/selectors';

const isLoadResourceActive = createHasActiveRequestSelectorFor('LOAD_RESOURCE');
```

Then, connect it to your redux store and use it in a component:

```javascript
// You'll need to use something like `react-redux` and connect the action creators
// and selectors to your store.
import { connect } from 'react-redux';

import { loadResourceAction } from '../your/actions/file';
import { isLoadResourceActive } from '../your/selectors/file';

function mapStateToProps(state) {
  return {
    isLoadingResource: isLoadResourceActive(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loadResource: resourceId => dispatch(loadResourceAction({ resourceId })),
  };
}

// Then in your component call the function.
function ResourceLoadingButton({
  isLoadingResource,
  loadResource,
  resourceId,
}) {
  return (
    <button
      // to prevent the user from clicking again...
      disabled={isLoadingResource}
      onClick={() => loadResource(resourceId)}
    >
      {isLoadingResource ? <LoadingSpinner /> : 'Load the resource'}
    </button>
  );
}

connect(mapStateToProps, mapDispatchToProps)(ResourceLoadingButton);
```

### Processing an unsuccessful response:

Requests that return with an error key are kept in the requests state. The requests selectors file has another factory function that will create a selector that returns the error response for you. This will return an object with the failed request response under the property `payload`.

First, create your selector:

```javascript
import { createFailedRequestSelectorFor } from 'redux/requests/selectors';

const loadResourceError = createFailedRequestSelectorFor('LOAD_RESOURCE');
```

Then, connect it to your redux store and use it in a component:

```javascript
// You'll need to use something like `react-redux` and connect the action creators
// and selectors to your store.
import { connect } from 'react-redux';

import { loadResourceAction } from '../your/actions/file';
import {
  isLoadResourceActive,
  loadResourceError,
} from '../your/selectors/file';

function mapStateToProps(state) {
  return {
    isLoadingResource: isLoadResourceActive(state),
    loadResourceError: loadResourceError(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loadResource: resourceId => dispatch(loadResourceAction({ resourceId })),
  };
}

// Then in your component call the function.
function ResourceLoadingButton({
  isLoadingResource,
  loadResource,
  loadResourceError,
  resourceId,
}) {
  const buttonMessage = () => {
    if (isLoadingResource) {
      return <LoadingSpinner />;
    }
    if (loadResourceError) {
      return loadResourceError.payload.message;
    }
    return 'Load the resource';
  };

  return (
    <button
      // to prevent the user from clicking again...
      disabled={isLoadingResource || loadResourceError}
      onClick={() => loadResource(resourceId)}
    >
      {buttonMessage()}
    </button>
  );
}

connect(mapStateToProps, mapDispatchToProps)(ResourceLoadingButton);
```

### Proccessing a successful response:

Successful responses from the API will cause an action to be dispatched with the `type` set to the `requestType` you set in your `createRequestAction` (`LOAD_RESOURCE` in our example). The response data will be under the `payload` property. You will need to set up some handling for the response in your store that will listen for this type. This could be directly in a reducer, or you may choose to use a saga if the data needs post-processing. How you handle that action is really up to you.

## How it all works

1. Initiating a request:

When you first dispatch a request action (created using `createRequestAction`), you begin a series of events that track a request through its lifespan, from inception to the actual API call to processing of the response to final cleanup. The first step in this lifespan adds your request to a buffer queue. The request action sits in the buffer for approximately 16ms (an imperceptibly short layover). The buffer allows any duplicate requests triggered by the user's actions or page render to be held in a queue so they can be "de-duped" to prevent redundant API calls.

2. Processing the request:

The requests subscriber monitors the redux store for queued requests and performs the de-duping logic to ensure we don't have multiple active requests with the same endpoint and payload. Once the "should it fly" logic is complete, the request has additional logic attached to the promise returned from the `request` function, and is moved to a pending queue. This is when the request is actually sent over the network.

3. Handling successful responses:

When a request is successful, the logic attached by the subscriber dispatches an action that must be handled by your application code. The `type` of this action is the `requestType` that was passed to the `createRequestAction` action creator, and the payload of the action is the API response. Your application code can handle this action in any way you see fit - triggering sagas for data normalization, updating your Redux store, etc.

4. Handling failed responses:

When a request fails, an error action is dispatched that stores the request error data in the requests store. The original request payload is kept in the `meta` of the saved data; the payload is the actual response body. This failed request data is kept until the same request action is dispatched, at which point it is cleared.

5. After any response:

Once the request response has been processed, a finalizing action is dispatched that cleans up the requests state. Think of it as a garbage collector for your request store.

_During the normal lifecycle of a request you can expect to see 4-5 actions dispatched._
