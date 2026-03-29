import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Pricing() {
    const plans = [
        {
            name: "Free",
            price: "£0",
            period: "Forever",
            description: "Get started with your first property. See what real answers feel like.",
            features: [
                "One property",
                "Upload and store your documents",
                "Basic property questions answered",
                "Maintenance reminders",
                "Your data stays yours",
            ],
            buttonText: "Start Free",
            buttonVariant: "outline",
            priceColor: "text-[#00c0f9]",
        },
        {
            name: "Pro",
            price: "£8",
            period: "/mo",
            subPeriod: "Per property",
            description: "Everything you need to stay on top of your property. The full picture, always up to date.",
            features: [
                "Unlimited questions about your property",
                "Proactive maintenance guidance",
                "Complete document storage",
                "Warranty and service tracking",
                "Cost tracking and history",
                "Property report when you sell",
            ],
            buttonText: "Start Free",
            buttonVariant: "solid",
            priceColor: "text-[#fd6916]",
            popular: true,
        },
        {
            name: "For Landlords",
            price: "£6",
            period: "/mo",
            subPeriod: "Per property (5+ properties)",
            description: "Manage your portfolio without the chaos. Stay compliant, stay informed.",
            features: [
                "Everything in Pro",
                "Portfolio dashboard",
                "Compliance tracking",
                "Multi-property reporting",
                "Tenant documentation",
                "Dedicated support",
            ],
            buttonText: "Get in Touch",
            buttonVariant: "outline",
            priceColor: "text-[#c084fc]",
        },
    ];

    const [openFaq, setOpenFaq] = useState(0);

    const faqs = [
        {
            question: "Can I really start for free?",
            answer: "Yes. Add one property, upload your documents, ask questions. No credit card, no time limit. Upgrade when you want more."
        },
        {
            question: "What happens to my data if I cancel?",
            answer: "Your data stays yours. You can export everything at any time. If you cancel Pro, you keep read access to your records on the free plan."
        },
        {
            question: "Do I need Pro for each property?",
            answer: "The free plan covers one property. Pro is per property. Landlords with five or more properties get the volume rate automatically."
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section
                className="relative py-20 px-6 bg-cover bg-no-repeat"
                style={{
                    backgroundImage: "url('/assets/howitworks/howitworks.png')",
                    backgroundPosition: 'center'
                }}
            >
                <div className="absolute inset-0 bg-black/50"></div> {/* Optional overlay to ensure text readability */}
                <div className="relative max-w-7xl mx-auto text-center text-white">
                    <h1 className="text-2xl md:text-3xl font-medium mb-6">Simple, Transparent Pricing</h1>
                    <p className="text-lg md:text-xl text-gray-300">Free to start. Upgrade when you need more.</p>
                </div>
            </section>

            {/* Pricing Cards Section */}
            <section className="bg-[#f9fafb] py-16 px-6 border-t-[3px] border-[#00c0f9]">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-12">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`relative flex flex-col bg-white rounded-md p-6 shadow-sm transition-all duration-300 ${plan.popular ? "border-2 border-[#fd6916]" : "border border-gray-100"
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fd6916] text-white text-[10px] uppercase font-bold px-5 py-1.5 rounded-full whitespace-nowrap z-20">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-[#1a1a1a] font-bold text-lg mb-4">{plan.name}</h3>
                                    <div className="flex flex-col mb-4">
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-4xl font-bold ${plan.priceColor}`}>{plan.price}</span>
                                            {plan.period !== "Forever" && (
                                                <span className="text-gray-400 font-medium text-sm">{plan.period}</span>
                                            )}
                                        </div>
                                        <div className="mt-0.5">
                                            <span className="text-gray-400 text-[12px] font-medium">
                                                {plan.period === "Forever" ? "Forever" : plan.subPeriod}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-[13px] leading-relaxed">
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="flex-grow mb-8 border-t border-gray-100">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3 py-3 border-b border-gray-50">
                                            <svg className="w-4 h-4 text-[#22c55e] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-gray-600 text-[13px]">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    className={`w-full py-2.5 rounded-md text-[13px] font-bold transition-all duration-200 ${plan.buttonVariant === "solid"
                                        ? "bg-[#fd6916] text-white hover:bg-[#e65a0c]"
                                        : "bg-white text-[#fd6916] border border-[#fd6916] hover:bg-orange-50"
                                        }`}
                                >
                                    {plan.buttonText}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Buying a Property Section */}
            <section className="py-20 bg-[#f3f7fd]">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-medium text-[#1a1a1a] mb-6">Buying a Property?</h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
                        Request a HomeTruth Report on any property you're viewing. See the verified
                        maintenance history, past issues, and what to watch out for. Make your offer with confidence.
                    </p>
                    <button className="bg-[#fd6916] text-white py-3.5 px-10 rounded-lg font-medium shadow-md hover:bg-[#e65a0c] transition-all">
                        £29 One-Time Report
                    </button>
                </div>
            </section>

            {/* Common Questions Section */}
            <section className="py-24 bg-white">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-[28px] font-medium text-[#1a1a1a] mb-12">Common Questions</h2>
                    <div className="divide-y divide-gray-100">
                        {faqs.map((faq, index) => (
                            <div key={index} className="py-4">
                                <button
                                    className="w-full flex justify-between items-center py-4 text-left font-medium text-[#1a1a1a]"
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                >
                                    <span className="text-base">{faq.question}</span>
                                    <svg
                                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {openFaq === index && (
                                    <div className="pb-6 text-gray-500 text-sm leading-relaxed max-w-2xl">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final Gradient CTA Section */}
            <section className="w-full bg-gradient-to-r from-[#fd6916] via-[#e27687] to-[#c084fc] py-16 md:py-20 flex flex-col items-center justify-center text-center px-6">
                <h2 className="text-2xl md:text-2xl font-medium text-white mb-4 tracking-tight">
                    Start Making Better Property Decisions
                </h2>
                <p className="text-white/90 text-lg mb-10">
                    Free to start. No credit card required.
                </p>

                <button
                    className="bg-white rounded-lg py-3 px-8 text-base font-medium flex items-center gap-2 cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-px hover:shadow-lg"
                    onClick={() => window.location.href = '/register'}
                >
                    Get Started
                    <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </button>
            </section>

            <Footer />
        </div>
    );
}
