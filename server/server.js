const express = require('express');
const path = require('path');
const db = require('./config/connection');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});

server.applyMiddleware({ app });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve up static assets
app.use('/images', express.static(path.join(__dirname, '../client/images')));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

db.once('open', () => {
  app.listen(PORT, () => {
    const graphqlPath = server.graphqlPath;
    console.log(`API server running on port ${PORT}!`);
    if (process.env.NODE_ENV === 'production') {
      console.log(`Use GraphQL at ${process.env.RENDER_EXTERNAL_URL}${graphqlPath}`);
    } else {
      console.log(`Use GraphQL at http://localhost:${PORT}${graphqlPath}`);
    }
  });
});
