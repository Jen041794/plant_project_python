import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeatureCard, ExpertCard, FloatBadge, StatBox1 } from '../components/SeverityBadge';
import { getStats } from '../services/api';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import ExpertCard_m from '../components/ExpertCard';
import CtaSection from '../components/CtaSection';

const FEATURES = [
    { icon: '🧬', text: '病原體學名與生物學特性' },
    { icon: '🗺️', text: '全球及台灣地區分布資訊' },
    { icon: '🛡️', text: '預防措施與農業管理建議' },
    { icon: '💊', text: '農藥防治方案（含劑量）' },
    { icon: '👨‍🔬', text: '農業專家實務經驗建議' },
];

const EXPERTS = [
    {
        quote: 'PhytoScan 的辨識結果搭配詳細的農藥建議，讓我們在田間診斷時更有依據，大幅縮短了確診時間。',
        name: '林明哲 博士',
        role: '台灣農業改良場植物病理研究員',
        initial: '林',
        delay: 0,
    },
    {
        quote: 'AI 輔助辨識不能完全取代人工，但作為第一線篩查工具，它讓農民能在專業人員到達前就做出初步應對。',
        name: '陳淑芬 教授',
        role: '國立中興大學植物病理學系',
        initial: '陳',
        delay: 0.12,
    },
];

const STEPS = [
    {
        step: '01',
        icon: '📸',
        title: '上傳葉片照片',
        desc: '拖曳或點擊上傳植物葉片清晰照片，支援 JPG、PNG、WEBP 等格式。',
    },
    {
        step: '02',
        icon: '🤖',
        title: 'AI 分析辨識',
        desc: 'MobileNetV2 模型即時分析圖片特徵，比對病害資料庫進行辨識。',
    },
    {
        step: '03',
        icon: '📋',
        title: '查看診斷結果',
        desc: '取得詳細病害報告，包含病原體資訊、分布機率圖與專家防治建議。',
    },
];


const HomePage = () => {
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();
    const heroRef = useRef();
    const [_, setLeafVisible] = useState(false);

    useEffect(() => {
        getStats()
            .then(r => setStats(r.data))
            .catch(() => {
                setStats({ total_diseases: 10, total_identifications: 1389, accuracy: '94.3%', dataset: '54,305 張' });
            });
    }, []);

    useEffect(() => {
        const t = setTimeout(() => setLeafVisible(true), 200);
        return () => clearTimeout(t);
    }, []);

    return (
        <div>
            <Navbar />
            {/* ══ HERO ═══════════════════════════════════════════════════════ */}
            <section ref={heroRef} className='banner'>
                {/* 裝飾背景 */}
                <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    <div
                        style={{
                            position: 'absolute',
                            top: '8%',
                            right: '4%',
                            width: 520,
                            height: 520,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle,rgba(82,183,136,.1),transparent 70%)',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '12%',
                            left: '2%',
                            width: 380,
                            height: 380,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle,rgba(26,77,46,.3),transparent 70%)',
                        }}
                    />
                    {/* 葉脈紋路線條 */}
                    <svg
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}
                        viewBox='0 0 1200 800'
                        preserveAspectRatio='none'
                    >
                        <path
                            d='M600,400 Q400,200 200,100 Q400,400 200,700 Q400,600 600,400Z'
                            fill='none'
                            stroke='#52B788'
                            strokeWidth='1.5'
                        />
                        <path
                            d='M600,400 Q800,200 1000,100 Q800,400 1000,700 Q800,600 600,400Z'
                            fill='none'
                            stroke='#52B788'
                            strokeWidth='1.5'
                        />
                        <line x1='600' y1='100' x2='600' y2='700' stroke='#52B788' strokeWidth='1' />
                    </svg>
                </div>

                <section className='hero-section'>
                    <div className='hero-container'>
                        {/* ═══ 左欄：文字 ═══ */}
                        <div>
                            {/* 標籤 */}
                            <div className='hero-label'>AI 驅動・即時檢測</div>

                            {/* 標題 */}
                            <div className='hero-title-sub'>精準辨識</div>
                            <div className='hero-title-main'>植物病害</div>
                            <div
                                className='hero-title-accent'
                                style={{
                                    background: 'linear-gradient(135deg, #0d9488 0%, #10b981 50%, #34d399 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                守護農業未來
                            </div>

                            {/* 描述 */}
                            <p className='hero-desc'>
                                運用深度學習技術，秒速精準辨識超過 100
                                種植物病害。只需上傳一張葉片照片，即可獲得專業診斷與防治建議。
                            </p>

                            {/* CTA 按鈕 */}
                            <div className='hero-btns'>
                                <button className='btn-hero-primary' onClick={() => navigate?.('/identify')}>
                                    <span>📷</span> 立即開始辨識 →
                                </button>
                                <button className='btn-hero-outline' onClick={() => navigate?.('/diseases')}>
                                    <span style={{ fontSize: '.9rem' }}>⊞</span> 病害百科
                                </button>
                            </div>

                            {/* 統計 */}
                            <div className='hero-stats'>
                                <StatBox1 value='3 秒' label='極速辨識' delay={0.35} />
                                <StatBox1 value={stats?.accuracy ?? '95%'} label='辨識準確率' delay={0.4} />
                                <StatBox1 value={`${stats?.total_diseases ?? '100'}+`} label='病害種類' delay={0.45} />
                            </div>

                            {/* 信任標語 */}
                            <div className='hero-trust'>
                                {[
                                    { icon: '🛡', text: '安全可靠' },
                                    { icon: '👥', text: '50,000+ 用戶' },
                                    { icon: '✔', text: '專家認證' },
                                ].map(({ icon, text }, i) => (
                                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {i > 0 && <span className='trust-dot' />}
                                        <span className='trust-item'>
                                            <span style={{ fontSize: '.8rem' }}>{icon}</span> {text}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* ═══ 右欄：視覺圖 ═══ */}
                        <div className='hero-visual'>
                            <div className='hero-img-wrap'>
                                {/* 科技感植物圖（CSS 繪製，可替換為 <img src="..." /> ） */}
                                <div className='hero-img-placeholder'>
                                    {/* 科技圓環 */}
                                    <div
                                        className='tech-ring'
                                        style={{
                                            width: 380,
                                            height: 380,
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%,-50%)',
                                            fontSize: 26,
                                        }}
                                    />
                                    <div
                                        className='tech-ring'
                                        style={{
                                            width: 280,
                                            height: 280,
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%,-50%)',
                                            animationDirection: 'reverse',
                                            animationDuration: '12s',
                                        }}
                                    />
                                    <div
                                        className='tech-ring'
                                        style={{
                                            width: 180,
                                            height: 180,
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%,-50%)',
                                        }}
                                    />

                                    {/* 掃描線 */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: 0,
                                            right: 0,
                                            height: '2px',
                                            background:
                                                'linear-gradient(90deg,transparent,rgba(52,211,153,.6),transparent)',
                                            boxShadow: '0 0 12px rgba(52,211,153,.4)',
                                            animation: 'leafFloat 3s ease-in-out infinite',
                                            top: '45%',
                                        }}
                                    />

                                    {/* 葉片 */}
                                    <div className='leaf-center'>🌿</div>
                                </div>
                            </div>

                            {/* ── 浮動 Badge 卡片 ── */}
                            <FloatBadge
                                icon='🔬'
                                iconBg='linear-gradient(135deg,#d1fae5,#a7f3d0)'
                                title='辨識結果'
                                value='晚疫病・95%'
                                valueColor='#0d9488'
                                style={{
                                    top: '8%',
                                    left: '-6%',
                                    animation: 'badgeFloat 3.5s ease-in-out 0s infinite, fadeUp .5s ease .5s both',
                                }}
                                delay='.5s'
                            />

                            <FloatBadge
                                icon='💚'
                                iconBg='linear-gradient(135deg,#d1fae5,#6ee7b7)'
                                title='健康指數'
                                value='良好・82%'
                                valueColor='#059669'
                                style={{
                                    top: '36%',
                                    right: '-8%',
                                    animation: 'badgeFloat 3.8s ease-in-out .4s infinite, fadeUp .5s ease .65s both',
                                }}
                                delay='.65s'
                            />

                            <FloatBadge
                                icon='🤖'
                                iconBg='linear-gradient(135deg,#cffafe,#a5f3fc)'
                                title='AI 分析中'
                                value='進行中'
                                valueColor='#0891b2'
                                pulse
                                style={{
                                    bottom: '20%',
                                    left: '-4%',
                                    animation: 'badgeFloat 4s ease-in-out .8s infinite, fadeUp .5s ease .8s both',
                                }}
                                delay='.8s'
                            />

                            <FloatBadge
                                icon='💡'
                                iconBg='linear-gradient(135deg,#fef9c3,#fde68a)'
                                title='專家建議'
                                value='已生成 3 項'
                                valueColor='#b45309'
                                style={{
                                    bottom: '6%',
                                    right: '-5%',
                                    animation: 'badgeFloat 3.6s ease-in-out 1.2s infinite, fadeUp .5s ease .95s both',
                                }}
                                delay='.95s'
                            />
                        </div>
                    </div>
                </section>
            </section>

            {/* ══ 功能特色 ═══════════════════════════════════════════════════ */}
            <section style={{ padding: '100px 0' }}>
                <div className='container'>
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <div className='text-label fs-3' style={{ marginBottom: 12 }}>
                            核心功能
                        </div>
                        <h2 style={{ color: 'var(--white)' }}>為什麼選擇 PhytoScan？</h2>
                    </div>
                    <div
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 24 }}
                    >
                        <FeatureCard
                            icon='⚡'
                            title='秒級 AI 辨識'
                            desc='採用 MobileNetV2 深度學習模型，上傳葉片圖片後 3 秒內完成分析，效率遠超傳統人工診斷方式。'
                            delay={0}
                        />
                        <FeatureCard
                            icon='🎯'
                            title='高精準辨識'
                            desc='基於 54,305 張 PlantVillage 資料集訓練，採用 11 輪漸進式學習，Top-1 準確率達 94.3%。'
                            delay={0.1}
                        />
                        <FeatureCard
                            icon='📚'
                            title='完整病害資料庫'
                            desc='整合爬蟲資料與農業專家知識，每種病害均提供症狀、成因、預防與治療的完整資訊。'
                            delay={0.2}
                        />
                        <FeatureCard
                            icon='🌐'
                            title='即時病情預警'
                            desc='定期爬取農業部、維基百科等多方資訊，提供最新病害分布與季節性預警通知。'
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* ══ 操作流程 ═══════════════════════════════════════════════════ */}
            <section className='hiw-section'>
                <div className='container' style={{ position: 'relative', zIndex: 1 }}>
                    {/* 標題 */}
                    <div style={{ textAlign: 'center', marginBottom: 60 }}>
                        <div className='hiw-label fs-5'>使用流程</div>
                        <h2 className='hiw-title'>三步完成診斷</h2>
                    </div>

                    {/* 步驟列 */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto 1fr auto 1fr',
                            alignItems: 'start',
                            maxWidth: 820,
                            //margin: '0 auto',
                        }}
                    >
                        {STEPS.map(({ step, icon, title, desc }, i) => (
                            <>
                                {/* 步驟卡 */}
                                <div key={step} className='hiw-step' style={{ animationDelay: `${i * 0.12}s` }}>
                                    <div className='hiw-icon-wrap'>
                                        {icon}
                                        <span className='hiw-step-num'>{step}</span>
                                    </div>
                                    <h4>{title}</h4>
                                    <p>{desc}</p>
                                </div>

                                {/* 步驟間箭頭 */}
                                {i < STEPS.length - 1 && (
                                    <div key={`arrow-${i}`} className='hiw-arrow'>
                                        ›
                                    </div>
                                )}
                            </>
                        ))}
                    </div>

                    {/* CTA 按鈕 */}
                    <div style={{ textAlign: 'center', marginTop: 52 }}>
                        <button className='btn-hiw-primary' onClick={() => navigate?.('/identify')}>
                            🌿 立即體驗
                        </button>
                    </div>
                </div>
            </section>

            {/* ══ 專家建議介紹 ════════════════════════════════════════════════ */}
            <section className='es-section' id='intro'>
                <div className='container' style={{ position: 'relative', zIndex: 1 }}>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 72,
                            alignItems: 'center',
                        }}
                    >
                        {/* ── 左欄：文字 ── */}
                        <div>
                            <div className='es-label'>專家知識系統</div>

                            <h2 className='es-title'>
                                不只是辨識，
                                <br />
                                更是完整的
                                <br />
                                <span className='es-title-accent'>農業診療方案</span>
                            </h2>

                            <p className='es-desc'>
                                PhytoScan 不僅告訴您「是什麼病」，更整合了農業專家的治療建議與預防策略。
                                每筆病害資料均包含：
                            </p>

                            <div className='es-list'>
                                {FEATURES.map(({ icon, text }, i) => (
                                    <div key={text} className='es-list-item' style={{ animationDelay: `${i * 0.07}s` }}>
                                        <span className='es-list-item-icon'>{icon}</span>
                                        {text}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── 右欄：專家卡片 ── */}
                        <div className='es-cards'>
                            {EXPERTS.map(e => (
                                <ExpertCard_m key={e.name} {...e} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ CTA ═════════════════════════════════════════════════════════ */}
            <CtaSection navigate={navigate} />
            <Footer />
        </div>
    );
};

export default HomePage;
