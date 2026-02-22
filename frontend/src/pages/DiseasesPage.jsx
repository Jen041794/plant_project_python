import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDiseases } from '../services/api';
import Navbar from '../layout/Navbar';
import SearchBar from '../components/SearchBar';
import { DiseaseCard } from '../components/DiseaseCard';

const CATEGORIES = ['全部', '真菌性病害', '細菌性病害', '卵菌性病害', '健康'];
const SEVERITIES = ['全部', '嚴重', '中度至嚴重', '中度', '低', '無'];

// ── 工具：修正含非 ASCII 字元的圖片 URL ────────────────────────────────────
function safeImgUrl(url) {
    if (!url) return '';
    try {
        return url.replace(/[^\x00-\x7F]/g, ch => encodeURIComponent(ch));
    } catch {
        return url;
    }
}

// ── 工具：normalize API 回傳資料，確保 id 與圖片 URL 正確 ──────────────────
function normalizeDisease(d) {
    return {
        ...d,
        id: d.id ?? d._id ?? d.disease_id ?? d.kaggle_class ?? '',
        images: (d.images ?? []).map(img => ({
            ...img,
            url: safeImgUrl(img.url),
        })),
    };
}

// ── Skeleton ────────────────────────────────────────────────────────────────
function SkeletonGrid() {
    return (
        <div className='diseases__grid'>
            {Array(6).fill(0).map((_, i) => (
                <div key={i} className='skeleton' style={{ height: 320, borderRadius: 'var(--radius)' }} />
            ))}
        </div>
    );
}

// ── EmptyState ──────────────────────────────────────────────────────────────
function EmptyState({ onReset }) {
    return (
        <div className='diseases__empty'>
            <div className='diseases__empty-icon'>🔍</div>
            <h3>找不到符合的病害</h3>
            <p>試試調整搜尋條件或清除篩選</p>
            <button className='btn btn-ghost' onClick={onReset}>
                清除篩選
            </button>
        </div>
    );
}

// ── 主頁面 ──────────────────────────────────────────────────────────────────
const DiseasesPage = () => {
    const [diseases, setDiseases]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState('');
    const [catFilter, setCat]       = useState('全部');
    const [sevFilter, setSev]       = useState('全部');
    const navigate = useNavigate();

    useEffect(() => {
        getDiseases()
            .then(r => {
                const list = r.data.diseases ?? r.data ?? [];
                setDiseases(list.map(normalizeDisease));
            })
            .catch(() => setDiseases(DEMO_LIST.map(normalizeDisease)))
            .finally(() => setLoading(false));
    }, []);

    const filtered = diseases.filter(d => {
        const q      = search.toLowerCase();
        const matchQ = !q
            || d.name_zh?.includes(q)
            || d.name_en?.toLowerCase().includes(q)
            || d.pathogen?.toLowerCase().includes(q);
        const matchC = catFilter === '全部' || d.category === catFilter;
        const matchS = sevFilter === '全部' || d.severity === sevFilter;
        return matchQ && matchC && matchS;
    });

    const handleReset = () => { setSearch(''); setCat('全部'); setSev('全部'); };

    const handleCardClick = (d) => {
        const targetId = d.id;
        if (!targetId) {
            console.warn('此病害缺少 id，無法導引', d);
            return;
        }
        navigate(`/diseases/${targetId}`);
    };

    return (
        <>
            <Navbar />
            <div className='diseases'>
                <div className='container'>

                    {/* 標題 */}
                    <div className='diseases__header anim-fade-up'>
                        <div className='text-label'>病害資料庫</div>
                        <h1>植物病害大全</h1>
                        <p>整合 PlantVillage Kaggle 資料集與多方爬蟲資料，涵蓋常見農作物病害的完整資訊。</p>
                    </div>

                    {/* 搜尋 & 篩選 */}
                    <SearchBar
                        search={search}
                        setSearch={setSearch}
                        catFilter={catFilter}
                        setCat={setCat}
                        sevFilter={sevFilter}
                        setSev={setSev}
                        filteredCount={filtered.length}
                        CATEGORIES={CATEGORIES}
                        SEVERITIES={SEVERITIES}
                    />

                    {/* 病害列表 */}
                    {loading ? (
                        <SkeletonGrid />
                    ) : filtered.length === 0 ? (
                        <EmptyState onReset={handleReset} />
                    ) : (
                        <div className='diseases__grid'>
                            {filtered.map((d, i) => (
                                <div
                                    key={d.id || i}
                                    style={{ animation: `fadeUp .5s ease ${i * 0.05}s both` }}
                                >
                                    <DiseaseCard
                                        disease={d}
                                        onClick={() => handleCardClick(d)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};

export default DiseasesPage;

// ── Demo fallback ────────────────────────────────────────────────────────────
const DEMO_LIST = [
    {
        id: 'tomato_early_blight',
        name_zh: '番茄早疫病', name_en: 'Tomato Early Blight',
        pathogen: 'Alternaria solani', category: '真菌性病害', severity: '中度',
        host_plants: ['番茄', '馬鈴薯'], images: [],
    },
    {
        id: 'tomato_late_blight',
        name_zh: '番茄晚疫病', name_en: 'Tomato Late Blight',
        pathogen: 'Phytophthora infestans', category: '卵菌性病害', severity: '嚴重',
        host_plants: ['番茄', '馬鈴薯'], images: [],
    },
    {
        id: 'corn_gray_leaf_spot',
        name_zh: '玉米灰葉斑病', name_en: 'Corn Gray Leaf Spot',
        pathogen: 'Cercospora zeae-maydis', category: '真菌性病害', severity: '中度至嚴重',
        host_plants: ['玉米'], images: [],
    },
    {
        id: 'apple_scab',
        name_zh: '蘋果黑星病', name_en: 'Apple Scab',
        pathogen: 'Venturia inaequalis', category: '真菌性病害', severity: '嚴重',
        host_plants: ['蘋果', '梨'], images: [],
    },
    {
        id: 'grape_black_rot',
        name_zh: '葡萄黑腐病', name_en: 'Grape Black Rot',
        pathogen: 'Guignardia bidwellii', category: '真菌性病害', severity: '嚴重',
        host_plants: ['葡萄'], images: [],
    },
    {
        id: 'healthy',
        name_zh: '健康植物', name_en: 'Healthy Plant',
        pathogen: '無', category: '健康', severity: '無',
        host_plants: ['所有作物'], images: [],
    },
];