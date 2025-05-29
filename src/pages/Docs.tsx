
import Properties from "@/components/pages/docs/Properties";
import Shotcut from "@/components/pages/docs/Shotcut";
import Tools from "@/components/pages/docs/Tools";
import { useState } from "react";

const Docs = () => {
    const [tab, setTab] = useState('');

    const renderTab = () => {
        switch (tab) {
            case "tools":
                return <Tools />;
            case "properties":
                return <Properties/>;
            case "shotcut":
                return <Shotcut/>;
            default:
                return null;
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
             <aside className="w-64 bg-neutral-200 p-6 border-r flex flex-col">
                <h1 className="text-2xl font-bold mb-6">Documentation</h1>
                <nav className="flex flex-col gap-4">
                    <button className="text-left hover:text-blue-400" onClick={() => setTab('')}>
                        Shape
                    </button>
                    <button className="text-left hover:text-blue-400" onClick={() => setTab('tools')}>
                        Tools
                    </button>
                    <button className="text-left hover:text-blue-400" onClick={() => setTab('properties')}>
                        Properties
                    </button>
                    <button className="text-left hover:text-blue-400" onClick={() => setTab('shotcut')}>
                        Shotcut
                    </button>
                    
                </nav>
            </aside>
            {/* Main Content */}
            <main>
                {tab === '' ? (
                    <>
                        <h2 className="text-2xl font-bold mb-4">hello</h2>
                        <p className="text-9xl">หีหีหี</p>
                    </>
                ) : (
                    renderTab()
                )}
            </main>
        </div>
    );
};

export default Docs;