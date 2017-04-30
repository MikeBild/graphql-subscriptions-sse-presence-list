const SERVICE_PORT = process.env.SERVICE_PORT || 8080;

const express = require('express');
const expressCors = require('cors');
const expressBodyParser = require('body-parser');
const expressGraphQL = require('express-graphql');
const graphqlSubscriptions = require('graphql-subscriptions');
const expressGraphQLSubscriptionsSSETransport = require('subscriptions-transport-sse');

const pubsub = new graphqlSubscriptions.PubSub();
const store = require('./store')();
const schema = require('./schema')({store, pubsub});
require('./update-presences')({store, pubsub}).start();

const app = express();
app.disable('x-powered-by');
app.use(expressCors());
app.use(expressBodyParser.json());
app.use('/graphql', expressGraphQL(req => ({
  schema: schema,
  rootValue: {},
  graphiql: true,
  context: {},
})));

const subscriptionManager = new graphqlSubscriptions.SubscriptionManager({schema, pubsub,
  setupFunctions: {
    onPresence: (options, args) => ({
      presenceChannel: {filter: event => true},
    }),
  },
});

expressGraphQLSubscriptionsSSETransport.SubscriptionServer({
  onSubscribe: (msg, params) => Object.assign({}, params, {context: {}}),
  subscriptionManager: subscriptionManager,
  }, { express: app, path: '/subscriptions', }
);

app.listen(SERVICE_PORT, () => console.log(`Listen on ${SERVICE_PORT}`));
