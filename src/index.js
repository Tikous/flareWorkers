import { ApolloServer } from '@apollo/server';
import { graphql } from 'graphql';
import { Router } from 'itty-router';
import { typeDefs, resolvers } from './schema';

const router = Router();

// 创建 Apollo Server 实例
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// 处理 GraphQL 请求
router.post('/api/graphql', async (request, env) => {
  const { query, variables } = await request.json();
  
  const result = await graphql({
    schema: server.schema,
    source: query,
    variableValues: variables,
    contextValue: {
      DEEPSEEK_API_KEY: env.DEEPSEEK_API_KEY,
    },
  });

  return new Response(JSON.stringify(result), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
});

// 处理 OPTIONS 请求（CORS）
router.options('/api/graphql', () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
});

// 处理所有其他请求
router.all('*', () => new Response('Not Found', { status: 404 }));

export default {
  fetch: router.handle,
}; 