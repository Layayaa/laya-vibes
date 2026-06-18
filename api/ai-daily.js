const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

const DEFAULT_FEEDS = [
  { name: 'Hacker News AI', type: 'json', url: 'https://hn.algolia.com/api/v1/search_by_date?query=AI&tags=story&hitsPerPage=24' },
  { name: 'TechCrunch AI', type: 'rss', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { name: 'The Verge AI', type: 'rss', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' },
  { name: 'MIT Technology Review', type: 'rss', url: 'https://www.technologyreview.com/feed/' },
  { name: 'Hugging Face Blog', type: 'rss', url: 'https://huggingface.co/blog/feed.xml' },
  { name: 'OpenAI News', type: 'rss', url: 'https://openai.com/news/rss.xml' },
];

const AI_KEYWORDS = [
  'ai', 'artificial intelligence', 'agent', 'llm', 'model', 'openai', 'anthropic',
  'deepseek', 'google', 'gemini', 'claude', 'mistral', 'hugging face', 'nvidia',
  'robot', 'inference', 'chatbot', 'copilot', '生成式', '人工智能', '大模型',
];

const fallbackDaily = (reason = 'DeepSeek 后端尚未完成配置') => ({
  date: new Date().toISOString(),
  headline: reason,
  summary: 'serverless 入口已经切换为 DeepSeek 方案。配置 DEEPSEEK_API_KEY 后，接口会先抓取公开 AI 新闻源，再交给 DeepSeek 生成带来源链接的日报 JSON。',
  signals: [
    '前端只请求 /api/ai-daily，不接触密钥',
    '后端先抓公开 RSS/JSON 来源，再让 DeepSeek 总结',
    '可用 AI_DAILY_FEEDS 环境变量追加或替换来源',
  ],
  stories: [
    {
      category: 'SETUP',
      title: 'DeepSeek daily endpoint is ready',
      body: '当前返回的是后端兜底内容。配置 DeepSeek key 后，接口会抓取真实来源并生成日报。',
      sourceName: 'Local API fallback',
      sourceUrl: '#daily',
    },
  ],
});

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY;
  if (!apiKey) {
    response.status(200).json(fallbackDaily('AI 日报后端正在等待 DEEPSEEK_API_KEY'));
    return;
  }

  try {
    const items = await collectSourceItems();
    if (!items.length) {
      response.status(200).json(fallbackDaily('暂时没有抓到可用 AI 新闻源'));
      return;
    }

    const deepseekResponse = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_DAILY_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
        messages: [
          {
            role: 'system',
            content: [
              '你是中文 AI 行业日报编辑。',
              '你只能基于用户提供的来源材料写作，不要编造没有来源的新闻。',
              '只返回合法 JSON，不要 Markdown，不要解释。',
            ].join('\n'),
          },
          {
            role: 'user',
            content: buildPrompt(items),
          },
        ],
        response_format: { type: 'json_object' },
        stream: false,
      }),
    });

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      response.status(deepseekResponse.status).json({ error: errorText });
      return;
    }

    const data = await deepseekResponse.json();
    const content = data.choices?.[0]?.message?.content;
    const daily = parseDailyJson(content);
    response.status(200).json(normalizeDaily(daily, items));
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}

async function collectSourceItems() {
  const feeds = getFeeds();
  const results = await Promise.allSettled(feeds.map((feed) => fetchFeed(feed)));
  const items = results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));

  return dedupeItems(items)
    .filter(isAiRelated)
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, 36);
}

function getFeeds() {
  const customFeeds = (process.env.AI_DAILY_FEEDS || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url, index) => ({ name: `Custom Source ${index + 1}`, type: 'rss', url }));

  return customFeeds.length ? customFeeds : DEFAULT_FEEDS;
}

async function fetchFeed(feed) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'Laya AI Daily/1.0' },
      signal: controller.signal,
    });

    if (!res.ok) return [];
    const text = await res.text();
    return feed.type === 'json' ? parseJsonFeed(feed, text) : parseRssFeed(feed, text);
  } finally {
    clearTimeout(timeout);
  }
}

function parseJsonFeed(feed, text) {
  const json = JSON.parse(text);
  return (json.hits || []).map((item) => ({
    sourceName: feed.name,
    title: cleanText(item.title || item.story_title || ''),
    body: cleanText(item.story_text || item.comment_text || ''),
    sourceUrl: item.url || item.story_url || `https://news.ycombinator.com/item?id=${item.objectID}`,
    publishedAt: item.created_at,
  })).filter((item) => item.title && item.sourceUrl);
}

function parseRssFeed(feed, xml) {
  const entries = [...xml.matchAll(/<item\b[\s\S]*?<\/item>|<entry\b[\s\S]*?<\/entry>/gi)];
  return entries.map((entry) => {
    const block = entry[0];
    const title = pickXml(block, ['title']);
    const link = pickLink(block);
    const body = pickXml(block, ['description', 'summary', 'content:encoded', 'content']);
    const publishedAt = pickXml(block, ['pubDate', 'published', 'updated', 'dc:date']);

    return {
      sourceName: feed.name,
      title: cleanText(title),
      body: cleanText(body),
      sourceUrl: cleanText(link),
      publishedAt: cleanText(publishedAt),
    };
  }).filter((item) => item.title && item.sourceUrl);
}

function pickXml(block, names) {
  for (const name of names) {
    const pattern = new RegExp(`<${escapeRegExp(name)}\\b[^>]*>([\\s\\S]*?)<\\/${escapeRegExp(name)}>`, 'i');
    const match = block.match(pattern);
    if (match) return match[1];
  }
  return '';
}

function pickLink(block) {
  const atomLink = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/i);
  if (atomLink) return atomLink[1];
  return pickXml(block, ['link']);
}

function dedupeItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = (item.sourceUrl || item.title).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isAiRelated(item) {
  const text = `${item.title} ${item.body} ${item.sourceName}`.toLowerCase();
  return AI_KEYWORDS.some((keyword) => text.includes(keyword));
}

function buildPrompt(items) {
  const sourceText = items.map((item, index) => [
    `【${index + 1}】${item.title}`,
    `来源：${item.sourceName}`,
    `链接：${item.sourceUrl}`,
    `时间：${item.publishedAt || 'unknown'}`,
    `摘要：${truncate(item.body || item.title, 260)}`,
  ].join('\n')).join('\n\n');

  return [
    '请基于以下真实来源材料，生成一份中文「AI 时代日报」。',
    '输出 JSON，字段必须是 date, headline, summary, signals, stories。',
    'signals 是 5 到 7 条字符串，覆盖行业趋势、产品发布、开发者工具、资本/公司动态、风险或监管。',
    'stories 是 8 到 12 条对象，每条包含 category, title, body, sourceName, sourceUrl。',
    'body 控制在 100 到 140 个中文字符，必须讲清楚事件、影响和为什么值得关注。',
    'sourceName 和 sourceUrl 必须从下方来源材料中选择，不能编造。',
    '',
    sourceText,
  ].join('\n');
}

function parseDailyJson(content) {
  if (!content) throw new Error('DeepSeek response did not include message content.');
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('DeepSeek response was not valid JSON.');
    return JSON.parse(match[0]);
  }
}

function normalizeDaily(daily, sourceItems) {
  const fallback = fallbackDaily();
  const stories = Array.isArray(daily.stories) ? daily.stories : [];

  return {
    date: daily.date || new Date().toISOString(),
    headline: daily.headline || fallback.headline,
    summary: daily.summary || fallback.summary,
    signals: Array.isArray(daily.signals) && daily.signals.length ? daily.signals.slice(0, 7) : fallback.signals,
    stories: stories.length ? stories.slice(0, 12).map((story, index) => {
      const source = findSource(story, sourceItems) || sourceItems[index % sourceItems.length] || {};
      return {
        category: story.category || 'AI',
        title: story.title || source.title || 'AI 行业动态',
        body: story.body || truncate(source.body || source.title || '', 130),
        sourceName: story.sourceName || source.sourceName || 'Source',
        sourceUrl: story.sourceUrl || source.sourceUrl || '#daily',
      };
    }) : fallback.stories,
  };
}

function findSource(story, sourceItems) {
  if (!story?.sourceUrl) return null;
  return sourceItems.find((item) => item.sourceUrl === story.sourceUrl) || null;
}

function cleanText(value) {
  return decodeEntities(String(value || ''))
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function truncate(value, maxLength) {
  const text = cleanText(value);
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
