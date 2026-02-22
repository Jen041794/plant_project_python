import { useState} from 'react';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';


// ── 資料 ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
    { key: '產品功能', icon: '⚙️', count: 4 },
    { key: '使用指南', icon: '📖', count: 3 },
    { key: '技術原理', icon: '🔬', count: 3 },
    { key: '帳戶與服務', icon: '👤', count: 3 },
];

const FAQS = {
    產品功能: [
        { q: '植物病害辨識系統可以辨識哪些植物？', a: '目前系統支援超過 100 種常見植物病害的辨識，涵蓋水稻、小麥、玉米、番茄、馬鈴薯、葡萄、蘋果、柑橘等主要農作物。我們將繼續擴充病害資料庫，每季度都會新增更多病害種類。' },
        { q: '辨識的準確率有多高？', a: '我們的 AI 模型基於 PlantVillage 資料集（超過 54,000 張圖片）訓練，在標準測試集上的準確率達到 94.3%。實際使用時，照片品質（光線、清晰度、角度）會影響辨識效果。' },
        { q: '辨識結果會提供哪些資訊？', a: '辨識結果包含：病害名稱（中英文）、置信度百分比、嚴重程度評估、病原體資訊、主要症狀說明、預防措施、治療方案以及專家建議。' },
        { q: '系統是否支援離線使用？', a: '目前系統需要網路連線才能使用，因為 AI 模型運算在雲端伺服器進行。未來版本計劃推出輕量化的離線模型供下載使用。' },
    ],
    使用指南: [
        { q: '如何拍攝最佳的葉片照片？', a: '建議在自然光下拍攝，避免陰影和反光。葉片應佔畫面 70% 以上，背景盡量單純（白色或深色）。對焦清晰，確保病斑部位清楚可見。解析度建議 800x800 像素以上。' },
        { q: '支援哪些圖片格式？', a: '支援 JPG、PNG、WEBP 和 HEIC 格式，單張圖片大小不超過 20 MB。建議使用 JPG 或 PNG 格式以獲得最佳辨識效果。' },
        { q: '辨識需要多長時間？', a: '一般情況下，辨識過程約需 1-3 秒。網路狀況較差時可能需要稍長時間，但通常不超過 10 秒。' },
    ],
    技術原理: [
        { q: 'AI 模型使用什麼技術？', a: '我們使用深度卷積神經網路（CNN），基於 EfficientNet 架構進行遷移學習（Transfer Learning）。模型在 PlantVillage Kaggle 資料集上進行微調訓練，並透過資料增強（Data Augmentation）技術提升泛化能力。' },
        { q: '資料集包含哪些內容？', a: 'PlantVillage 資料集包含超過 54,000 張植物葉片圖片，涵蓋 38 種病害類別，由賓州州立大學研究團隊整理製作，是植物病害辨識領域最廣泛使用的標準資料集之一。' },
        { q: '模型會持續更新嗎？', a: '是的，我們定期收集用戶反饋和新增圖片資料，每季度進行一次模型重新訓練和評估，持續提升辨識準確率並新增支援的病害種類。' },
    ],
    帳戶與服務: [
        { q: '使用服務需要付費嗎？', a: '目前 PhytoScan 提供免費基礎版本，包含每日 20 次辨識配額和基本病害資料庫存取。進階版本提供無限次辨識、API 接入和詳細報告功能，請聯繫我們了解更多。' },
        { q: '我的圖片資料會被保留嗎？', a: '上傳的圖片僅用於當次辨識，不會永久儲存於伺服器。我們重視用戶隱私，詳細資訊請參閱我們的隱私政策。' },
        { q: '系統是否支援 API 整合？', a: '企業方案支援 API 整合，可將辨識功能嵌入您自己的系統或應用程式。請聯繫我們的業務團隊討論合作方案。' },
    ],
};

// ── 手風琴 ────────────────────────────────────────────────────────────────────
function FaqItem({ q, a, index }) {
    const [open, setOpen] = useState(index === 0);
    return (
        <div className={`faq-item${open ? ' faq-item--open' : ''}`}>
            <button className='faq-item__header' onClick={() => setOpen(o => !o)}>
                <span className='faq-item__num'>{String(index + 1).padStart(2, '0')}</span>
                <span className='faq-item__q'>{q}</span>
                <span className='faq-item__toggle'>{open ? '−' : '+'}</span>
            </button>
            <div className='faq-item__body-wrap' style={{ maxHeight: open ? '400px' : '0' }}>
                <div className='faq-item__body'><p>{a}</p></div>
            </div>
        </div>
    );
}

// ── 主頁面 ────────────────────────────────────────────────────────────────────
const FaqPage = () => {
    const [activeCat, setActiveCat] = useState('產品功能');
    const [search, setSearch]       = useState('');

    const searchResults = search.trim()
        ? Object.entries(FAQS).flatMap(([, items]) =>
            items.filter(i => i.q.includes(search) || i.a.includes(search))
          )
        : null;

    const displayItems = searchResults ?? FAQS[activeCat] ?? [];

    return (
        <>
            <Navbar />
            <div className='faq-page'>

                {/* ── Hero ── */}
                <section className='faq-hero'>
                    <div className='faq-hero__glow faq-hero__glow--1' />
                    <div className='faq-hero__glow faq-hero__glow--2' />
                    <div className='faq-hero__grid-bg' />
                    <div className='container'>
                        <div className='row justify-content-center text-center'>
                            <div className='col-12 col-lg-7'>
                                <div className='faq-hero__badge'>• FAQ</div>
                                <h1 className='faq-hero__title'>常見<span>問題</span></h1>
                                <p className='faq-hero__desc'>找不到答案嗎？搜尋或瀏覽以下分類</p>
                                <div className='faq-search'>
                                    <span className='faq-search__ico'>🔍</span>
                                    <input
                                        className='faq-search__input'
                                        placeholder='搜尋問題關鍵字…'
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                    {search && <button className='faq-search__clear' onClick={() => setSearch('')}>×</button>}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── 主體：左右分欄 ── */}
                <section className='faq-main'>
                    <div className='container'>
                        <div className='row g-5'>

                            {/* 左欄：分類導航 */}
                            {!search && (
                                <div className='col-12 col-lg-3'>
                                    <div className='faq-nav'>
                                        <div className='faq-nav__title'>分類</div>
                                        {CATEGORIES.map(({ key, icon, count }) => (
                                            <button
                                                key={key}
                                                className={`faq-nav__item${activeCat === key ? ' faq-nav__item--active' : ''}`}
                                                onClick={() => setActiveCat(key)}
                                            >
                                                <span className='faq-nav__icon'>{icon}</span>
                                                <span className='faq-nav__label'>{key}</span>
                                                <span className='faq-nav__count'>{count}</span>
                                            </button>
                                        ))}

                                        {/* 小幫手卡片 */}
                                        <div className='faq-nav__card'>
                                            <div className='faq-nav__card-icon'>💬</div>
                                            <p className='faq-nav__card-text'>還有其他問題？</p>
                                            <button className='faq-nav__card-btn'>聯繫我們</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 右欄：問答列表 */}
                            <div className={`col-12 ${search ? '' : 'col-lg-9'}`}>
                                {search && (
                                    <p className='faq-search-hint'>
                                        搜尋「<strong>{search}</strong>」找到 {displayItems.length} 筆結果
                                    </p>
                                )}

                                {displayItems.length > 0 ? (
                                    <div className='faq-list'>
                                        {displayItems.map((item, i) => (
                                            <FaqItem key={`${activeCat}-${i}`} q={item.q} a={item.a} index={i} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className='faq-empty'>
                                        <div className='faq-empty__icon'>🌿</div>
                                        <h4>找不到相關問題</h4>
                                        <p>請試試其他關鍵字，或瀏覽左側分類</p>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className='faq-cta-section'>
                    <div className='container'>
                        <div className='faq-cta'>
                            <div className='faq-cta__deco faq-cta__deco--1' />
                            <div className='faq-cta__deco faq-cta__deco--2' />
                            <div className='row align-items-center g-4'>
                                <div className='col-12 col-md-7'>
                                    <div className='faq-cta__icon'>💬</div>
                                    <h2 className='faq-cta__title'>沒有找到答案？</h2>
                                    <p className='faq-cta__desc'>我們的農業 AI 專家團隊隨時為您服務</p>
                                </div>
                                <div className='col-12 col-md-5 d-flex gap-3 justify-content-md-end flex-wrap'>
                                    <button className='faq-cta__btn faq-cta__btn--ghost'>✉ 聯繫我們</button>
                                    <button className='faq-cta__btn faq-cta__btn--solid'>✉ 發送郵件</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
            <Footer />
        </>
    );
};

export default FaqPage;