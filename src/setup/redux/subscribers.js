import addRequestsSubscriber from 'redux/requests/subscriber';

const storeSubscribers = [addRequestsSubscriber];

export default function setupSubscriptions(store) {
  storeSubscribers.forEach(subscribe => subscribe(store));
}
