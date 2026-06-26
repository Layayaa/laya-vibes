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
        summary: '本期备用日报聚焦 AI 应用开发的稳定主线：智能体工作流、多模态产品、开源模型生态、企业知识库和安全治理。即使实时来源暂时不可用，也会生成一版可读、可下载的日报。',
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

    const escapeHtml = (value) => String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const normalizeDaily = (payload) => {
        const fallback = fallbackDaily();
        return {
            date: payload?.date || fallback.date,
            headline: payload?.headline || fallback.headline,
            summary: payload?.summary || fallback.summary,
            signals: Array.isArray(payload?.signals) && payload.signals.length ? payload.signals : fallback.signals,
            stories: Array.isArray(payload?.stories) && payload.stories.length ? payload.stories : fallback.stories,
        };
    };

    const fetchDaily = async () => {
        try {
            const response = await fetch('/api/ai-daily', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locale: 'zh-CN', format: 'pdf' }),
            });

            if (!response.ok) throw new Error(`Daily API returned ${response.status}`);
            return normalizeDaily(await response.json());
        } catch (error) {
            console.info('[AI Daily PDF] Using preview daily because API is unavailable.', error);
            return fallbackDaily();
        }
    };

    const formatDate = (dateValue) => {
        const date = new Date(dateValue);
        const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(safeDate);
    };

    const getIssueNo = (dateValue) => {
        const date = new Date(dateValue);
        const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
        const start = new Date(safeDate.getFullYear(), 0, 0);
        const dayOfYear = Math.floor((safeDate - start) / 86400000);
        return String(dayOfYear).padStart(3, '0');
    };

    const buildPdfStage = (daily) => {
        const stage = document.createElement('div');
        stage.className = 'daily-pdf-stage';
        const dateText = formatDate(daily.date);
        const issueNo = getIssueNo(daily.date);
        const stories = Array.isArray(daily.stories) ? daily.stories : [];
        const firstPageStories = stories.slice(0, 6);
        const extraPages = chunk(stories.slice(6), 6);
        stage.innerHTML = `
            <article class="daily-pdf-paper daily-pdf-page">
                <header class="daily-pdf-masthead">
                    <div class="daily-pdf-ear daily-pdf-ear-left">
                        <span>不刊空谈</span>
                        <span>只录可验</span>
                    </div>
                    <div class="daily-pdf-title-block">
                        <p class="daily-pdf-kicker">Laya 研究台编辑发行</p>
                        <h1 class="daily-pdf-title">人工智能时代日报</h1>
                        <div class="daily-pdf-meta">
                            <span>第 ${issueNo} 号</span>
                            <span>${escapeHtml(dateText)}</span>
                            <span>实时生成版</span>
                            <span>每份一键下载</span>
                        </div>
                    </div>
                    <div class="daily-pdf-ear daily-pdf-ear-right">
                        <span>新闻求实</span>
                        <span>技术为用</span>
                    </div>
                </header>
                <section class="daily-pdf-lead">
                    <p class="daily-pdf-section">本日头条</p>
                    <h2 class="daily-pdf-headline">${escapeHtml(daily.headline)}</h2>
                    <p class="daily-pdf-summary">${escapeHtml(daily.summary)}</p>
                </section>
                <aside class="daily-pdf-signals">
                    <p class="daily-pdf-section">编辑按语</p>
                    <ul>
                        ${daily.signals.map((signal) => `<li>${escapeHtml(signal)}</li>`).join('')}
                    </ul>
                </aside>
                <section class="daily-pdf-stories">
                    ${renderStories(firstPageStories)}
                </section>
            </article>
            ${extraPages.map((pageStories, pageIndex) => `
                <article class="daily-pdf-paper daily-pdf-page daily-pdf-continuation">
                    <header class="daily-pdf-continuation-head">
                        <span>人工智能时代日报</span>
                        <span>续刊第 ${pageIndex + 2} 版</span>
                        <span>${escapeHtml(dateText)}</span>
                    </header>
                    <section class="daily-pdf-stories">
                        ${renderStories(pageStories)}
                    </section>
                </article>
            `).join('')}
        `;
        document.body.appendChild(stage);
        return stage;
    };

    const renderStories = (stories) => stories.map((story) => `
        <article class="daily-pdf-story">
            <p class="daily-pdf-story-category">${escapeHtml(story.category || '更新')}</p>
            <h4>${escapeHtml(story.title || '未命名')}</h4>
            <p>${escapeHtml(story.body || '')}</p>
            <div class="daily-pdf-source">${escapeHtml(story.sourceName || '来源')}: ${escapeHtml(story.sourceUrl || '')}</div>
        </article>
    `).join('');

    const chunk = (items, size) => {
        const pages = [];
        for (let index = 0; index < items.length; index += size) {
            pages.push(items.slice(index, index + size));
        }
        return pages;
    };

    const downloadDailyPdf = async (button) => {
        if (!window.html2canvas || !window.jspdf?.jsPDF) {
            throw new Error('PDF libraries are not loaded.');
        }

        const daily = await fetchDaily();
        const stage = buildPdfStage(daily);

        try {
            await document.fonts?.ready;
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const pages = Array.from(stage.querySelectorAll('.daily-pdf-page'));

            for (const [index, page] of pages.entries()) {
                const canvas = await window.html2canvas(page, {
                    backgroundColor: '#FFF7E8',
                    scale: 2,
                    useCORS: true,
                });
                const imageData = canvas.toDataURL('image/jpeg', 0.94);
                if (index > 0) pdf.addPage();
                pdf.addImage(imageData, 'JPEG', 0, 0, pageWidth, pageHeight);
            }

            pdf.save(`ai-daily-${formatDate(daily.date).replaceAll('/', '-')}.pdf`);
        } finally {
            stage.remove();
            button.disabled = false;
            button.textContent = '下载今日 AI 日报 PDF';
        }
    };

    ready(() => {
        const button = document.querySelector('[data-ai-daily-download]');
        if (!button) return;

        button.addEventListener('click', async () => {
            button.disabled = true;
            button.textContent = '正在生成 PDF...';

            try {
                await downloadDailyPdf(button);
            } catch (error) {
                console.error('[AI Daily PDF] Download failed.', error);
                button.disabled = false;
                button.textContent = 'PDF 生成失败，点击重试';
            }
        });
    });
})();
