const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

const DEFAULT_FEEDS = [
  { name: 'Hacker News AI', type: 'json', url: 'https://hn.algolia.com/api/v1/search_by_date?query=AI&tags=story&hitsPerPage=24' },
  { name: 'arXiv AI', type: 'rss', url: 'https://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=16' },
  { name: 'arXiv Machine Learning', type: 'rss', url: 'https://export.arxiv.org/api/query?search_query=cat:cs.LG+OR+cat:stat.ML&sortBy=submittedDate&sortOrder=descending&max_results=16' },
  { name: 'arXiv NLP', type: 'rss', url: 'https://export.arxiv.org/api/query?search_query=cat:cs.CL&sortBy=submittedDate&sortOrder=descending&max_results=16' },
  { name: 'GitHub Trending AI', type: 'github-trending', url: 'https://github.com/trending?since=daily' },
  { name: 'GitHub LLM Repositories', type: 'github-search', url: 'https://api.github.com/search/repositories?q=topic:llm&sort=updated&order=desc&per_page=12' },
  { name: 'GitHub AI Repositories', type: 'github-search', url: 'https://api.github.com/search/repositories?q=topic:artificial-intelligence&sort=updated&order=desc&per_page=12' },
  { name: 'Product Hunt AI', type: 'rss', url: 'https://www.producthunt.com/feed' },
  { name: 'TechCrunch AI', type: 'rss', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { name: 'The Verge AI', type: 'rss', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' },
  { name: 'MIT Technology Review', type: 'rss', url: 'https://www.technologyreview.com/feed/' },
  { name: 'Hugging Face Blog', type: 'rss', url: 'https://huggingface.co/blog/feed.xml' },
  { name: 'OpenAI News', type: 'rss', url: 'https://openai.com/news/rss.xml' },
  { name: 'Google DeepMind Blog', type: 'rss', url: 'https://deepmind.google/blog/rss.xml' },
  { name: 'NVIDIA Blog AI', type: 'rss', url: 'https://blogs.nvidia.com/blog/category/deep-learning/feed/' },
  { name: 'Microsoft AI Blog', type: 'rss', url: 'https://blogs.microsoft.com/feed/' },
  { name: 'Meta AI Blog', type: 'html-links', url: 'https://ai.meta.com/blog/' },
  { name: 'Anthropic News', type: 'html-links', url: 'https://www.anthropic.com/news' },
  { name: 'Reddit LocalLLaMA', type: 'rss', url: 'https://www.reddit.com/r/LocalLLaMA/.rss' },
  { name: 'Reddit MachineLearning', type: 'rss', url: 'https://www.reddit.com/r/MachineLearning/.rss' },
  { name: 'Reddit Artificial', type: 'rss', url: 'https://www.reddit.com/r/artificial/.rss' },
  { name: 'DeepSeek News', type: 'html', url: 'https://api-docs.deepseek.com/news/news250528' },
  { name: 'DeepSeek Official', type: 'html-links', url: 'https://www.deepseek.com/' },
];

const AI_KEYWORDS = [
  'ai', 'artificial intelligence', 'agent', 'llm', 'model', 'openai', 'anthropic',
  'deepseek', 'google', 'gemini', 'claude', 'mistral', 'hugging face', 'nvidia',
  'robot', 'inference', 'chatbot', 'copilot', 'arxiv', 'paper', 'benchmark',
  'github', 'open source', 'research', 'transformer', 'diffusion', 'multimodal',
  'reasoning', 'rag', 'eval', 'inference', '生成式', '人工智能', '大模型', '开源', '论文',
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

async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY;

  try {
    const items = await collectSourceItems();
    if (!items.length) {
      response.status(200).json(fallbackDaily('暂时没有抓到可用 AI 新闻源'));
      return;
    }

    if (!apiKey) {
      response.status(200).json(buildSourceDaily(items, '真实来源摘要版（未配置 DeepSeek）'));
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

export default handler;

async function collectSourceItems() {
  const feeds = getFeeds();
  const results = await Promise.allSettled(feeds.map((feed) => fetchFeed(feed)));
  const items = results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));

  return dedupeItems(items)
    .filter(isAiRelated)
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, 72);
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
    if (feed.type === 'json') return parseJsonFeed(feed, text);
    if (feed.type === 'github-search') return parseGitHubSearch(feed, text);
    if (feed.type === 'github-trending') return parseGitHubTrending(feed, text);
    if (feed.type === 'html') return parseHtmlPage(feed, text);
    if (feed.type === 'html-links') return parseHtmlLinks(feed, text);
    return parseRssFeed(feed, text);
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

function parseGitHubSearch(feed, text) {
  const json = JSON.parse(text);
  return (json.items || []).map((item) => ({
    sourceName: feed.name,
    title: cleanText(item.full_name || item.name || ''),
    body: cleanText([
      item.description,
      item.language ? `Language: ${item.language}` : '',
      Number.isFinite(item.stargazers_count) ? `Stars: ${item.stargazers_count}` : '',
      Array.isArray(item.topics) && item.topics.length ? `Topics: ${item.topics.slice(0, 6).join(', ')}` : '',
    ].filter(Boolean).join(' ')),
    sourceUrl: item.html_url,
    publishedAt: item.updated_at || item.pushed_at || item.created_at,
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

function parseGitHubTrending(feed, html) {
  const articles = [...html.matchAll(/<article\b[\s\S]*?<\/article>/gi)];
  return articles.map((article) => {
    const block = article[0];
    const repoPath = cleanText((block.match(/<h2\b[\s\S]*?<a\b[^>]*href=["']([^"']+)["']/i) || [])[1] || '');
    const title = repoPath.replace(/^\//, '').replace(/\s+/g, '');
    const body = cleanText((block.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i) || [])[1] || '');
    const language = cleanText((block.match(/itemprop=["']programmingLanguage["'][^>]*>([\s\S]*?)<\/span>/i) || [])[1] || '');
    const stars = cleanText((block.match(/(\d[\d,]*)\s+stars?\s+today/i) || [])[1] || '');

    return {
      sourceName: feed.name,
      title: title ? `${title}${stars ? ` - ${stars} stars today` : ''}` : '',
      body: [body, language ? `Language: ${language}` : ''].filter(Boolean).join(' '),
      sourceUrl: title ? `https://github.com/${title}` : '',
      publishedAt: new Date().toISOString(),
    };
  }).filter((item) => item.title && item.sourceUrl);
}

function parseHtmlPage(feed, html) {
  const title = cleanText(
    (html.match(/<meta\b[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) || [])[1]
    || (html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1]
    || feed.name
  );
  const body = cleanText(
    (html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) || [])[1]
    || (html.match(/<meta\b[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) || [])[1]
    || html.match(/<main\b[\s\S]*?<\/main>/i)?.[0]
    || ''
  );
  const publishedAt = cleanText(
    (html.match(/<meta\b[^>]*property=["']article:published_time["'][^>]*content=["']([^"']+)["']/i) || [])[1]
    || (html.match(/datetime=["']([^"']+)["']/i) || [])[1]
    || ''
  );

  return [{
    sourceName: feed.name,
    title,
    body,
    sourceUrl: feed.url,
    publishedAt,
  }].filter((item) => item.title && item.sourceUrl);
}

function parseHtmlLinks(feed, html) {
  const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  return links.map((link) => {
    const sourceUrl = absolutizeUrl(link[1], feed.url);
    const title = cleanText(link[2]);
    return {
      sourceName: feed.name,
      title,
      body: title,
      sourceUrl,
      publishedAt: new Date().toISOString(),
    };
  }).filter((item) => item.title && item.sourceUrl && isRelevantHtmlLink(item, feed.url));
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
    'signals 是 5 到 7 条字符串，覆盖行业趋势、产品发布、开发者工具、论文/研究、开源社区、资本/公司动态、风险或监管。',
    'stories 是 8 到 12 条对象，每条包含 category, title, body, sourceName, sourceUrl。',
    'body 控制在 100 到 140 个中文字符，必须讲清楚事件、影响和为什么值得关注。',
    'sourceName 和 sourceUrl 必须从下方来源材料中选择，不能编造。',
    '',
    sourceText,
  ].join('\n');
}

function buildSourceDaily(items, headline) {
  const stories = items.slice(0, 12).map((item) => ({
    category: inferCategory(item),
    title: item.title,
    body: truncate(item.body || item.title, 130),
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl,
  }));

  const sourceNames = [...new Set(items.map((item) => item.sourceName))].slice(0, 8);

  return {
    date: new Date().toISOString(),
    headline,
    summary: `已从 ${sourceNames.join('、')} 等公开来源抓取真实 AI 动态。当前未配置 DeepSeek key，因此先展示来源摘要版；配置 key 后会自动生成编辑化中文日报。`,
    signals: [
      `今日采集到 ${items.length} 条候选内容，覆盖论文、开源、产品和公司博客。`,
      `来源包括 ${sourceNames.slice(0, 4).join('、')} 等稳定公开渠道。`,
      '每条新闻都保留原始 sourceName 和 sourceUrl，便于点击核验。',
      '无 DeepSeek key 时不编造总结，只压缩真实来源标题和摘要。',
      '配置 DEEPSEEK_API_KEY 后会升级为 8 到 12 条中文编辑版日报。',
    ],
    stories,
  };
}

function inferCategory(item) {
  const text = `${item.title} ${item.body} ${item.sourceName}`.toLowerCase();
  if (text.includes('arxiv') || text.includes('paper') || text.includes('research')) return 'RESEARCH';
  if (text.includes('github') || text.includes('open source')) return 'OPEN SOURCE';
  if (text.includes('product hunt') || text.includes('launch')) return 'PRODUCT';
  if (text.includes('reddit')) return 'COMMUNITY';
  if (text.includes('anthropic') || text.includes('openai') || text.includes('deepmind') || text.includes('meta') || text.includes('microsoft') || text.includes('nvidia') || text.includes('deepseek')) return 'COMPANY';
  return 'AI';
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
      const matchedSource = findSource(story, sourceItems);
      const source = matchedSource || sourceItems[index % sourceItems.length] || {};
      return {
        category: story.category || inferCategory(source),
        title: matchedSource && story.title ? story.title : source.title || 'AI 行业动态',
        body: matchedSource && story.body ? story.body : truncate(source.body || source.title || '', 130),
        sourceName: source.sourceName || 'Source',
        sourceUrl: source.sourceUrl || '#daily',
      };
    }) : fallback.stories,
  };
}

function findSource(story, sourceItems) {
  if (!story?.sourceUrl) return null;
  const storyUrl = normalizeUrl(story.sourceUrl);
  return sourceItems.find((item) => normalizeUrl(item.sourceUrl) === storyUrl) || null;
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

function absolutizeUrl(url, baseUrl) {
  try {
    return new URL(cleanText(url), baseUrl).toString();
  } catch {
    return cleanText(url);
  }
}

function isRelevantHtmlLink(item, baseUrl) {
  try {
    const source = new URL(item.sourceUrl);
    const base = new URL(baseUrl);
    if (source.hostname !== base.hostname) return false;
    return source.pathname !== '/' && source.pathname !== base.pathname;
  } catch {
    return false;
  }
}

function normalizeUrl(url) {
  try {
    const parsed = new URL(cleanText(url));
    parsed.hash = '';
    parsed.searchParams.sort();
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return cleanText(url).replace(/\/$/, '');
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
