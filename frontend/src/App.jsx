import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import HomePage from './pages/HomePage';
import IdentifyPage from './pages/IdentifyPage';
import ResultPage from './pages/ResultPage';
import DiseasesPage from './pages/DiseasesPage';
import DiseaseDetailPage from './pages/DiseaseDetailPage';
import AboutUsPage from './pages/AboutUs';
import FaqPage from './pages/Faq';
import './assets/main.scss';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/identify' element={<IdentifyPage />} />
                <Route path='/result' element={<ResultPage />} />
                <Route path='/diseases' element={<DiseasesPage />} />
                <Route path='/diseases/:id' element={<DiseaseDetailPage />} />
                <Route path='/aboutus' element={<AboutUsPage />}/>
                <Route path='/faq' element={<FaqPage />}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
