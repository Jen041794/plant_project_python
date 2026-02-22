import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';


// ── 資料 ────────────────────────────────────────────────────────────────────
const CARDS = [
    {
        icon: '🌿',
        title: '我們的使命',
        desc: '透過先進的 AI 深度學習技術，降低植物病害對農業生產的影響。我們相信，科技應該服務於每一位辛勤耕耘的農民，讓病害辨識不再依賴昂貴的專業設備和稀缺的專家資源。',
        tag: '讓每位農民都能享有專家級診斷',
    },
    {
        icon: '🌐',
        title: '我們的願景',
        desc: '成為全球領先的植物健康智慧平台，建立涵蓋所有主要作物病害的 AI 辨識網絡。我們期望在未來五年內，將病害造成的農業損失降低 30%，為全球糧食安全貢獻力量。',
        tag: '2030 年覆蓋全球主要農業區域',
    },
];

const STATS = [
    { value: '54,305', label: '訓練圖片數量' },
    { value: '38',     label: '支援病害種類' },
    { value: '94.3%',  label: '模型辨識準確率' },
    { value: '12+',    label: '覆蓋作物種類' },
];

const TEAM = [
    { avatar: '👨‍💻', name: '陳威廷', role: 'AI 工程師', desc: '深度學習模型設計與訓練' },
    { avatar: '👩‍🌾', name: '林雅琪', role: '農業顧問', desc: '植物病理學與實務驗證' },
    { avatar: '👨‍🎨', name: '吳建宏', role: '前端工程師', desc: '使用者介面與體驗設計' },
    { avatar: '👩‍🔬', name: '張美玲', role: '資料科學家', desc: '資料集整理與模型評估' },
];

const TIMELINE = [
    { year: '2023', event: '專案啟動，開始收集 PlantVillage 資料集並進行模型研究' },
    { year: '2024', event: '完成首版 CNN 模型訓練，辨識準確率突破 90%' },
    { year: '2025', event: '推出 PhytoScan 平台，整合多作物病害辨識與資料庫' },
    { year: '2026', event: '持續優化模型，擴充支援作物種類與多語系支援' },
];

// ── 滾動動畫 hook ─────────────────────────────────────────────────────────────
function useScrollReveal() {
    useEffect(() => {
        const els = document.querySelectorAll('.reveal');
        const io  = new IntersectionObserver(
            entries => entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
            }),
            { threshold: 0.15 }
        );
        els.forEach(el => io.observe(el));
        return () => io.disconnect();
    }, []);
}

// ── 主頁面 ───────────────────────────────────────────────────────────────────
const AboutUsPage = () => {
    const navigate = useNavigate();
    useScrollReveal();

    return (
        <>
            <Navbar />
            <div className='about'>

                {/* ══ Hero ══ */}
                <section className='about__hero'>
                    {/* 背景裝飾圓 */}
                    <div className='about__hero-blob about__hero-blob--1' />
                    <div className='about__hero-blob about__hero-blob--2' />

                    <div className='about__hero-inner'>
                        <div className='about__label'>• About Us</div>
                        <p className='about__hero-sub'>用科技守護</p>
                        <h1 className='about__hero-title'>每一片綠葉</h1>
                        <p className='about__hero-desc'>
                            我們致力於運用人工智慧技術，為全球農業提供精準、高效的植物病害辨識解決方案，<br />
                            讓每一位農民都能輕鬆守護作物健康。
                        </p>
                    </div>
                </section>

                {/* ══ 使命 & 願景卡片 ══ */}
                <section className='about__cards'>
                    <div className='container'>
                        <div className='row g-4'>
                            {CARDS.map((c, i) => (
                                <div key={i} className={`col-12 col-md-6 reveal reveal--up`} style={{ animationDelay: `${i * 0.1}s` }}>
                                    <div className='about__card'>
                                        <div className='about__card-icon'>{c.icon}</div>
                                        <h3 className='about__card-title'>{c.title}</h3>
                                        <p className='about__card-desc'>{c.desc}</p>
                                        <div className='about__card-tag'>
                                            <span className='about__card-check'>✓</span>
                                            {c.tag}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══ 數據統計 ══ */}
                <section className='about__stats reveal reveal--up'>
                    <div className='container'>
                        <div className='about__stats-grid'>
                            {STATS.map((s, i) => (
                                <div key={i} className='about__stat'>
                                    <div className='about__stat-value'>{s.value}</div>
                                    <div className='about__stat-label'>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══ 發展歷程 ══ */}
                <section className='about__timeline'>
                    <div className='container'>
                        <div className='about__section-header reveal reveal--up'>
                            <div className='about__label'>• Our Journey</div>
                            <h2 className='about__section-title'>發展歷程</h2>
                        </div>
                        <div className='about__timeline-list'>
                            {TIMELINE.map((t, i) => (
                                <div key={i} className='about__timeline-item reveal reveal--left' style={{ transitionDelay: `${i * 0.1}s` }}>
                                    <div className='about__timeline-year'>{t.year}</div>
                                    <div className='about__timeline-dot' />
                                    <div className='about__timeline-event'>{t.event}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══ 團隊 ══ */}
                <section className='about__team'>
                    <div className='container'>
                        <div className='about__section-header reveal reveal--up'>
                            <div className='about__label'>• Our Team</div>
                            <h2 className='about__section-title'>核心團隊</h2>
                        </div>
                        <div className='row g-4'>
                            {TEAM.map((m, i) => (
                                <div key={i} className='col-6 col-md-3 reveal reveal--up' style={{ transitionDelay: `${i * 0.08}s` }}>
                                    <div className='about__member'>
                                        <div className='about__member-avatar'>{m.avatar}</div>
                                        <div className='about__member-name'>{m.name}</div>
                                        <div className='about__member-role'>{m.role}</div>
                                        <p className='about__member-desc'>{m.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══ CTA ══ */}
                <section className='about__cta reveal reveal--up'>
                    <div className='container'>
                        <div className='about__cta-box'>
                            <h2 className='about__cta-title'>立即體驗 AI 病害辨識</h2>
                            <p className='about__cta-desc'>上傳一張葉片照片，讓 PhytoScan 為您的作物把關</p>
                            <div className='about__cta-actions'>
                                <button className='btn btn-primary' onClick={() => navigate('/identify')}>
                                    🔬 開始辨識
                                </button>
                                <button className='btn btn-ghost' onClick={() => navigate('/diseases')}>
                                    📚 病害百科
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
            <Footer />
        </>
    );
};

export default AboutUsPage;