import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloClient, ApolloProvider, createNetworkInterface, gql, graphql, compose } from 'react-apollo'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-sse'
import Layout from './Layout'

const httpClient = createNetworkInterface({uri: `http://localhost:8080/graphql`})
const sseClient = new SubscriptionClient(`http://localhost:8080/subscriptions`, {})
const client = new ApolloClient({networkInterface: addGraphQLSubscriptions(httpClient, sseClient)})

ReactDOM.render(
  <ApolloProvider client={client}>
    <Layout />
  </ApolloProvider>,
  document.getElementById('root')
)