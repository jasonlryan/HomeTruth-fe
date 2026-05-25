import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Resources = () => {
    const resourceCards = [
        {
            title: "The HomeTruth Report | B2B Proposition",
            description: "See how the HomeTruth Report becomes a tamper-proof, pay-per-pull business product for banks, insurers, agents, and contractors.",
            date: "Feb 16, 2026",
            tags: ["HTML", "PUBLIC"],
            borderColor: "border-blue-400",
        },
        {
            title: "HomeTruth Blockchain & Ledger Strategy | Resources",
            description: "How HomeTruth anchors transactional evidence on-chain with Polygon, optional Ethereum anchoring, and Merkle batching while keeping documents and PII off-chain.",
            date: "Feb 16, 2026",
            tags: ["HTML", "PUBLIC"],
            borderColor: "border-blue-300",
        },
        {
            title: "HomeTruth Document Ingestion | Smart Structuring",
            description: "See how HomeTruth ingests uploaded documents, auto-detects type and schema matching, and adds structured data into private and public knowledge stacks.",
            date: "Feb 16, 2026",
            tags: ["HTML", "PUBLIC"],
            borderColor: "border-purple-300",
        },
        {
            title: "HomeTruth Profiling System | Resources",
            description: "See how the HomeTruth profiling system onboards users, captures explicit and implicit signals, and translates them into proactive, personalized guidance.",
            date: "Feb 16, 2026",
            tags: ["HTML", "PUBLIC"],
            borderColor: "border-blue-300",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-brand">
            <Navbar />

            <main className="flex-grow mx-auto px-4 md:px-10 py-16 max-w-[1800px] w-full">
                {/* Hero Section */}
                <section className="bg-white rounded-[2rem] shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-slate-100 p-8 md:p-12 mb-12 flex flex-col lg:flex-row gap-8 items-stretch">
                    <div className="flex-1 space-y-6 flex flex-col justify-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-sky-50 text-ht-dark px-4 py-1.5 rounded-full text-[11px] font-bold tracking-tight border border-sky-100">
                                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                                HomeTruth Resources
                            </div>
                        </div>

                        <h1 className="text-xl md:text-[2rem] font-medium text-gray-900 leading-[1.1] tracking-tight">
                            Explain the &ldquo;why&rdquo; behind every HomeTruth touchpoint.
                        </h1>

                        <p className="text-[17px] text-gray-500 leading-relaxed max-w-2xl font-normal">
                            A library of explainer pages we can share with users, partners, or the team covering onboarding flows, data inputs, and the personalised outcomes they unlock.
                        </p>

                        <div className="flex flex-wrap gap-3 pt-2">
                            <span className="bg-sky-50 text-ht-dark px-5 py-2.5 rounded-full text-sm font-medium border border-sky-100">
                                Dynamic index: reads everything in <span className="text-ht-cyan font-semibold">public/resources</span>
                            </span>
                            <span className="bg-white text-gray-500 px-5 py-2.5 rounded-full text-sm font-medium border border-gray-200">
                                Ready to share or link in-product
                            </span>
                        </div>
                    </div>

                    <div className="w-full lg:w-[480px] bg-gray-50 rounded-[2rem] p-6 flex flex-col justify-center space-y-4 border border-sky-50">
                        <div className="bg-white p-5 rounded-2xl flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-50 group cursor-pointer hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-ht-cyan shrink-0">
                                <span className="material-symbols-outlined text-[22px]">description</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-[15px] mb-0.5">HomeTruth Profiling System</h3>
                                <p className="text-[11px] text-gray-400 font-medium leading-relaxed">Why the 2&ndash;3 minute onboarding exists and how it powers the property assistant.</p>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl flex items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-100/50 group cursor-pointer hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-ht-purple shrink-0">
                                <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-[15px] mb-0.5">Add more explainers</h3>
                                <p className="text-[11px] text-gray-400 font-medium leading-relaxed">Drop new HTML files into <span className="text-gray-400 font-bold">public/resources</span> to have them appear below automatically.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Resource Library Section */}
                <section>
                    <div className="flex justify-between items-center mb-8 px-2">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Resource library</h2>
                        <div className="bg-white text-black px-3 py-1 rounded-full text-sm font-bold border border-gray-100 shadow-sm flex items-center justify-center">
                            4 items
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {resourceCards.map((card, index) => (
                            <div
                                key={index}
                                className="
    relative
    bg-white
    rounded-xl
    p-4
    shadow-[0_4px_20px_rgba(0,0,0,0.03)]
    hover:shadow-md
    transition-all
    duration-300
    flex
    flex-col
    justify-between
    min-h-[200px]

    after:content-['']
    after:absolute
    after:bottom-0
    after:left-0
    after:w-full
    after:h-[4px]
    after:rounded-b-xl
    after:bg-gradient-to-r
    after:from-ht-cyan
    after:to-ht-purple-light
  "
                            >
                                <div>
                                    <div className="flex justify-between items-center mb-5">
                                        <span className="text-[10px] font-black tracking-widest text-ht-dark uppercase">EXPLAINER</span>
                                        <span className="text-sm text-gray-400 font-medium">Updated {card.date}</span>
                                    </div>

                                    <h3 className="text-lg font-medium text-gray-900 mb-2 leading-tight">
                                        {card.title}
                                    </h3>

                                    <p className="text-gray-500 text-md leading-relaxed mb-6 font-medium">
                                        {card.description}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 mt-auto">
                                    <button className="bg-ht-cyan hover:bg-ht-cyan-light text-white px-5 py-2 rounded-lg font-medium text-sm flex items-center gap-1.5 transition-all shadow-sm shadow-blue-100">
                                        Open explainer
                                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                    </button>

                                    <div className="flex items-center bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100">
                                        <span className="text-xs text-ht-dark font-bold tracking-wider flex items-center gap-1.5">
                                            HTML <span className="w-1 h-1 bg-ht-cyan rounded-full"></span> PUBLIC
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Resources;
