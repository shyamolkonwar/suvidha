import "./ServiceCards.css";

export default function ServiceCards() {
    return (
        <section className="services" id="services">
            <div className="container">
                {/* Header */}
                <div className="services-header">
                    <h2 className="section-title">Everything Your City Needs</h2>
                    <p className="section-subtitle">
                        From electricity to water, manage every utility in one beautiful
                        dashboard.
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="bento-grid">
                    {/* Electricity — Large Card */}
                    <div className="bento-card large">
                        <div className="bento-content">
                            <div className="bento-icon">
                                {/* Duotone bolt icon */}
                                <svg viewBox="0 0 28 28" fill="none">
                                    <path
                                        d="M15 2L6 16H14L13 26L22 12H14L15 2Z"
                                        fill="#D1FAE5"
                                        stroke="#064E3B"
                                        strokeWidth="1.5"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M15 2L14 12H22L13 26"
                                        fill="#10B981"
                                        fillOpacity="0.4"
                                    />
                                </svg>
                            </div>
                            <h3 className="bento-title">Electricity</h3>
                            <p className="bento-desc">
                                View live consumption graph, pay bills instantly, and get
                                outage alerts in real time. Smart metering at your fingertips.
                            </p>
                        </div>
                        {/* Fake graph */}
                        <div className="bento-graph">
                            <div className="graph-bar" style={{ height: "60%" }} data-label="Jan" />
                            <div className="graph-bar" style={{ height: "85%" }} data-label="Feb" />
                            <div className="graph-bar" style={{ height: "45%" }} data-label="Mar" />
                            <div className="graph-bar" style={{ height: "70%" }} data-label="Apr" />
                            <div className="graph-bar" style={{ height: "95%" }} data-label="May" />
                            <div className="graph-bar" style={{ height: "55%" }} data-label="Jun" />
                        </div>
                    </div>

                    {/* Water — Medium Card */}
                    <div className="bento-card">
                        <div className="bento-icon">
                            {/* Duotone drop icon */}
                            <svg viewBox="0 0 28 28" fill="none">
                                <path
                                    d="M14 3C14 3 6 13 6 18C6 22.4 9.6 26 14 26C18.4 26 22 22.4 22 18C22 13 14 3 14 3Z"
                                    fill="#D1FAE5"
                                    stroke="#064E3B"
                                    strokeWidth="1.5"
                                />
                                <path
                                    d="M14 3C14 3 9 13 9 18C9 21 11.2 23.5 14 24"
                                    fill="#10B981"
                                    fillOpacity="0.35"
                                />
                                <circle cx="11" cy="19" r="1.5" fill="#10B981" opacity="0.6" />
                            </svg>
                        </div>
                        <h3 className="bento-title">Water</h3>
                        <p className="bento-desc">
                            Track water usage, report leaks, and manage your supply with
                            a single tap. Conservation made easy.
                        </p>
                    </div>

                    {/* Municipal — Medium Card */}
                    <div className="bento-card">
                        <div className="bento-icon">
                            {/* Duotone building icon */}
                            <svg viewBox="0 0 28 28" fill="none">
                                <rect x="4" y="10" width="20" height="16" rx="2" fill="#D1FAE5" stroke="#064E3B" strokeWidth="1.5" />
                                <rect x="10" y="4" width="8" height="8" rx="1" fill="#10B981" fillOpacity="0.5" stroke="#064E3B" strokeWidth="1.5" />
                                <rect x="8" y="16" width="4" height="4" rx="0.5" fill="#10B981" />
                                <rect x="16" y="16" width="4" height="4" rx="0.5" fill="#10B981" />
                                <rect x="12" y="20" width="4" height="6" fill="#064E3B" rx="0.5" />
                            </svg>
                        </div>
                        <h3 className="bento-title">Municipal</h3>
                        <p className="bento-desc">
                            Property tax, grievances, and certificates — all your civic
                            needs in one streamlined interface.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
