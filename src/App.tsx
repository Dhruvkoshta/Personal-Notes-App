import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/Home";
import { LandingPage } from "./pages/LandingPage";
import { NotePage } from "./pages/NotePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/note/*" element={<NotePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
