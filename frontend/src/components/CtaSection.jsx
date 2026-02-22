/**
 * CtaSection.jsx
 * 「立即守護您的農作物」CTA 區塊
 * 樣式請見 CtaSection.scss
 */

const STATS = [
    { value: '20%+', label: '全球糧食年損失' },
    { value: '94.3%', label: '辨識準確率' },
    { value: '< 3 秒', label: '平均診斷時間' },
];

const TRUST = [
    { icon: '🛡', text: '完全免費使用' },
    { icon: '🔒', text: '圖片不會儲存' },
    { icon: '✔', text: '農業專家認證' },
];

export default function CtaSection({ navigate }) {
    return (
        <section className="cta-section">
            <div className="container">
                <div className="cta-card">

                    {/* 植物圖示 */}
                    <div className="cta-icon-wrap">🌱</div>

                    {/* 標題 */}
                    <h2 className="cta-title">
                        立即守護您的農作物
                    </h2>

                    {/* 描述 */}
                    <p className="cta-desc">
                        每年全球因植物病害造成的農業損失超過糧食產量的{' '}
                        <span className="cta-highlight">20%</span>。<br />
                        及早辨識，及早防治，讓 AI 成為您最可靠的農業夥伴。
                    </p>

                    {/* 統計數字 */}
                    <div className="cta-stats">
                        {STATS.map(({ value, label }) => (
                            <div key={label} className="cta-stat">
                                <div className="cta-stat-value">{value}</div>
                                <div className="cta-stat-label">{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* 按鈕 */}
                    <div className="cta-btns">
                        <button
                            className="btn-cta-primary"
                            onClick={() => navigate?.('/identify')}
                        >
                            🔬 免費開始辨識
                        </button>
                        <button
                            className="btn-cta-outline"
                            onClick={() => navigate?.('/diseases')}
                        >
                            查看病害清單
                        </button>
                    </div>

                    {/* 信任標語 */}
                    <div className="cta-trust">
                        {TRUST.map(({ icon, text }, i) => (
                            <span key={text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {i > 0 && <span className="cta-trust-dot" />}
                                <span className="cta-trust-item">
                                    <span>{icon}</span> {text}
                                </span>
                            </span>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}