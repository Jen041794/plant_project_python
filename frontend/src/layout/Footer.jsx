import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const QUICK_LINKS = [
    { label: '系統介紹', to: '/#intro' },
    { label: '病害百科', to: '/diseases' },
    { label: '即時辨識', to: '/identify' },
    { label: '關於我們', to: '/aboutus' },
    { label: '常見問題', to: '/faq' },
];
const SOCIAL = ['Facebook', 'Instagram', 'Twitter', 'YouTube'];
const LEGAL = ['隱私政策', '服務條款'];

const Footer = () => {
    const [email, setEmail] = useState('');

    const handleSubscribe = e => {
        e.preventDefault();
        if (!email) return;
        alert(`已訂閱：${email}`);
        setEmail('');
    };

    return (
        <footer className='footer'>
            <div className='container'>
                {/* ── 上半部 ── */}
                <div className='row footer__top'>
                    {/* 左欄：訂閱 */}
                    <div className='col-12 col-md-4 footer__brand'>
                        <h3 className='footer__title'>掌握植物健康</h3>
                        <p className='footer__desc'>訂閱我們的電子報，獲取最新病害預警和防治技巧</p>
                        <div className='footer__subscribe'>
                            <input
                                type='email'
                                className='footer__input'
                                placeholder='輸入您的電子郵件'
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSubscribe(e)}
                            />
                            <button className='footer__btn' onClick={handleSubscribe}>
                                訂閱 →
                            </button>
                        </div>
                    </div>

                    {/* 中欄：快速連結 */}
                    <div className='col-6 col-md-4 footer__links'>
                        <h5 className='footer__col-title'>快速連結</h5>
                        <ul className='footer__list'>
                            {QUICK_LINKS.map(({ label, to }) => (
                                <li key={label}>
                                    <Link to={to}>{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 右欄：聯絡資訊 */}
                    <div className='col-6 col-md-4 footer__contact'>
                        <h5 className='footer__col-title'>聯絡我們</h5>
                        <ul className='footer__list'>
                            <li>
                                <a href='tel:02-1234-5678'>
                                    <span className='footer__icon'>📞</span>
                                    +886-2-1234-5678
                                </a>
                            </li>
                            <li>
                                <a href='mailto:support@plant-detection.com'>
                                    <span className='footer__icon'>✉</span>
                                    support@plant-detection.com
                                </a>
                            </li>
                        </ul>

                        <h5 className='footer__col-title footer__col-title--mt'>服務時間</h5>
                        <p className='footer__hours'>週一至週五 09:00 - 18:00</p>
                        <p className='footer__hours'>週六 09:00 - 12:00</p>
                    </div>
                </div>

                {/* 分隔線 */}
                <hr className='footer__divider' />
            </div>

            {/* ── 下半部 ── */}
            <div className='footer__bottom'>
                <div className='container'>
                    <div className='row align-items-center footer__bottom-row'>
                        {/* 社群連結 */}
                        <div className='col-12 col-md-4 footer__social'>
                            {SOCIAL.map(s => (
                                <a key={s} href='#'>
                                    {s}
                                </a>
                            ))}
                        </div>

                        {/* 版權 */}
                        <div className='col-12 col-md-4 footer__copy'>
                            © 2025 植物病害辨識系統. All rights reserved.
                        </div>

                        {/* 法律連結 */}
                        <div className='col-12 col-md-4 footer__legal'>
                            {LEGAL.map(l => (
                                <a key={l} href='#'>
                                    {l}
                                </a>
                            ))}
                            <span>Powered by Readdy</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;