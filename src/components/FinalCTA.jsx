import React from 'react';
import CallToAction from './CallToAction';

export default function FinalCTA() {
    return (
        <section className="w-full bg-gradient-to-r from-[#00c0f9] via-[#8bb4f9] to-[#c084fc] py-16 md:py-20 flex flex-col items-center justify-center text-center px-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4 tracking-tight">
                Start Making Better Property Decisions
            </h2>
            <p className="text-white/90 text-lg mb-10">
                Free to start. No credit card required.
            </p>

            <CallToAction variant="white" />
        </section>
    );
}
