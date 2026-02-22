import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDiseaseById } from '../services/api';
import Navbar from '../layout/Navbar';

// ── 嚴重度色票 ────────────────────────────────
const SEV_STYLE = {
    嚴重:      { bg: 'rgba(239,68,68,.12)',   color: '#ef4444', border: 'rgba(239,68,68,.25)',   icon: '🔴' },
    中度至嚴重: { bg: 'rgba(249,115,22,.12)',  color: '#f97316', border: 'rgba(249,115,22,.25)',  icon: '🟠' },
    中度:      { bg: 'rgba(202,138,4,.12)',   color: '#ca8a04', border: 'rgba(202,138,4,.25)',   icon: '🟡' },
    低:        { bg: 'rgba(22,163,74,.12)',   color: '#16a34a', border: 'rgba(22,163,74,.25)',   icon: '🟢' },
    無:        { bg: 'rgba(13,148,136,.12)',  color: '#0d9488', border: 'rgba(13,148,136,.25)',  icon: '✅' },
    健康:      { bg: 'rgba(22,163,74,.12)',   color: '#16a34a', border: 'rgba(22,163,74,.25)',   icon: '✅' },
};

// ── 小組件 ────────────────────────────────────
function SevBadge({ severity }) {
    const s = SEV_STYLE[severity] ?? SEV_STYLE['低'];
    return (
        <span
            className="ddp-sev-badge"
            style={{ background: s.bg, color: s.color, borderColor: s.border }}
        >
            {s.icon} {severity}
        </span>
    );
}

function BulletList({ items = [], bulletColor }) {
    return (
        <ul className="ddp-list" style={{ '--ddp-bullet': bulletColor }}>
            {items.map((item, i) => (
                <li key={i} className="ddp-list-item">{item}</li>
            ))}
        </ul>
    );
}

function SectionTitle({ icon, title }) {
    return (
        <div className="ddp-section-title">
            <span>{icon}</span> {title}
        </div>
    );
}

function ImgWithFallback({ src, alt, className, style, onError }) {
    return (
        <img
            src={src}
            alt={alt}
            className={className}
            style={style}
            loading="lazy"
            onError={onError}
        />
    );
}

// ── 主頁面 ────────────────────────────────────
const DiseaseDetailPage = () => {
    const { id }       = useParams();
    const navigate     = useNavigate();
    const [disease, setDisease] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imgErr, setImgErr]   = useState({});

    useEffect(() => {
        getDiseaseById(id)
            .then(r => setDisease(r.data))
            .catch(() => {
                const found = DEMO_DISEASES[id];
                if (found) setDisease(found);
                else navigate('/diseases');
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    // ── Loading ─────────────────────────────
    if (loading) return (
        <>
            <Navbar />
            <div style={{ paddingTop: 200, textAlign: 'center' }}>
                <div style={{
                    width: 48, height: 48, borderRadius: '50%', margin: '0 auto 20px',
                    border: '3px solid rgba(16,185,129,.2)', borderTop: '3px solid #10b981',
                    animation: 'spin 1s linear infinite',
                }} />
                <p style={{ color: '#6b9a7e', fontStyle: 'italic' }}>載入病害資料…</p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );

    if (!disease) return null;

    const heroImg    = disease.images?.[0];
    const extraImgs  = disease.images?.slice(1) ?? [];

    return (
        <>
            <Navbar />
            <div className="ddp">
                <div className="ddp-container">

                    {/* ── 麵包屑 ── */}
                    <div className="ddp-breadcrumb">
                        <button
                            className="ddp-breadcrumb-btn"
                            onClick={() => navigate('/diseases')}
                        >
                            ← 病害資料庫
                        </button>
                        <span className="ddp-breadcrumb-sep">/</span>
                        <span className="ddp-breadcrumb-current">{disease.name_zh}</span>
                    </div>

                    {/* ══ Hero：圖片 + 基本資訊 ══ */}
                    <div className="ddp-hero">

                        {/* 圖片側 */}
                        <div className="ddp-hero-img">
                            {heroImg && !imgErr[0] ? (
                                <ImgWithFallback
                                    src={heroImg.url}
                                    alt={disease.name_zh}
                                    onError={() => setImgErr(p => ({ ...p, 0: true }))}
                                />
                            ) : (
                                <div className="ddp-hero-img-placeholder">🌿</div>
                            )}
                            <div className="ddp-hero-img-source">
                                {heroImg?.source ?? 'PhytoScan 資料庫'}
                            </div>
                        </div>

                        {/* 資訊側 */}
                        <div className="ddp-hero-info">

                            {/* 類別標籤 */}
                            <div className="ddp-cat-label">{disease.category}</div>

                            {/* 名稱 */}
                            <div>
                                <h1 className="ddp-title-zh">{disease.name_zh}</h1>
                                <p className="ddp-title-en">{disease.name_en}</p>
                            </div>

                            {/* 嚴重度 + 病原體 */}
                            <div className="ddp-meta-row">
                                <SevBadge severity={disease.severity} />
                                {disease.pathogen && disease.pathogen !== '無' && (
                                    <span className="ddp-pathogen">
                                        病原體：<em>{disease.pathogen}</em>
                                    </span>
                                )}
                            </div>

                            {/* 寄主植物 */}
                            {disease.host_plants?.length > 0 && (
                                <div className="ddp-hosts">
                                    <span className="ddp-hosts-label">寄主植物</span>
                                    {disease.host_plants.map(p => (
                                        <span key={p} className="ddp-hosts-tag">{p}</span>
                                    ))}
                                </div>
                            )}

                            {/* 分布地區 */}
                            {disease.distribution && disease.distribution !== '—' && (
                                <div className="ddp-dist">
                                    <span className="ddp-dist-icon">📍</span>
                                    <span>
                                        <strong>分布地區：</strong>{disease.distribution}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ══ 內容卡片網格 ══ */}
                    <div className="ddp-grid">

                        {/* 左欄：症狀 + 感染原因 */}
                        <div className="ddp-card">
                            <SectionTitle icon="🔬" title="主要症狀" />
                            <BulletList items={disease.symptoms} bulletColor="#10b981" />

                            {disease.causes?.length > 0 && (
                                <>
                                    <SectionTitle
                                        icon="🧪"
                                        title="感染原因"
                                        style={{ marginTop: 24 }}
                                    />
                                    <BulletList items={disease.causes} bulletColor="#f59e0b" />
                                </>
                            )}
                        </div>

                        {/* 右欄：預防 + 治療 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="ddp-card">
                                <SectionTitle icon="🛡️" title="預防措施" />
                                <BulletList items={disease.prevention} bulletColor="#0d9488" />

                                {disease.treatment?.length > 0 && (
                                    <>
                                        <div style={{ marginTop: 24 }}>
                                            <SectionTitle icon="💊" title="治療方案" />
                                        </div>
                                        <BulletList items={disease.treatment} bulletColor="#f97316" />
                                    </>
                                )}
                            </div>

                            {/* 專家建議 */}
                            {disease.expert_advice && (
                                <div className="ddp-expert">
                                    <div className="ddp-expert-header">
                                        <div className="ddp-expert-avatar">👨‍🔬</div>
                                        <div>
                                            <div className="ddp-expert-title">專家建議</div>
                                            <div className="ddp-expert-subtitle">
                                                農業病理專家實務經驗
                                            </div>
                                        </div>
                                    </div>
                                    <p className="ddp-expert-body">
                                        {disease.expert_advice}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ══ 多圖瀏覽 ══ */}
                    {extraImgs.length > 0 && (
                        <div className="ddp-gallery">
                            <div className="ddp-gallery-title">📷 病害圖片參考</div>
                            <div className="ddp-gallery-grid">
                                {disease.images.map((img, i) => (
                                    <div key={i} className="ddp-gallery-item">
                                        {!imgErr[i] ? (
                                            <img
                                                src={img.url}
                                                alt={img.caption}
                                                loading="lazy"
                                                onError={() => setImgErr(p => ({ ...p, [i]: true }))}
                                            />
                                        ) : (
                                            <div className="ddp-gallery-placeholder">🌿</div>
                                        )}
                                        {img.caption && <p>{img.caption}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ══ 底部按鈕 ══ */}
                    <div className="ddp-footer">
                        <button
                            className="ddp-btn-outline"
                            onClick={() => navigate('/diseases')}
                        >
                            ← 返回列表
                        </button>
                        <button
                            className="ddp-btn-primary"
                            onClick={() => navigate('/identify')}
                        >
                            🔬 辨識我的植物
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
};

export default DiseaseDetailPage;

// ── Demo fallback 資料 ────────────────────────
const DEMO_DISEASES = {
    tomato_early_blight: {
        id: 'tomato_early_blight',
        name_zh: '番茄早疫病', name_en: 'Tomato Early Blight',
        pathogen: 'Alternaria solani', category: '真菌性病害', severity: '中度',
        host_plants: ['番茄', '馬鈴薯', '茄子'],
        distribution: '全球性，溫暖潮濕地區最普遍，台灣中南部夏秋季高發',
        symptoms: ['葉片出現同心圓狀褐色病斑', '病斑周圍有黃色暈圈', '由下方老葉開始發病'],
        causes: ['病菌以菌絲在土壤中的病殘體越冬', '氣溫 24–29°C 配合高濕度最易發病'],
        prevention: ['選用抗病品種', '實施 3 年以上輪作', '保持適當株距改善通風'],
        treatment: ['代森錳鋅 75% WP 500 倍液，每 7 天噴一次', '亞托敏 25% SC 1000 倍液'],
        expert_advice: '早疫病在連作地區及梅雨季節發生率極高，建議採取「預防優先」策略。',
        images: [],
    },
    healthy: {
        id: 'healthy',
        name_zh: '健康植物', name_en: 'Healthy Plant',
        pathogen: '無', category: '健康', severity: '無',
        host_plants: ['所有作物'], distribution: '—',
        symptoms: ['葉色鮮綠均勻', '葉形正常無扭曲', '無病斑或異常'],
        causes: ['良好農業管理'],
        prevention: ['定期巡視田間', '維持合理水肥管理'],
        treatment: ['目前無需治療'],
        expert_advice: '您的植物目前呈現健康狀態！建議持續維持現行良好的農業管理實踐。',
        images: [],
    },
};