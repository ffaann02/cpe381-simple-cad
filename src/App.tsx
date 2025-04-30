import { TabProvider } from "./context/AppContext";
import CadEditor from "./pages/CadEditor";
import Home from "./pages/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <TabProvider>
      <div className="relative">
        <h1 className="text-xl text-center py-1 text-slate-600">CPE381: Computer Graphic</h1>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor" element={<CadEditor />} />
        </Routes>
      </div>
      </TabProvider>
    </Router>
  );
}

export default App;
