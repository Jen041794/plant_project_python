import { useRef } from 'react';

/* ── 樣式 ─────────────────────────────────────────────────────────────────── */
const STYLE = `
  .fc3d {
    padding: 32px 28px;
    border-radius: 18px;
    position: relative;
    transform-style: preserve-3d;
    will-change: transform;

    /* 淺色玻璃卡片 */
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(16, 185, 129, 0.18);

    /* 多層陰影製造厚度感 */
    box-shadow:
      0  1px 0   rgba(16,185,129,.12),
      0  4px 0   rgba(0,0,0,.06),
      0 10px 0   rgba(0,0,0,.04),
      0 18px 0   rgba(0,0,0,.025),
      0 28px 40px rgba(15,118,110,.10);

    transition: box-shadow .4s ease, transform .55s cubic-bezier(.23,1,.32,1);
    cursor: default;
    overflow: hidden;
  }

  /* 頂部邊緣高光 */
  .fc3d::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 18px;
    background: linear-gradient(160deg, rgba(255,255,255,.9) 0%, transparent 45%);
    pointer-events: none;
  }

  /* 動態光暈（跟隨滑鼠） */
  .fc3d::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 18px;
    background: radial-gradient(
      ellipse 55% 45% at var(--mx, 50%) var(--my, 20%),
      rgba(16,185,129,.08) 0%,
      transparent 70%
    );
    pointer-events: none;
    transition: background .08s linear;
  }

  /* hover：加深陰影 + 邊框亮起 */
  .fc3d:hover {
    box-shadow:
      0  1px 0   rgba(16,185,129,.22),
      0  6px 0   rgba(0,0,0,.08),
      0 14px 0   rgba(0,0,0,.055),
      0 24px 0   rgba(0,0,0,.03),
      0 40px 56px rgba(15,118,110,.16),
      inset 0 0 0 1px rgba(16,185,129,.28);
  }

  /* 圖示框 */
  .fc3d-icon {
    width: 54px; height: 54px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.55rem;
    margin-bottom: 18px;
    background: linear-gradient(135deg, rgba(16,185,129,.14), rgba(52,211,153,.06));
    border: 1px solid rgba(16,185,129,.22);
    box-shadow:
      0 4px 12px rgba(15,118,110,.12),
      inset 0 1px 0 rgba(255,255,255,.8);
    position: relative;
    flex-shrink: 0;
  }

  /* 圖示頂部小高光 */
  .fc3d-icon::after {
    content: '';
    position: absolute;
    top: 5px; left: 8px;
    width: 14px; height: 5px;
    border-radius: 50%;
    background: rgba(255,255,255,.55);
    filter: blur(2px);
  }

  .fc3d h4 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f2419;
    margin-bottom: 10px;
    letter-spacing: .02em;
    font-family: var(--ff-display, inherit);
  }

  .fc3d p {
    font-size: 1rem;
    line-height: 1.78;
    color: #4a7a5e;
    margin: 0;
  }

  /* 底部發光線 */
  .fc3d-line {
    position: absolute;
    bottom: 0; left: 24px; right: 24px; height: 2px;
    border-radius: 2px;
    background: linear-gradient(90deg, transparent, rgba(16,185,129,.55), transparent);
    opacity: 0;
    transition: opacity .35s;
  }
  .fc3d:hover .fc3d-line { opacity: 1; }

  /* 角落裝飾點 */
  .fc3d-dot {
    position: absolute;
    width: 5px; height: 5px;
    border-radius: 50%;
    background: rgba(16,185,129,.35);
    box-shadow: 0 0 6px rgba(16,185,129,.4);
  }
`;

let _injected = false;
function injectStyle() {
    if (_injected || typeof document === 'undefined') return;
    const el = document.createElement('style');
    el.textContent = STYLE;
    document.head.appendChild(el);
    _injected = true;
}

export function StatBox({ value, label, delay = 0 }) {
    return (
        <div style={{ textAlign: 'center', animation: `fadeUp .6s ease ${delay}s both` }}>
            <div style={{ fontFamily: 'var(--ff-display)', fontSize: '2.6rem', color: 'var(--mint)', lineHeight: 1 }}>
                {value}
            </div>
            <div style={{ fontSize: '.8rem', color: 'rgba(250,250,247,.5)', marginTop: 6, letterSpacing: '.04em' }}>
                {label}
            </div>
        </div>
    );
}

export function FeatureCard({ icon, title, desc, delay = 0 }) {
    injectStyle();
    const ref = useRef(null);

    const onMove = (e) => {
        const card = ref.current;
        if (!card) return;
        const { left, top, width, height } = card.getBoundingClientRect();
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top)  / height;

        const rotY =  (x - 0.5) * 20;   // 最大 ±10°
        const rotX = -(y - 0.5) * 16;   // 最大 ±8°

        card.style.transform   = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
        card.style.transition  = 'box-shadow .4s ease, transform .08s linear';
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
    };

    const onLeave = () => {
        const card = ref.current;
        if (!card) return;
        card.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        card.style.transition = 'box-shadow .4s ease, transform .55s cubic-bezier(.23,1,.32,1)';
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', '20%');
    };

    return (
        <div
            ref={ref}
            className="fc3d"
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={{ animation: `fadeUp .6s ease ${delay}s both` }}
        >
            <div className="fc3d-dot" style={{ top: 14, right: 14 }} />
            <div className="fc3d-dot" style={{ bottom: 14, left: 14, opacity: .35 }} />

            <div className="fc3d-icon">{icon}</div>
            <h4>{title}</h4>
            <p>{desc}</p>

            <div className="fc3d-line" />
        </div>
    );
}

export function ExpertCard({ quote, name, role, delay }) {
    return (
        <div className='card' style={{ padding: '28px', animation: `fadeUp .6s ease ${delay}s both` }}>
            <div
                style={{
                    fontSize: '2rem',
                    color: 'var(--sage)',
                    marginBottom: 12,
                    fontFamily: 'var(--ff-display)',
                    lineHeight: 1,
                }}
            >
                "
            </div>
            <p
                style={{
                    fontSize: '.95rem',
                    lineHeight: 1.8,
                    color: 'rgba(250,250,247,.85)',
                    fontStyle: 'italic',
                    marginBottom: 20,
                }}
            >
                {quote}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg,var(--moss),var(--sage))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.4rem',
                    }}
                >
                    👨‍🔬
                </div>
                <div>
                    <div style={{ fontWeight: 600, fontSize: '.9rem', color: 'var(--white)' }}>{name}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--sage)' }}>{role}</div>
                </div>
            </div>
        </div>
    );
}

export function ConfBar({ label, value, color, rank }) {
    const pct = (value * 100).toFixed(1);
    return (
        <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '.85rem', fontWeight: 600 }}>{['🥇', '🥈', '🥉'][rank]}</span>
                    <span style={{ fontSize: '.9rem', color: 'var(--white)' }}>{label}</span>
                </div>
                <span style={{ fontSize: '.88rem', fontWeight: 700, color }}>{pct}%</span>
            </div>
            <div style={{ background: 'rgba(82,183,136,.1)', borderRadius: 50, height: 10, overflow: 'hidden' }}>
                <div
                    style={{
                        height: '100%',
                        width: `${pct}%`,
                        borderRadius: 50,
                        background: `linear-gradient(90deg,${color}88,${color})`,
                        animation: 'barFill .8s ease both',
                    }}
                />
            </div>
        </div>
    );
}

export function InfoRow({ label, children }) {
    return (
        <div
            style={{
                display: 'flex',
                gap: 16,
                padding: '12px 16px',
                background: 'rgba(82,183,136,.05)',
                borderRadius: 10,
                marginBottom: 8,
            }}
        >
            <span
                style={{
                    fontSize: '.78rem',
                    fontWeight: 600,
                    color: 'rgba(250,250,247,.4)',
                    minWidth: 70,
                    paddingTop: 1,
                }}
            >
                {label}
            </span>
            <div style={{ fontSize: '.9rem', flex: 1 }}>{children}</div>
        </div>
    );
}

export function ListSection({ title, icon, items, accentColor }) {
    return (
        <div style={{ flex: 1, minWidth: 220 }}>
            <h4 style={{ color: 'var(--white)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{icon}</span> {title}
            </h4>
            {items.map((item, i) => (
                <div
                    key={i}
                    style={{ display: 'flex', gap: 10, marginBottom: 12, fontSize: '.88rem', lineHeight: 1.65 }}
                >
                    <span style={{ color: accentColor, flexShrink: 0, marginTop: 3 }}>◆</span>
                    <span style={{ color: 'rgba(250,250,247,.82)' }}>{item}</span>
                </div>
            ))}
        </div>
    );
}


export function Section({ title, children }) {
    return (
        <div style={{ marginBottom: 32 }}>
            <h4
                style={{
                    color: 'var(--white)',
                    marginBottom: 16,
                    paddingBottom: 10,
                    borderBottom: '1px solid rgba(82,183,136,.12)',
                }}
            >
                {title}
            </h4>
            {children}
        </div>
    );
}

export function BulletList({ items, color = 'var(--sage)' }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, fontSize: '.9rem', lineHeight: 1.7 }}>
                    <span style={{ color, flexShrink: 0, marginTop: 4 }}>◆</span>
                    <span style={{ color: 'rgba(250,250,247,.82)' }}>{item}</span>
                </div>
            ))}
        </div>
    );
}

export function SeverityBadge({ severity, size = 'md' }) {
    const map = {
        嚴重: { cls: 'badge-danger', icon: '🔴' },
        中度至嚴重: { cls: 'badge-warning', icon: '🟠' },
        中度: { cls: 'badge-warning', icon: '🟡' },
        低: { cls: 'badge-safe', icon: '🟢' },
        無: { cls: 'badge-safe', icon: '✅' },
    };
    const { cls, icon } = map[severity] ?? { cls: 'badge-neutral', icon: '⚪' };
    return (
        <span className={`badge ${cls}`} style={size === 'lg' ? { fontSize: '.9rem', padding: '5px 16px' } : {}}>
            {icon} {severity}
        </span>
    );
}

/* ── 浮動 Badge 卡片 ────────────────────────────────────────────────────────── */
export const FloatBadge = ({ icon, iconBg, title, value, valueColor, style, delay = '0s', pulse = false }) => (
    <div
        style={{
            position: 'absolute',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(16px)',
            borderRadius: 16,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 8px 32px rgba(15,118,110,0.12), 0 2px 8px rgba(0,0,0,0.08)',
            animation: `fadeUp .5s ease ${delay} both`,
            border: '1px solid rgba(255,255,255,0.8)',
            minWidth: 160,
            ...style,
        }}
    >
        {/* 圖示圓圈 */}
        <div
            style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                flexShrink: 0,
            }}
        >
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 2, letterSpacing: '0.03em' }}>
                {title}
            </div>
            <div
                style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: valueColor || '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                }}
            >
                {pulse && (
                    <span style={{ display: 'flex', gap: 3 }}>
                        {[0, 1, 2].map(i => (
                            <span
                                key={i}
                                style={{
                                    width: 5,
                                    height: 5,
                                    borderRadius: '50%',
                                    background: '#10b981',
                                    display: 'inline-block',
                                    animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                                }}
                            />
                        ))}
                    </span>
                )}
                {value}
            </div>
        </div>
    </div>
);

/* ── 統計小方塊 ────────────────────────────────────────────────────────────── */
export const StatBox1 = ({ value, label, delay = 0 }) => (
    <div
        style={{
            animation: `fadeUp .6s ease ${delay}s both`,
            textAlign: 'center',
        }}
    >
        <div
            style={{
                fontSize: '2rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #0d9488, #10b981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1,
                marginBottom: 4,
                fontFamily: "'Noto Sans TC', sans-serif",
            }}
        >
            {value}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#64748b', letterSpacing: '0.04em' }}>{label}</div>
    </div>
);


