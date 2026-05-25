import React from 'react';
import CallToAction from './CallToAction';

export default function FinalCTA() {
    return (
        <section className="w-full bg-gradient-to-r from-ht-orange via-ht-purple to-ht-cyan py-16 md:py-20 flex flex-col items-center justify-center text-center px-6">
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
