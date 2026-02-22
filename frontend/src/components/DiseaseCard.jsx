/**
 * DiseaseCard.jsx
 * 病害資料庫卡片元件
 * 樣式請見 DiseaseCard.scss
 */


// ── 類別 → CSS modifier 對照 ──────────────────
const CAT_CLASS = {
    '真菌性病害': 'fungal',
    '細菌性病害': 'bacterial',
    '卵菌性病害': 'oomycete',
    '健康':       'healthy',
};

// ── 嚴重度 → badge modifier 對照 ─────────────
const SEV_LABEL = {
    '嚴重':      { cls: '嚴重',     icon: '🔴' },
    '中度至嚴重': { cls: '中度至嚴重', icon: '🟠' },
    '中度':      { cls: '中度',     icon: '🟡' },
    '低':        { cls: '低',      icon: '🟢' },
    '無':        { cls: '無',      icon: '✅' },
    '健康':      { cls: '健康',    icon: '✅' },
};

// ── SeverityBadge ─────────────────────────────
function SeverityBadge({ severity }) {
    const s = SEV_LABEL[severity] ?? { cls: '低', icon: '⚪' };
    // SCSS map key 含中文，改用 data attribute 方式套色
    const colorMap = {
        '嚴重':      { bg: 'rgba(254,243,242,.92)', color: '#ef4444', border: 'rgba(252,165,165,.4)' },
        '中度至嚴重': { bg: 'rgba(255,247,237,.92)', color: '#f97316', border: 'rgba(253,186,116,.4)' },
        '中度':      { bg: 'rgba(254,252,232,.92)', color: '#ca8a04', border: 'rgba(253,224,71,.4)'  },
        '低':        { bg: 'rgba(240,253,244,.92)', color: '#16a34a', border: 'rgba(134,239,172,.4)' },
        '無':        { bg: 'rgba(240,253,250,.92)', color: '#0d9488', border: 'rgba(94,234,212,.4)'  },
        '健康':      { bg: 'rgba(240,253,244,.92)', color: '#16a34a', border: 'rgba(134,239,172,.4)' },
    };
    const c = colorMap[severity] ?? colorMap['低'];
    return (
        <span
            className="dc-sev-badge"
            style={{
                background: c.bg,
                color: c.color,
                borderColor: c.border,
            }}
        >
            {s.icon} {severity}
        </span>
    );
}

// ── 主元件：DiseaseCard ────────────────────────
export function DiseaseCard({ disease, onClick }) {
    const {
        name_zh, name_en,
        pathogen, category,
        severity, host_plants = [],
        images = [],
    } = disease;

    const imgUrl     = images[0]?.url ?? null;
    const catMod     = CAT_CLASS[category] ?? 'other';
    const visibleHosts = host_plants.slice(0, 3);
    const extraHosts   = host_plants.length - visibleHosts.length;

    return (
        <div className="dc" onClick={onClick} role="button" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onClick?.()}>

            {/* ── 圖片區 ── */}
            <div className="dc-img">
                {imgUrl ? (
                    <>
                        <img
                            src={imgUrl}
                            alt={name_zh}
                            loading="lazy"
                            onError={e => {
                                e.target.style.display = 'none';
                                e.target.nextSibling?.style && (e.target.nextSibling.style.display = 'flex');
                            }}
                        />
                        {/* 圖片載入失敗的備用佔位 */}
                        <div className="dc-img-placeholder" style={{ display: 'none' }}>
                            🌿<span>暫無圖片</span>
                        </div>
                    </>
                ) : (
                    <div className="dc-img-placeholder">
                        🌿<span>暫無圖片</span>
                    </div>
                )}

                {/* hover 遮罩 */}
                <div className="dc-img-overlay" />

                {/* 嚴重度角標 */}
                {severity && <SeverityBadge severity={severity} />}
            </div>

            {/* ── 內容區 ── */}
            <div className="dc-body">
                {/* 類別標籤 */}
                <span className={`dc-cat dc-cat--${catMod}`}>
                    {category}
                </span>

                {/* 名稱 */}
                <div>
                    <h4 className="dc-name-zh">{name_zh}</h4>
                    <p className="dc-name-en">{name_en}</p>
                </div>

                {/* 病原體 */}
                {pathogen && pathogen !== '無' && (
                    <div className="dc-pathogen">
                        <span className="dc-pathogen-label">病原體</span>
                        <span className="dc-pathogen-value" title={pathogen}>{pathogen}</span>
                    </div>
                )}

                {/* 寄主植物 */}
                {visibleHosts.length > 0 && (
                    <div className="dc-hosts">
                        {visibleHosts.map(p => (
                            <span key={p} className="dc-hosts-tag">{p}</span>
                        ))}
                        {extraHosts > 0 && (
                            <span className="dc-hosts-more">+{extraHosts}</span>
                        )}
                    </div>
                )}
            </div>

            {/* ── 底部 ── */}
            <div className="dc-footer">
                <span className="dc-footer-text">查看詳細資訊</span>
                <span className="dc-arrow">→</span>
            </div>
        </div>
    );
}