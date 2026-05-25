import React from 'react';

export default function WhoWeHelp() {
    const sections = [
        {
            title: "First-Time Buyers",
            color: "text-ht-orange",
            borderColor: "border-l-ht-orange",
            items: [
                "Know what questions to ask before you buy",
                "Understand what maintenance actually costs",
                "Get confidence in your biggest purchase"
            ]
        },
        {
            title: "Homeowners",
            color: "text-ht-cyan",
            borderColor: "border-l-ht-cyan",
            items: [
                "Track what you've done to maximise your property's value",
                "Stay on top of maintenance before small problems become expensive",
                "Know your property inside and out"
            ]
        },
        {
            title: "Landlords",
            color: "text-ht-purple-light",
            borderColor: "border-l-ht-purple-light",
            items: [
                "Stay compliant with changing regulations",
                "Document everything for protection",
                "Manage multiple properties without the chaos"
            ]
        }
    ];

    return (
        <section className="py-20 px-5 bg-gray-50 font-sans text-center">
            <div className="mb-12">
                <h2 className="text-[28px] font-semibold text-ht-black mb-3">Who We Help</h2>
                <p className="text-base text-ht-mid-grey max-w-[600px] mx-auto">
                    HomeTruth is for everyone making property decisions
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
                {sections.map((section, idx) => (
                    <div
                        key={idx}
                        className={`bg-white p-8 rounded-xl text-left shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 border-l-4 ${section.borderColor} transition-all duration-200 ease-in-out flex flex-col gap-5 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]`}
                    >
                        <h3 className="text-[18px] font-bold text-ht-black mb-2">{section.title}</h3>
                        <ul className="list-none p-0 m-0 flex flex-col gap-4">
                            {section.items.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                                    <span className={`font-bold shrink-0 mt-[1px] ${section.color}`}>→</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}
