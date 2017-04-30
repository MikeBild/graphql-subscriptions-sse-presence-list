import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloClient, ApolloProvider, createNetworkInterface, gql, graphql, compose } from 'react-apollo'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-sse'
import Layout from './Layout'

const httpClient = createNetworkInterface({uri: `${process.env.GRAPHQL_URL}/graphql`})
const sseClient = new SubscriptionClient(`${process.env.GRAPHQL_URL}/subscriptions`, {})
const client = new ApolloClient({networkInterface: addGraphQLSubscriptions(httpClient, sseClient)})

ReactDOM.render(
  <ApolloProvider client={client}>
    <Layout />
  </ApolloProvider>,
  document.getElementById('root')
)