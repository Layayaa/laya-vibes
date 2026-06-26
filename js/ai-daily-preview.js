(() => {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  const fallbackDaily = () => ({
    date: new Date().toISOString(),
    headline: 'AI 时代日报：智能体工具、开源模型与企业落地继续升温',
    summary: '本期备用日报聚焦 AI 应用开发的稳定主线：智能体工作流、多模态产品、开源模型生态、企业知识库和安全治理。即使实时来源暂时不可用，页面也会展示这版可读、可下载的日报内容。',
    signals: [
      '智能体工具从演示走向工作流，重点转向权限、记忆、评估和可回滚执行。',
      '开源模型生态继续分层，轻量模型、本地推理和垂直微调更适合中小团队试点。',
      '多模态能力正在进入内容生产、客服、教育和数据分析场景。',
      '企业落地的关键不再只是模型能力，而是数据治理、流程集成和成本控制。',
      'AI 安全关注点扩展到提示注入、数据泄露、模型供应链和自动化代理失控。',
    ],
    stories: [
      {
        category: 'AGENTS',
        title: '智能体产品进入工作流改造阶段',
        body: '更多团队开始把 AI agent 放进研发、运营和内容流程中。真正有价值的方向不是单次对话，而是能追踪任务状态、调用工具并保留审计记录。',
        sourceName: '备用日报编辑部',
        sourceUrl: '#daily',
      },
      {
        category: 'OPEN SOURCE',
        title: '开源模型生态推动本地 AI 应用试验',
        body: '本地推理和小模型部署降低了试错门槛。对个人开发者和小团队来说，开源模型更适合做原型、私有知识库和低成本自动化工具。',
        sourceName: '备用日报编辑部',
        sourceUrl: '#daily',
      },
      {
        category: 'PRODUCT',
        title: '多模态能力让 AI 产品更接近真实任务',
        body: '文本、图像、语音和文件理解正在合并到同一体验里。用户不再只期待聊天回答，而是希望 AI 能读材料、提结构、生成结果并可继续修改。',
        sourceName: '备用日报编辑部',
        sourceUrl: '#daily',
      },
      {
        category: 'ENTERPRISE',
        title: '企业 AI 落地更依赖数据与权限设计',
        body: '企业内部知识库、客服助手和销售支持系统的成败，通常取决于数据清洗、权限边界和业务流程，而不是单纯更换更强模型。',
        sourceName: '备用日报编辑部',
        sourceUrl: '#daily',
      },
      {
        category: 'DEVTOOLS',
        title: 'AI 编程助手从补全走向项目级协作',
        body: '开发者工具正在从代码补全扩展到需求拆解、测试生成、重构建议和仓库级问答。团队需要配套代码审查和测试，避免自动化扩大错误。',
        sourceName: '备用日报编辑部',
        sourceUrl: '#daily',
      },
      {
        category: 'SAFETY',
        title: 'AI 安全治理成为应用上线前的必选项',
        body: '提示注入、敏感信息泄露和工具误调用是应用层最常见风险。上线前应加入输入过滤、权限隔离、日志审计和人工确认机制。',
        sourceName: '备用日报编辑部',
        sourceUrl: '#daily',
      },
    ],
  });

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const renderDaily = (root, daily, status = '真实来源已更新') => {
    const source = Array.isArray(daily?.stories) && daily.stories.length ? daily : fallbackDaily();
    const stories = source.stories.slice(0, 6);

    root.hidden = false;
    root.querySelector('[data-ai-daily-preview-status]').textContent = status;
    root.querySelector('[data-ai-daily-preview-headline]').textContent = source.headline || '今日 AI 日报';
    root.querySelector('[data-ai-daily-preview-summary]').textContent = source.summary || '';

    const signals = Array.isArray(source.signals) ? source.signals.slice(0, 5) : [];
    root.querySelector('[data-ai-daily-preview-signals]').innerHTML = signals
      .map((signal) => `<li>${escapeHtml(signal)}</li>`)
      .join('');

    root.querySelector('[data-ai-daily-preview-stories]').innerHTML = stories
      .map((story) => `
        <article class="daily-preview-story">
          <p class="daily-preview-category">${escapeHtml(story.category || 'AI')}</p>
          <h3>${escapeHtml(story.title || '未命名动态')}</h3>
          <p class="daily-preview-body">${escapeHtml(story.body || '')}</p>
          <a href="${escapeHtml(story.sourceUrl || '#')}" target="_blank" rel="noopener">${escapeHtml(story.sourceName || '查看来源')}</a>
        </article>
      `)
      .join('');
  };

  const loadDaily = async (root) => {
    try {
      const response = await fetch('/api/ai-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: 'zh-CN', format: 'preview' }),
      });

      if (!response.ok) throw new Error(`Daily API returned ${response.status}`);
      renderDaily(root, await response.json(), '真实来源已更新');
    } catch (error) {
      console.info('[AI Daily Preview] Using fallback daily.', error);
      renderDaily(root, fallbackDaily(), '备用日报');
    }
  };

  ready(() => {
    const root = document.querySelector('[data-ai-daily-preview]');
    if (root) loadDaily(root);
  });
})();