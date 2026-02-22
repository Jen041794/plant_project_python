import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import { toZh } from '../utils/diseaseMap';
import Navbar from '../layout/Navbar';

Chart.register(...registerables);

const COLORS = ['#0D9488', '#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4'];

const ENV_CONDITIONS = [
    { icon: '🌡️', label: '溫度', value: '22°C', optimal: '最佳：15-25°C', risk: '高風險', riskLevel: 'high' },
    { icon: '💧', label: '濕度', value: '88%', optimal: '最佳：80-100%', risk: '高風險', riskLevel: 'high' },
    { icon: '☀️', label: '光照', value: '適中', optimal: '最佳：充足光照', risk: '中風險', riskLevel: 'mid' },
    { icon: '🌬️', label: '通風', value: '不良', optimal: '最佳：良好通風', risk: '高風險', riskLevel: 'high' },
];

const SIMILAR_CASES = [
    { name: '晚疫病早期', similarity: 92, img: null },
    { name: '晚疫病中期', similarity: 88, img: null },
    { name: '晚疫病晚期', similarity: 75, img: null },
];

const EXPERT_TABS = [
    {
        key: 'immediate',
        label: '立即處理',
        icon: '🚨',
        items: [
            '立即隔離受感染植株，避免病害擴散',
            '移除所有受感染的葉片並妥善處理',
            '噴施銅製劑殺菌劑進行緊急處理',
            '改善通風條件，降低濕度',
        ],
    },
    {
        key: 'prevent',
        label: '預防措施',
        icon: '🛡️',
        items: [
            '定期巡視田間，及早發現異常',
            '保持適當株距，改善通風透光',
            '避免葉面積水，採用滴灌方式',
            '選用抗病品種，降低感染風險',
        ],
    },
    {
        key: 'longterm',
        label: '長期管理',
        icon: '📅',
        items: [
            '建立完整的病蟲害記錄系統',
            '實施 3 年以上輪作計畫',
            '定期檢測土壤健康狀況',
            '培育健壯植株，提升自身抵抗力',
        ],
    },
];

/* ── 小元件 ── */
function EnvCard({ icon, label, value, optimal, risk, riskLevel }) {
    const bgMap = { high: 'env-card--high', mid: 'env-card--mid', low: 'env-card--low' };
    return (
        <div className={`env-card ${bgMap[riskLevel] ?? ''}`}>
            <div className='env-card__header'>
                <span className='env-card__icon'>{icon}</span>
                <span className='env-card__label'>{label}</span>
                <span className={`env-card__risk env-card__risk--${riskLevel}`}>{risk}</span>
            </div>
            <div className='env-card__value'>{value}</div>
            <div className='env-card__optimal'>{optimal}</div>
        </div>
    );
}

function SimilarCase({ name, similarity, img }) {
    return (
        <div className='similar-case'>
            <div className='similar-case__img'>
                {img ? <img src={img} alt={name} /> : <div className='similar-case__placeholder'>🌿</div>}
            </div>
            <div className='similar-case__name'>{name}</div>
            <div className='similar-case__bar-wrap'>
                <div className='similar-case__bar'>
                    <div className='similar-case__bar-fill' style={{ width: `${similarity}%` }} />
                </div>
                <span className='similar-case__pct'>{similarity}%</span>
            </div>
        </div>
    );
}

/* ── 主元件 ── */
const ResultPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const pieRef = useRef();
    const chartRef = useRef();
    const [tab, setTab] = useState('immediate');
    const [saved, setSaved] = useState(false);

    const result = state?.result;
    const preview = state?.preview;

    useEffect(() => {
        if (!result) navigate('/identify');
    }, [result, navigate]);

    useEffect(() => {
        if (!result?.distribution || !pieRef.current) return;
        if (chartRef.current) chartRef.current.destroy();
        chartRef.current = new Chart(pieRef.current, {
            type: 'doughnut',
            data: {
                labels: result.distribution.map(d => d.label),
                datasets: [
                    {
                        data: result.distribution.map(d => d.value),
                        backgroundColor: COLORS.slice(0, result.distribution.length),
                        borderWidth: 2,
                        borderColor: '#F0F9F6',
                        hoverOffset: 6,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#374151', font: { size: 12 }, padding: 14 } },
                    tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw.toFixed(1)}%` } },
                },
            },
        });
        return () => chartRef.current?.destroy();
    }, [result]);

    if (!result) return null;

    const { primary, disease_detail: dd, mode } = result;
    const isHealthy = primary?.severity === '無';
    const confidence = (primary?.confidence ?? 0) * 100;
    const diseaseName = toZh(primary?.kaggle_class);
    const now = new Date().toLocaleString('zh-TW', { hour12: false });

    const activeTab = EXPERT_TABS.find(t => t.key === tab) ?? EXPERT_TABS[0];

    return (
        <>
        <Navbar />
        <div className='result-page mt-md-5'>
            <div className='container d-flex flex-column'>
                {/* ══ 頂部結果橫幅 ══ */}
                <div className={`result-hero w-100 ${isHealthy ? 'result-hero--healthy' : 'result-hero--disease'}`}>
                    <div className='result-hero__icon'>{isHealthy ? '✅' : '⚠️'}</div>
                    <div className='result-hero__title'>
                        {isHealthy ? '植物健康狀況良好' : `檢測到病害：${diseaseName}`}
                    </div>
                    <div className='result-hero__confidence'>{confidence.toFixed(1)}%</div>
                    <div className='result-hero__sub'>置信度</div>
                    <div className='result-hero__time'>辨識時間：{now}</div>
                    {mode === 'DEMO' && <div className='result-hero__demo'>⚠️ DEMO 模式</div>}
                </div>

                {/* ══ 主體：左右欄 ══ */}
                <div className='container result-body'>
                    <div className='result-columns'>
                        {/* ── 左欄（sticky） ── */}
                        <div className='result-left'>
                            <div className='result-left__sticky'>
                                {/* 葉片圖片 */}
                                <div className='leaf-card'>
                                    {preview ? (
                                        <img src={preview} alt='辨識葉片' className='leaf-card__img' />
                                    ) : (
                                        <div className='leaf-card__placeholder'>🌿</div>
                                    )}
                                </div>

                                {/* 操作按鈕 */}
                                <div className='leaf-actions'>
                                    <button
                                        className='leaf-actions__btn leaf-actions__btn--primary'
                                        onClick={() => navigate('/identify')}
                                    >
                                        重新辨識
                                    </button>
                                    <button
                                        className={`leaf-actions__btn leaf-actions__btn--outline ${saved ? 'leaf-actions__btn--saved' : ''}`}
                                        onClick={() => {
                                            setSaved(true);
                                            setTimeout(() => setSaved(false), 2000);
                                        }}
                                    >
                                        {saved ? '已儲存 ✓' : '儲存結果'}
                                    </button>
                                </div>

                                {/* 圖片資訊 */}
                                <div className='leaf-meta'>
                                    <div className='leaf-meta__row'>
                                        <span>解析度：</span>
                                        <span>1920 x 1080</span>
                                    </div>
                                    <div className='leaf-meta__row'>
                                        <span>拍攝時間：</span>
                                        <span>{now}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── 右欄（可滾動） ── */}
                        <div className='result-right'>
                            {/* 🦠 病害資訊 */}
                            <div className='r-section'>
                                <div className='r-section__title'>
                                    <span className='r-section__icon'>🦠</span> 病害資訊
                                </div>
                                <div className='disease-info'>
                                    <div className='disease-info__name'>{diseaseName}</div>
                                    {dd?.pathogen && <div className='disease-info__pathogen'>{dd.pathogen}</div>}
                                    {/* 風險等級條 */}
                                    <div className='risk-row'>
                                        <span className='risk-row__label'>風險等級</span>
                                        <span
                                            className={`risk-row__badge risk-row__badge--${
                                                primary?.severity === '嚴重'
                                                    ? 'high'
                                                    : primary?.severity === '中度'
                                                      ? 'mid'
                                                      : 'low'
                                            }`}
                                        >
                                            {primary?.severity === '嚴重'
                                                ? '高風險'
                                                : primary?.severity === '無'
                                                  ? '無風險'
                                                  : '中風險'}
                                        </span>
                                    </div>
                                    <div className='risk-bar-track'>
                                        <div
                                            className='risk-bar-fill risk-bar-fill--disease'
                                            style={{
                                                width:
                                                    primary?.severity === '嚴重'
                                                        ? '90%'
                                                        : primary?.severity === '中度'
                                                          ? '55%'
                                                          : '15%',
                                            }}
                                        />
                                    </div>

                                    {/* 症狀匹配度 */}
                                    <div className='risk-row mt-3'>
                                        <span className='risk-row__label'>症狀匹配度</span>
                                    </div>
                                    {dd?.symptoms?.slice(0, 4).map((s, i) => {
                                        const pct = Math.max(60, confidence - i * 4);
                                        return (
                                            <div key={s} className='symptom-match'>
                                                <span className='symptom-match__label'>{s}</span>
                                                <div className='symptom-match__bar-wrap'>
                                                    <div className='symptom-match__bar'>
                                                        <div
                                                            className='symptom-match__fill'
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className='symptom-match__pct'>{pct.toFixed(0)}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <button
                                        className='r-link-btn mt-3'
                                        onClick={() => navigate('/diseases/' + (dd?.id ?? ''))}
                                    >
                                        查看完整病害資料
                                    </button>
                                </div>
                            </div>

                            {/* 💡 專家建議 */}
                            <div className='r-section'>
                                <div className='r-section__title'>
                                    <span className='r-section__icon'>👨‍🔬</span> 專家建議
                                </div>

                                {/* Tab 切換 */}
                                <div className='expert-tabs'>
                                    {EXPERT_TABS.map(t => (
                                        <button
                                            key={t.key}
                                            className={`expert-tabs__btn ${tab === t.key ? 'expert-tabs__btn--active' : ''}`}
                                            onClick={() => setTab(t.key)}
                                        >
                                            {t.icon} {t.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab 內容 */}
                                <div className='expert-list'>
                                    {activeTab.items.map((item, i) => (
                                        <div key={i} className='expert-list__item'>
                                            <span className='expert-list__num'>{i + 1}</span>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>

                                <button className='consult-btn'>💬 諮詢線上專家</button>
                            </div>

                            {/* 🌡️ 易感染環境條件 */}
                            <div className='r-section'>
                                <div className='r-section__title'>
                                    <span className='r-section__icon'>☁️</span> 易感染環境條件
                                </div>
                                <div className='env-grid'>
                                    {ENV_CONDITIONS.map(c => (
                                        <EnvCard key={c.label} {...c} />
                                    ))}
                                </div>
                                <div className='env-warning'>
                                    ⓘ 根據您的環境條件，當前為高風險期，請加強監測和預防措施
                                </div>
                            </div>

                            {/* 📋 相似病例參考 */}
                            <div className='r-section'>
                                <div className='r-section__title'>
                                    <span className='r-section__icon'>📋</span> 相似病例參考
                                </div>
                                <div className='similar-grid'>
                                    {SIMILAR_CASES.map(c => (
                                        <SimilarCase key={c.name} {...c} />
                                    ))}
                                </div>
                            </div>

                            {/* 底部按鈕 */}
                            <div className='result-bottom-actions'>
                                <button className='rba-btn rba-btn--ghost' onClick={() => window.print()}>
                                    📥 下載報告
                                </button>
                                <button
                                    className='rba-btn rba-btn--ghost'
                                    onClick={() => {
                                        navigator.clipboard?.writeText(window.location.href);
                                        alert('連結已複製！');
                                    }}
                                >
                                    🔗 分享結果
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default ResultPage;
