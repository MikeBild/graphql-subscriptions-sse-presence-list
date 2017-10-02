const Rx = require('rxjs');

module.exports = ({store, pubsub}) => {

  const $update = Rx.Observable
  .interval(5000)
  .timestamp()
  .do(x => {
    const inactivityTimeout = x.timestamp - 10000
    const leftTimeout = x.timestamp - 20000

    const presences = Object.keys(store.presences).map(x => store.presences[x])

    // set inactive
    presences
    .filter(x => x.timestamp < inactivityTimeout && x.status !== 'BUSY' && x.status !== 'LEFT')
    .forEach(x => {
      store.presences[x.id].status = 'INACTIVE';
      pubsub.publish('presenceChannel', {id: x.id});
    });

    // set inactive to left
    presences
    .filter(x => x.timestamp < leftTimeout && x.status === 'INACTIVE' && x.status !== 'BUSY')
    .forEach(x => {
      store.presences[x.id].status = 'LEFT';
      store.presences[x.id].timestamp = Date.now();
      pubsub.publish('presenceChannel', {id: x.id});
    });

    // delete left
    presences
    .filter(x => x.timestamp < leftTimeout && x.status === 'LEFT')
    .forEach(x => {
      delete store.users[x.id];
      delete store.presences[x.id];
    });

  });

  return {
    start: () => $update.subscribe(),
  };

};
