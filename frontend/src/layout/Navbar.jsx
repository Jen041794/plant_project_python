import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import plant from '../assets/images/plant.png';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <header className='header shadow'>
            <div className='container d-flex justify-content-between align-items-center'>
                {/* Logo */}
                <div className='header_logo'>
                    <NavLink to='/' className='d-flex align-items-center'>
                        <img src={plant} width={30} height={30} alt="logo" />
                        <h1 className='fs-3 ms-3 mb-0 text-white'>植物病害辨識系統</h1>
                    </NavLink>
                </div>

                {/* 漢堡按鈕 (小螢幕顯示) */}
                <button 
                    className='hamburger d-md-none' 
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    {/* 三條線的icon，可以用FontAwesome或自己寫 */}
                    <span className='hamburger-line'></span>
                    <span className='hamburger-line'></span>
                    <span className='hamburger-line'></span>
                </button>

                {/* Menu */}
                <ul className={`header_menu mb-0 ${isOpen ? 'open' : ''} d-md-flex`}>
                    <li className='header_menu_item'>
                        <NavLink to='/' className='fs-4'>首頁</NavLink>
                    </li>
                    <li className='header_menu_item'>
                        <a href='/#intro' className='fs-4 mx-md-3'>系統介紹</a>
                    </li>
                    <li className='header_menu_item'>
                        <NavLink to='/diseases' className='fs-4'>病害列表</NavLink>
                    </li>
                    <li className='header_menu_item'>
                        <NavLink to='/identify' className='fs-4 mx-md-3'>即時辨識</NavLink>
                    </li>
                    <li className='header_menu_item'>
                        <NavLink to='/aboutus' className='fs-4 me-md-3'>關於我們</NavLink>
                    </li>
                    <li className='header_menu_item'>
                        <NavLink to='/faq' className='fs-4'>常見問題</NavLink>
                    </li>
                </ul>
            </div>
        </header>
    );
};

export default Navbar;
