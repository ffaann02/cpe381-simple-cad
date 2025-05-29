import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { TabProvider } from "./context/AppContext";
import CadEditor from "./pages/CadEditor";
import Docs from "./pages/Docs";
import Home from "./pages/Home";
import About from "./pages/About";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <TabProvider>
        <div>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/editor" element={<CadEditor />} />
              <Route path="/about" element={<About />} />
              <Route path="/docs" element={<Docs />} />
            </Routes>
          </main>
          {/* <Footer /> */}
        </div>
      </TabProvider>
    </Router>
  );
}

export default App;
