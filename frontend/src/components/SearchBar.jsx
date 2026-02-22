/**
 * SearchBar.jsx
 * 病害搜尋 + 篩選區塊
 * 樣式請見 SearchBar.scss
 */


export default function SearchBar({
    search, setSearch,
    catFilter, setCat,
    sevFilter, setSev,
    filteredCount,
    CATEGORIES,
    SEVERITIES,
}) {
    return (
        <div className="sb-wrap">
            <div className="sb-row">

                {/* ── 搜尋框 ── */}
                <div className="sb-search">
                    <input
                        className="sb-search-input"
                        placeholder="搜尋病害名稱、病原體…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <span className="sb-search-icon">🔍</span>
                    {search && (
                        <button
                            className="sb-search-clear"
                            onClick={() => setSearch('')}
                            aria-label="清除搜尋"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="sb-divider" />

                {/* ── 類型下拉 ── */}
                <div className="sb-select-wrap">
                    <select value={catFilter} onChange={e => setCat(e.target.value)}>
                        {CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                {/* ── 嚴重程度下拉 ── */}
                <div className="sb-select-wrap">
                    <select value={sevFilter} onChange={e => setSev(e.target.value)}>
                        {SEVERITIES.map(s => (
                            <option key={s} value={s}>
                                {s === '全部' ? '所有嚴重程度' : s}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="sb-divider" />

                {/* ── 結果計數 ── */}
                <div className="sb-count">
                    共 <strong>{filteredCount}</strong> 筆結果
                </div>

            </div>
        </div>
    );
}