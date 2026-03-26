import { Link } from "react-router-dom";
import { Target, Users, Lightbulb, Globe } from 'lucide-react';

export default function About() {
  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: "#f9f7f4", color: "#1a1a2e", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .about-header {
          background: linear-gradient(135deg, #1a472a 0%, #2d6a4f 40%, #40916c 70%, #52b788 100%);
          padding: 40px 60px;
          position: relative;
          overflow: hidden;
        }

        .about-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
          border-radius: 50%;
        }

        .nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 10;
          margin-bottom: 60px;
        }

        .logo {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 900;
          color: white;
          letter-spacing: -1px;
          text-decoration: none;
        }

        .logo span { color: #b7e4c7; }

        .nav-links { display: flex; gap: 32px; align-items: center; }
        .nav-links a {
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          font-size: 15px;
          font-weight: 600;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: white; }

        .btn-primary {
          background: #b7e4c7;
          color: #1a472a;
          border: none;
          padding: 12px 28px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .btn-primary:hover { background: white; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }

        .about-hero {
          text-align: center;
          padding: 40px 60px 80px;
          position: relative;
          z-index: 5;
        }

        .about-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(42px, 5vw, 68px);
          font-weight: 900;
          color: white;
          line-height: 1.1;
          margin-bottom: 24px;
        }

        .about-subtitle {
          font-size: 18px;
          color: rgba(255,255,255,0.85);
          line-height: 1.7;
          max-width: 700px;
          margin: 0 auto;
        }

        .about-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 80px 60px;
        }

        .content-section {
          margin-bottom: 60px;
        }

        .section-heading {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 900;
          color: #1a1a2e;
          margin-bottom: 20px;
        }

        .section-text {
          font-size: 17px;
          color: #555;
          line-height: 1.8;
          margin-bottom: 16px;
        }

        .highlight-box {
          background: #f0faf4;
          border-left: 4px solid #2d6a4f;
          padding: 24px 32px;
          margin: 32px 0;
          border-radius: 8px;
        }

        .highlight-box p {
          font-size: 17px;
          color: #1a472a;
          line-height: 1.7;
          font-weight: 600;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-top: 40px;
        }

        .value-card {
          background: white;
          border: 1px solid #e8e4df;
          border-radius: 16px;
          padding: 32px;
          text-align: center;
        }

        .value-icon {
          width: 56px;
          height: 56px;
          background: rgba(45, 106, 79, 0.12);
          border: 1px solid rgba(45, 106, 79, 0.25);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .value-title {
          font-size: 20px;
          font-weight: 800;
          color: #1a1a2e;
          margin-bottom: 12px;
        }

        .value-desc {
          font-size: 15px;
          color: #666;
          line-height: 1.6;
        }

        footer {
          background: #1a1a2e;
          color: rgba(255,255,255,0.6);
          padding: 40px 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        footer .logo { color: white; }
        footer p { font-size: 14px; }

        @media (max-width: 768px) {
          .nav { flex-direction: column; gap: 20px; }
          .nav-links { display: none; }
          .about-header { padding: 24px; }
          .about-hero { padding: 24px 24px 60px; }
          .about-content { padding: 60px 24px; }
          .values-grid { grid-template-columns: 1fr; }
          footer { padding: 32px 24px; flex-direction: column; text-align: center; }
        }
      `}</style>

      {/* HEADER */}
      <div className="about-header">
        <nav className="nav">
          <Link to="/" className="logo">Shop<span>Nest</span></Link>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
        </nav>

        <div className="about-hero">
          <h1 className="about-title">About ShopNest</h1>
          <p className="about-subtitle">
            Empowering African youth with digital opportunities, one storefront at a time.
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="about-content">
        <div className="content-section">
          <h2 className="section-heading">Our Story</h2>
          <p className="section-text">
            ShopNest was born out of a simple observation: talented, qualified graduates across Africa 
            are struggling to find meaningful employment, not because they lack skills, but because 
            they lack connections and opportunities.
          </p>
          <p className="section-text">
            Founded in Gwagwalada, Abuja, ShopNest is more than just an e-commerce platform. 
            It's a movement to democratize economic opportunity and give every young person 
            a fair shot at building their future.
          </p>
        </div>

        <div className="highlight-box">
          <p>
            "We believe that your potential should never be limited by who you know. 
            Your skills, dedication, and drive should be enough."
          </p>
        </div>

        <div className="content-section">
          <h2 className="section-heading">What We Do</h2>
          <p className="section-text">
            ShopNest is a comprehensive digital platform that connects three key groups:
          </p>
          <p className="section-text">
            <strong>Youth Entrepreneurs & Job Seekers:</strong> We provide tools to start selling online, 
            find gig work, and access digital income opportunities without needing startup capital.
          </p>
          <p className="section-text">
            <strong>Small Business Owners:</strong> We help local vendors and SMEs establish their online 
            presence, reach more customers, and grow their businesses.
          </p>
          <p className="section-text">
            <strong>Buyers & Employers:</strong> We create a trusted marketplace where customers can 
            discover local products and employers can find skilled talent.
          </p>
        </div>

        <div className="content-section">
          <h2 className="section-heading">Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon"><Target size={26} color="#2d6a4f" /></div>
              <div className="value-title">Merit-Based</div>
              <div className="value-desc">
                Opportunities based on skills and effort, not connections.
              </div>
            </div>
            <div className="value-card">
              <div className="value-icon"><Users size={26} color="#2d6a4f" /></div>
              <div className="value-title">Community-Driven</div>
              <div className="value-desc">
                Building local economies from the ground up.
              </div>
            </div>
            <div className="value-card">
              <div className="value-icon"><Lightbulb size={26} color="#2d6a4f" /></div>
              <div className="value-title">Innovation</div>
              <div className="value-desc">
                Using technology to solve real African problems.
              </div>
            </div>
            <div className="value-card">
              <div className="value-icon"><Globe size={26} color="#2d6a4f" /></div>
              <div className="value-title">Pan-African</div>
              <div className="value-desc">
                Starting local, scaling across the continent.
              </div>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-heading">Our Impact</h2>
          <p className="section-text">
            Since our launch, ShopNest has helped over 500 young people find employment or start 
            their own businesses. We've facilitated over ₦2 million in transactions and supported 
            120+ local vendors in establishing their digital presence.
          </p>
          <p className="section-text">
            But we're just getting started. Our goal is to create 10,000 jobs and support 1,000 
            small businesses across Nigeria by 2027, and expand to other African countries by 2028.
          </p>
        </div>

        <div className="highlight-box">
          <p>
            Join us in building a future where every young African has access to economic opportunity.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="logo">Shop<span style={{ color: "#52b788" }}>Nest</span></div>
        <p>© 2026 ShopNest. Built for African Youth. Starting in Gwagwalada, Abuja.</p>
        <p>Creating jobs. Building futures.</p>
      </footer>
    </div>
  );
}
