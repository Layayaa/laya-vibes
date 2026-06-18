const OPENAI_API_URL = 'https://api.openai.com/v1/responses';

const fallbackDaily = () => ({
  date: new Date().toISOString(),
  headline: 'AI 日报后端正在等待 OPENAI_API_KEY',
  summary: 'serverless 入口已经准备好。配置环境变量后，这个接口会使用 OpenAI Web Search 实时检索 AI 行业动态，并返回报纸组件需要的 JSON。',
  signals: [
    '把 OPENAI_API_KEY 配到部署平台环境变量',
    '前端只请求 /api/ai-daily，不接触密钥',
    '建议上线后增加每日缓存和速率限制',
  ],
  stories: [
    {
      category: 'SETUP',
      title: 'Serverless endpoint is ready',
      body: '当前返回的是后端兜底内容。配置密钥并部署到 Vercel 后，接口会实时生成日报。',
      sourceName: 'Local API fallback',
      sourceUrl: '#ai-daily',
    },
  ],
});

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    response.status(200).json(fallbackDaily());
    return;
  }

  try {
    const openaiResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_DAILY_MODEL || 'gpt-5.5',
        tools: [{ type: 'web_search', external_web_access: true }],
        tool_choice: 'required',
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: 'You generate concise Chinese AI industry daily newspapers. Always return valid JSON only.',
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: [
                  '请实时检索今天的 AI 行业动态，生成一份中文 AI 时代日报。',
                  '返回 JSON，字段必须是 date, headline, summary, signals, stories。',
                  'signals 是 3 到 5 条字符串。',
                  'stories 是 4 到 6 条对象，每条包含 category, title, body, sourceName, sourceUrl。',
                  'body 控制在 70 个中文字符以内。sourceUrl 必须是可访问来源链接。',
                  '优先覆盖模型发布、AI 产品更新、开发者工具、AI 公司动态和重要政策/安全新闻。',
                ].join('\n'),
              },
            ],
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'ai_daily',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              required: ['date', 'headline', 'summary', 'signals', 'stories'],
              properties: {
                date: { type: 'string' },
                headline: { type: 'string' },
                summary: { type: 'string' },
                signals: {
                  type: 'array',
                  minItems: 3,
                  maxItems: 5,
                  items: { type: 'string' },
                },
                stories: {
                  type: 'array',
                  minItems: 4,
                  maxItems: 6,
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['category', 'title', 'body', 'sourceName', 'sourceUrl'],
                    properties: {
                      category: { type: 'string' },
                      title: { type: 'string' },
                      body: { type: 'string' },
                      sourceName: { type: 'string' },
                      sourceUrl: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      response.status(openaiResponse.status).json({ error: errorText });
      return;
    }

    const data = await openaiResponse.json();
    const outputText = data.output_text || data.output?.flatMap((item) => item.content || [])
      .filter((content) => content.type === 'output_text')
      .map((content) => content.text)
      .join('');

    if (!outputText) {
      response.status(502).json({ error: 'OpenAI response did not include output text.' });
      return;
    }

    response.status(200).json(JSON.parse(outputText));
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};
