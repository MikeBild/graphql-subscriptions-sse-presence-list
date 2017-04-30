const fs = require('fs');
const graphqlTools = require('graphql-tools');
const uuid = require('uuid');

module.exports = ({store, pubsub}) => {
  const definition = fs.readFileSync('schema.graphql');

  return graphqlTools.makeExecutableSchema({
    typeDefs: definition.toString(),
    resolvers: {
      User: {
        presence: (source, args, context, info) => Promise.resolve(store.presences[source.id] || {id: source.id, status: 'LEFT'}),
      },
      Presence: {
        user: (source, args, context, info) => Promise.resolve(store.users[source.id] || {id: source.id}),
      },
      Query: {
        users: (source, args, context, info) => Promise.resolve(Object.keys(store.users).map(x => store.users[x])),
        presences: (source, args, context, info) => Promise.resolve(Object.keys(store.presences).map(x => store.presences[x])),
      },
      Mutation: {
        join: (source, args, context, info) => {
          const userId = args.input.id || uuid.v1();
          store.users[userId] = {id: userId, alias: args.input.alias};
          store.presences[userId] = {id: userId, status: 'AVAILABLE', timestamp: Date.now()};

          pubsub.publish('presenceChannel', {id: userId});

          return store.users[userId];
        },
        leave: (source, args, context, info) => {
          const user = store.users[args.id];
          delete store.users[args.id]
          delete store.presences[args.id]

          pubsub.publish('presenceChannel', {id: args.id});

          return user;
        },
        toggle: (source, args, context, info) => {
          store.presences[args.input.id] = {id: args.input.id, status: args.input.status, timestamp: Date.now()};
          pubsub.publish('presenceChannel', {id: args.input.id});
          return store.users[args.input.id];
        },
      },
      Subscription: {
        onPresence: (source, args, context, info) => Promise.resolve(store.users[source.id] || {id: source.id}),
      },
    },
  });

}
