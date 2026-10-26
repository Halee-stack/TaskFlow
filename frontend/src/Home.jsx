function Home({ onLoginClick, onGetStarted }) {
    return (
        <div className="home">
            <nav className="home-navbar">
                <h2>TaskFlow</h2>
                <button onClick={onLoginClick}>Login</button>
            </nav>

            <section className="home-hero">
                <h1>Organize Your Tasks. Achieve More.</h1>

                <p>
                    Manage your daily tasks, track your progress,
                    and stay productive with TaskFlow.
                </p>

                <button onClick={onGetStarted}>Get Started</button>
            </section>

            <section className="home-features">
                <h2>Why Choose TaskFlow?</h2>

                <div className="features-grid">
                    <div className="feature-card">
                        <h3>Task Management</h3>
                        <p>Create, edit, and organize your daily tasks.</p>
                    </div>

                    <div className="feature-card">
                        <h3>Track Progress</h3>
                        <p>Monitor completed and pending tasks.</p>
                    </div>

                    <div className="feature-card">
                        <h3>Secure Account</h3>
                        <p>Manage your tasks with secure authentication.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;