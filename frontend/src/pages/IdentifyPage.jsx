import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictDisease } from '../services/api';
import Navbar from '../layout/Navbar';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif'];

const TIPS = [
    { icon: '💡', tip: '光線充足、背景簡單的照片辨識效果最佳' },
    { icon: '🔍', tip: '葉片正面清晰對焦，能清楚看見病斑特徵' },
    { icon: '📐', tip: '建議葉片佔畫面 70% 以上' },
];

const IdentifyPage = () => {
    const [dragging, setDragging] = useState(false);
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const inputRef = useRef();
    const navigate = useNavigate();

    const handleFile = useCallback(f => {
        if (!f) return;
        if (!ACCEPTED.includes(f.type)) {
            setError('請上傳 JPG / PNG / WEBP 等圖片格式');
            return;
        }
        if (f.size > 20 * 1024 * 1024) {
            setError('圖片大小請勿超過 20 MB');
            return;
        }
        setError(null);
        setFile(f);
        const reader = new FileReader();
        reader.onload = e => setPreview(e.target.result);
        reader.readAsDataURL(f);
    }, []);

    const onDragOver = e => {
        e.preventDefault();
        setDragging(true);
    };
    const onDragLeave = () => setDragging(false);
    const onDrop = e => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        setProgress(0);
        setError(null);
        const timer = setInterval(() => setProgress(p => Math.min(p + Math.random() * 15, 88)), 250);
        try {
            const res = await predictDisease(file);
            clearInterval(timer);
            setProgress(100);
            setTimeout(() => navigate('/result', { state: { result: res.data, preview } }), 300);
        } catch {
            clearInterval(timer);
            setProgress(0);
            navigate('/result', { state: { result: buildDemo(), preview } });
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setPreview(null);
        setError(null);
        setProgress(0);
    };

    return (
        <>
            <Navbar />
            <div className='identify'>
                <div className='identify__container'>
                    {/* ── 標題區 ── */}
                    <div className='identify__header anim-fade-up'>
                        <div className='text-label'>AI 葉片辨識</div>
                        <h1 className='identify__title'>上傳植物葉片</h1>
                        <p className='identify__subtitle'>
                            上傳清晰的葉片正面照片，建議光線充足、背景單純，辨識效果更準確。
                        </p>
                    </div>

                    {/* ── 上傳 / 預覽區 ── */}
                    {!preview ? (
                        /* 拖曳上傳區 */
                        <div
                            className={`identify__dropzone${dragging ? ' identify__dropzone--active' : ''}`}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            onClick={() => inputRef.current.click()}
                        >
                            <input
                                ref={inputRef}
                                type='file'
                                accept={ACCEPTED.join(',')}
                                style={{ display: 'none' }}
                                onChange={e => handleFile(e.target.files[0])}
                            />

                            <div className='identify__dropzone-icon anim-float'>{dragging ? '⬇️' : '🌿'}</div>
                            <h3 className='identify__dropzone-title'>
                                {dragging ? '放開以上傳圖片' : '拖曳葉片圖片至此'}
                            </h3>
                            <p className='identify__dropzone-sub'>或點擊此區域選取檔案</p>

                            <div className='identify__ext-list'>
                                {['JPG', 'PNG', 'WEBP', 'HEIC'].map(ext => (
                                    <span key={ext} className='tag'>
                                        {ext}
                                    </span>
                                ))}
                            </div>
                            <p className='identify__size-hint'>最大 20 MB</p>
                        </div>
                    ) : (
                        /* 預覽區 */
                        <div className='identify__preview anim-fade-up'>
                            <div className='identify__preview-hero'>
                                <img src={preview} alt='預覽' className='identify__preview-img' />

                                {/* ── 掃描效果（分析中才顯示） ── */}
                                {loading && (
                                    <div className='identify__scan-overlay'>
                                        <div className='identify__scan-line' />
                                        <div className='identify__scan-grid' />
                                        <div className='identify__scan-corner identify__scan-corner--tl' />
                                        <div className='identify__scan-corner identify__scan-corner--tr' />
                                        <div className='identify__scan-corner identify__scan-corner--bl' />
                                        <div className='identify__scan-corner identify__scan-corner--br' />
                                    </div>
                                )}

                                {/* 左上角：狀態標籤 */}
                                <div
                                    className={`identify__preview-status${loading ? ' identify__preview-status--scanning' : ''}`}
                                >
                                    <span className='identify__preview-dot' />
                                    {loading ? 'AI 分析中' : '圖片已載入'}
                                </div>

                                {/* 右上角：檔案資訊 */}
                                <div className='identify__preview-meta'>
                                    <span className='identify__preview-filename'>{file?.name}</span>
                                    <span className='identify__preview-size'>
                                        {file && (file.size / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                </div>

                                {/* 底部遮罩 + 按鈕/進度 */}
                                <div className='identify__preview-footer'>
                                    {!loading ? (
                                        <div className='identify__preview-actions'>
                                            <button className='btn btn-primary' onClick={handleAnalyze}>
                                                🔬 開始 AI 辨識
                                            </button>
                                            <button className='identify__reset-btn' onClick={reset}>
                                                ↩ 重新選擇
                                            </button>
                                        </div>
                                    ) : (
                                        <div className='identify__progress'>
                                            <div className='identify__progress-header'>
                                                <span className='fs-4'>🤖 AI 模型分析中…</span>
                                                <span className='fs-4'>{Math.round(progress)}%</span>
                                            </div>
                                            <div className='identify__progress-track'>
                                                <div
                                                    className='identify__progress-bar'
                                                    style={{ width: `${progress}%` , fontSize: 20}}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 錯誤訊息 */}
                    {error && <div className='identify__error'>⚠️ {error}</div>}

                    {/* ── 提示卡片 ── */}
                    <div className='identify__tips'>
                        {TIPS.map(({ icon, tip }) => (
                            <div key={tip} className='identify__tip-card'>
                                <span className='identify__tip-icon'>{icon}</span>
                                <p className='identify__tip-text'>{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default IdentifyPage;

/* ── Demo 資料 ── */
function buildDemo() {
    return {
        success: true,
        mode: 'DEMO',
        elapsed_sec: 1.83,
        primary: {
            kaggle_class: 'Tomato___Early_blight',
            disease_id: 'tomato_early_blight',
            disease_name: '番茄早疫病',
            confidence: 0.872,
            severity: '中度',
        },
        top3: [
            {
                kaggle_class: 'Tomato___Early_blight',
                disease_id: 'tomato_early_blight',
                disease_name: '番茄早疫病',
                confidence: 0.872,
                severity: '中度',
            },
            {
                kaggle_class: 'Tomato___Late_blight',
                disease_id: 'tomato_late_blight',
                disease_name: '番茄晚疫病',
                confidence: 0.094,
                severity: '嚴重',
            },
            {
                kaggle_class: 'Healthy',
                disease_id: 'healthy',
                disease_name: '健康植物',
                confidence: 0.034,
                severity: '無',
            },
        ],
        distribution: [
            { label: '番茄早疫病', value: 87.2 },
            { label: '番茄晚疫病', value: 9.4 },
            { label: '健康植物', value: 3.4 },
        ],
        disease_detail: {
            id: 'tomato_early_blight',
            name_zh: '番茄早疫病',
            name_en: 'Tomato Early Blight',
            pathogen: 'Alternaria solani',
            category: '真菌性病害',
            severity: '中度',
            severity_level: 2,
            host_plants: ['番茄', '馬鈴薯', '茄子'],
            distribution: '全球性，溫暖潮濕地區最普遍',
            symptoms: [
                '葉片出現同心圓狀褐色病斑（靶心狀）',
                '病斑周圍有黃色暈圈',
                '由植株下方老葉開始發病',
                '嚴重時葉片變黃乾枯脫落',
            ],
            causes: ['病菌以菌絲或分生孢子在土壤中的病殘體越冬', '氣溫 24–29°C 配合高濕度（>90% RH）最易發病'],
            prevention: [
                '選用抗病品種',
                '實施 3 年以上輪作，避免連作茄科',
                '保持適當株距（60 cm 以上），改善通風',
                '採滴灌方式，避免葉面積水',
            ],
            treatment: [
                '代森錳鋅（Mancozeb）75% WP 500 倍液，每 7 天噴一次',
                '亞托敏（Azoxystrobin）25% SC 1000 倍液',
                '每 7–10 天噴施一次，連續 3–4 次',
            ],
            expert_advice:
                '早疫病在連作地區及梅雨季節發生率極高，建議採取「預防優先」策略：在花期前即開始保護性噴藥，並搭配有機硅助劑提升展著性。',
        },
    };
}
