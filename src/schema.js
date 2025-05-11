import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Message {
    content: String!
    role: String!
  }

  type Query {
    messages: [Message!]!
  }

  type Mutation {
    sendMessage(content: String!): Message!
  }
`;

export const resolvers = {
  Query: {
    messages: () => [], // 由于不需要历史记录，始终返回空数组
  },
  Mutation: {
    sendMessage: async (_, { content }, context) => {
      const apiKey = context.env['DEEPSEEK_API_KEY'];
      
      // 调试：输出 API KEY 前几个字符
      console.log("API Key starts with:", apiKey);
      
      // 确保 API KEY 格式正确
      if (!apiKey || !apiKey.startsWith('sk-')) {
        throw new Error(apiKey);
      }
      
      // 调用 DeepSeek API
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content }],
          model: 'deepseek-chat',
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("DeepSeek API error:", errText);
        throw new Error("DeepSeek API 调用失败: " + errText);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        role: 'assistant',
      };
    },
  },
}; 