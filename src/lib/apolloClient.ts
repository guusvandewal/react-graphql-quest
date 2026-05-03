import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { reportError } from './errorReporter';
import { COUNTRIES_ENDPOINT } from './graphql';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  graphQLErrors?.forEach(({ message }) => reportError({ message, context: 'Apollo/GraphQL' }));
  if (networkError) {
    reportError({ message: networkError.message, context: 'Apollo/Network', error: networkError });
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, new HttpLink({ uri: COUNTRIES_ENDPOINT })]),
  cache: new InMemoryCache(),
});
