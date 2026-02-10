import Image from "next/image";
import "./Hero.css";

export default function Hero() {
    return (
        <section className="hero" id="home">
            <div className="container hero-inner">
                {/* Left — Text */}
                <div className="hero-text">
                    <span className="hero-badge">🚀 SUVIDHA 2.0 IS LIVE</span>

                    <h1 className="hero-headline">
                        Governance at the
                        <br />
                        <span className="highlight">Speed of Light.</span>
                    </h1>

                    <p className="hero-subheadline">
                        Pay bills, report issues, and manage your city life.
                        <br />
                        Zero queues. Zero paperwork.
                    </p>

                    <div className="hero-actions">
                        <a href="/login" className="btn-primary">
                            Login to Dashboard
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </a>
                        <a href="/login" className="btn-secondary">Create Account</a>
                    </div>
                </div>

                {/* Right — Visual */}
                <div className="hero-visual">
                    <div className="hero-image-wrapper">
                        <Image
                            src="/dashboard.png"
                            alt="SUVIDHA Smart City Dashboard — Manage electricity, water, and municipal services"
                            width={560}
                            height={440}
                            priority
                        />

                        {/* Floating accent cards */}
                        <div className="hero-float-card card-1">
                            <span className="float-icon green">⚡</span>
                            Bill Paid — ₹1,240
                        </div>
                        <div className="hero-float-card card-2">
                            <span className="float-icon green">✅</span>
                            Issue Resolved
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
