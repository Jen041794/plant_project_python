import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictDisease } from '../services/api';
import Navbar from '../layout/Navbar';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif'];

const TIPS = [
    { icon: '💡', tip: '光線充足、背景簡單的照片辨識效果最佳' },
    { icon: '🔍', tip: '葉片正面清晰對焦，能清楚看見病斑特徵' },
    { icon: '📐', tip: '建議葉片佔畫面 70% 以上，單片葉子為主體' },
    { icon: '🌿', tip: '支援作物：蘋果、藍莓、櫻桃、玉米、葡萄、柳橙、桃、甜椒、馬鈴薯、覆盆子、大豆、南瓜、草莓、番茄' },
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

    const onDragOver = e => { e.preventDefault(); setDragging(true); };
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
        } catch (err) {
            clearInterval(timer);
            setProgress(0);
            // 根據錯誤類型顯示對應訊息
            if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network')) {
                setError('無法連線到後端伺服器，請確認 python app.py 是否正在執行');
            } else if (err?.response?.status === 400) {
                setError('圖片格式不正確，請重新上傳');
            } else if (err?.response?.status === 500) {
                setError('伺服器發生錯誤，請稍後再試');
            } else {
                setError('辨識失敗，請確認後端伺服器是否正常運作');
            }
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
                                    <span key={ext} className='tag'>{ext}</span>
                                ))}
                            </div>
                            <p className='identify__size-hint'>最大 20 MB</p>
                        </div>
                    ) : (
                        <div className='identify__preview anim-fade-up'>
                            <div className='identify__preview-hero'>
                                <img src={preview} alt='預覽' className='identify__preview-img' />

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

                                <div className={`identify__preview-status${loading ? ' identify__preview-status--scanning' : ''}`}>
                                    <span className='identify__preview-dot' />
                                    {loading ? 'AI 分析中' : '圖片已載入'}
                                </div>

                                <div className='identify__preview-meta'>
                                    <span className='identify__preview-filename'>{file?.name}</span>
                                    <span className='identify__preview-size'>
                                        {file && (file.size / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                </div>

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
                                                    style={{ width: `${progress}%`, fontSize: 20 }}
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