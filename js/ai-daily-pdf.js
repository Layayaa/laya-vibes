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
        headline: 'AI 日报接口尚未接入，PDF 下载流程已准备好',
        summary: '这是预览版日报。部署 serverless 并配置 OPENAI_API_KEY 后，按钮会实时检索当天 AI 行业资料，生成并下载 PDF。',
        signals: [
            '页面只展示一个下载按钮，减少视觉干扰',
            'OpenAI API key 只放在 serverless 环境变量里',
            'PDF 用隐藏报纸模板生成，方便保存和转发',
        ],
        stories: [
            {
                category: '架构',
                title: '为什么需要 serverless 后端',
                body: '实时检索和 OpenAI 调用不能放在前端，否则密钥会暴露。serverless 负责保护密钥、限制调用并返回结构化日报。',
                sourceName: '实现说明',
                sourceUrl: '#daily',
            },
            {
                category: '产品',
                title: '只保留按钮，让功能更像工具',
                body: '用户点击后直接得到当天 PDF，不需要在网页里阅读长内容，适合作为个人网站里的轻量自动化能力展示。',
                sourceName: '产品说明',
                sourceUrl: '#daily',
            },
            {
                category: '设计',
                title: 'PDF 使用报纸版式承载信息',
                body: '报纸结构包含刊头、头条、编辑观察和多栏新闻，让 AI 生成内容更像可审阅的成品，而不是聊天文本。',
                sourceName: '设计说明',
                sourceUrl: '#daily',
            },
            {
                category: '下一步',
                title: '上线后接入 /api/ai-daily',
                body: '前端已约定请求 /api/ai-daily。部署到 Vercel 或其他 serverless 平台后，配置环境变量即可启用实时版本。',
                sourceName: '接口约定',
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
        stage.innerHTML = `
            <article class="daily-pdf-paper">
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
                    ${daily.stories.map((story) => `
                        <article class="daily-pdf-story">
                            <p class="daily-pdf-story-category">${escapeHtml(story.category || '更新')}</p>
                            <h4>${escapeHtml(story.title || '未命名')}</h4>
                            <p>${escapeHtml(story.body || '')}</p>
                            <div class="daily-pdf-source">${escapeHtml(story.sourceName || '来源')}: ${escapeHtml(story.sourceUrl || '')}</div>
                        </article>
                    `).join('')}
                </section>
            </article>
        `;
        document.body.appendChild(stage);
        return stage;
    };

    const downloadDailyPdf = async (button) => {
        if (!window.html2canvas || !window.jspdf?.jsPDF) {
            throw new Error('PDF libraries are not loaded.');
        }

        const daily = await fetchDaily();
        const stage = buildPdfStage(daily);

        try {
            await document.fonts?.ready;
            const canvas = await window.html2canvas(stage, {
                backgroundColor: '#FFF7E8',
                scale: 2,
                useCORS: true,
            });

            const imageData = canvas.toDataURL('image/jpeg', 0.94);
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imageData, 'JPEG', 0, 0, pageWidth, pageHeight);
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
