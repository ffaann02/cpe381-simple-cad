import Navbar from "./components/layout/Navbar";
import { TabProvider } from "./context/AppContext";
import CadEditor from "./pages/CadEditor";
import Docs from "./pages/Docs";
import Home from "./pages/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <TabProvider>
        <Navbar />
        <div className="relative">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/editor" element={<CadEditor />} />
            <Route path="/docs" element={<Docs/>}/>
          </Routes>
        </div>
      </TabProvider>
    </Router>
  );
}

export default App;
