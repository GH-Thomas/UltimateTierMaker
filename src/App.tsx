import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import EditListPage from './EditListPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/edit/:id" element={<EditListPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
