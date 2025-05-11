import { ApolloServer } from '@apollo/server';
import { Router } from 'itty-router';
import { typeDefs, resolvers } from './schema';

const router = Router();

// 创建 Apollo Server 实例（不立即启动）
const server = new ApolloServer({ typeDefs, resolvers });

// 处理 GraphQL 请求
router.post('/api/graphql', async (request, env) => {
  try {
    const { query, variables } = await request.json();
    const result = await server.executeOperation({ query, variables }, { contextValue: { env } });
    return new Response(JSON.stringify(result.body.singleResult), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  } catch (err) {
    console.error("GraphQL error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
});

// 处理 OPTIONS 请求（CORS）
router.options('/api/graphql', () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
});

// 处理所有其他请求
router.all('*', () => new Response('Not Found', { status: 404 }));

export default { fetch: router.handle }; 