import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { TabProvider } from "./context/AppContext";
import CadEditor from "./pages/CadEditor";
import Home from "./pages/Home";
import About from "./pages/About";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <TabProvider>
        <div>
          <Navbar />
          <main className="mb-6 pt-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/editor" element={<CadEditor />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </TabProvider>
    </Router>
  );
}

export default App;
