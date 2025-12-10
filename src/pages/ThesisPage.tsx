import { useState, useEffect } from 'react'
import '../styles/Thesis.css'

const sections = ['Problem', 'Competitors', 'Gap', 'Product', 'Business']

export default function ThesisPage() {
  const [activeSection, setActiveSection] = useState('Problem')

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s =>
        document.getElementById(s.toLowerCase())
      )
      const scrollPosition = window.scrollY + 200

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i]
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId.toLowerCase())
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="thesis">
      {/* Top Navigation */}
      <nav className="thesis-top-nav">
        <a href="/" className="thesis-logo">
          <svg className="thesis-logo-icon" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2"/>
            <circle cx="16" cy="16" r="5" fill="currentColor"/>
            <path d="M16 4v4M16 24v4M4 16h4M24 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M8 8l3 3M21 21l3 3M8 24l3-3M21 11l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
          </svg>
          Namecast
        </a>
      </nav>

      {/* Section Navigation */}
      <nav className="thesis-nav">
        {sections.map((section) => (
          <button
            key={section}
            className={activeSection === section ? 'active' : ''}
            onClick={() => scrollToSection(section)}
          >
            {section}
          </button>
        ))}
      </nav>

      {/* Hero */}
      <header className="thesis-hero">
        <span className="thesis-label">Investment Thesis</span>
        <h1>AI-Powered Brand Name Intelligence</h1>
        <p className="thesis-subtitle">
          The market for brand naming is fragmented across dozens of tools.
          None combine objective availability checks with LLM-powered perception analysis.
          We're building the unified scorecard.
        </p>
        <p className="thesis-meta">
          December 2024 · Namecast
        </p>
      </header>

      {/* Problem Section */}
      <section className="thesis-section" id="problem">
        <div className="thesis-content">
          <h2>The Problem</h2>

          <p className="problem-lead">
            Naming a brand requires checking multiple disconnected systems,
            and the most important question—"does this name fit our identity?"—has
            no automated answer.
          </p>

          <div className="problem-examples">
            <div className="problem-example">
              <h4>Founders</h4>
              <p>Spend weeks manually checking domains, handles, and trademarks
                 across 10+ different websites before picking a name.</p>
            </div>
            <div className="problem-example">
              <h4>Brand Agencies</h4>
              <p>Charge $50K+ for naming projects but still use spreadsheets
                 to track availability across platforms.</p>
            </div>
            <div className="problem-example">
              <h4>Marketing Teams</h4>
              <p>Launch products with names that don't resonate internationally
                 or have embarrassing meanings in other languages.</p>
            </div>
          </div>

          <p>
            The brand naming process is <strong>fragmented</strong>. Domain registrars
            check domains. Social tools check handles. Trademark attorneys check USPTO.
            Linguists check pronunciation. Nobody checks "what does this name make
            people think of?"
          </p>

          <p>
            <strong>LLMs change this.</strong> For the first time, we can automate the
            subjective parts of brand evaluation: "What kind of company do you think
            'Nexlify' is?" "Does 'Luminary' align with a mission about education?"
            This unlocks the final piece of an automated scorecard.
          </p>
        </div>
      </section>

      {/* Competitors Section */}
      <section className="thesis-section" id="competitors">
        <div className="thesis-content">
          <h2>Competitive Landscape</h2>

          <p>
            The brand naming tool market is fragmented. Each tool does one or two things well,
            but none provide a unified evaluation platform.
          </p>

          <div className="competitive-table-container">
            <table className="competitive-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>BrandSnap</th>
                  <th>Namify</th>
                  <th>Squadhelp</th>
                  <th>KnowEm</th>
                  <th className="highlight-col">Namecast</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Domain Check</td>
                  <td><span className="check-icon">✓</span></td>
                  <td><span className="check-icon">✓</span></td>
                  <td><span className="check-icon">✓</span></td>
                  <td><span className="check-icon">✓</span></td>
                  <td className="highlight-col"><span className="check-icon">✓</span></td>
                </tr>
                <tr>
                  <td>Social Handles</td>
                  <td><span className="check-icon">✓</span></td>
                  <td><span className="partial-icon">~</span></td>
                  <td><span className="partial-icon">~</span></td>
                  <td><span className="check-icon">✓</span></td>
                  <td className="highlight-col"><span className="check-icon">✓</span></td>
                </tr>
                <tr>
                  <td>Trademark Search</td>
                  <td><span className="check-icon">✓</span></td>
                  <td><span className="check-icon">✓</span></td>
                  <td><span className="check-icon">✓</span></td>
                  <td><span className="x-icon">✗</span></td>
                  <td className="highlight-col"><span className="check-icon">✓</span></td>
                </tr>
                <tr>
                  <td>Pronunciation Score</td>
                  <td><span className="x-icon">✗</span></td>
                  <td><span className="x-icon">✗</span></td>
                  <td><span className="x-icon">✗</span></td>
                  <td><span className="x-icon">✗</span></td>
                  <td className="highlight-col"><span className="check-icon">✓</span></td>
                </tr>
                <tr>
                  <td>International Check</td>
                  <td><span className="x-icon">✗</span></td>
                  <td><span className="x-icon">✗</span></td>
                  <td><span className="x-icon">✗</span></td>
                  <td><span className="x-icon">✗</span></td>
                  <td className="highlight-col"><span className="check-icon">✓</span></td>
                </tr>
                <tr>
                  <td>AI Perception Analysis</td>
                  <td><span className="x-icon">✗</span></td>
                  <td><span className="x-icon">✗</span></td>
                  <td><span className="x-icon">✗</span></td>
                  <td><span className="x-icon">✗</span></td>
                  <td className="highlight-col"><span className="check-icon">✓</span></td>
                </tr>
                <tr>
                  <td>Mission Alignment</td>
                  <td><span className="x-icon">✗</span></td>
                  <td><span className="x-icon">✗</span></td>
                  <td><span className="x-icon">✗</span></td>
                  <td><span className="x-icon">✗</span></td>
                  <td className="highlight-col"><span className="check-icon">✓</span></td>
                </tr>
                <tr>
                  <td>Unified Scorecard</td>
                  <td><span className="x-icon">✗</span></td>
                  <td><span className="x-icon">✗</span></td>
                  <td><span className="partial-icon">~</span></td>
                  <td><span className="x-icon">✗</span></td>
                  <td className="highlight-col"><span className="check-icon">✓</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="competitor-notes">
            <div className="competitor-note">
              <h4>BrandSnap.ai</h4>
              <p>Free AI name generator with domain/trademark checks.
                 Strong on availability but no perception analysis or scoring.</p>
            </div>
            <div className="competitor-note">
              <h4>Namify</h4>
              <p>Name generation with domain checks and free logo creation.
                 Focus on quantity over evaluation depth.</p>
            </div>
            <div className="competitor-note">
              <h4>Squadhelp</h4>
              <p>Human-powered naming contests with audience testing.
                 High quality but slow and expensive ($299-999).</p>
            </div>
            <div className="competitor-note">
              <h4>KnowEm</h4>
              <p>Comprehensive social handle checker (500+ platforms).
                 No trademark, pronunciation, or perception analysis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gap Section */}
      <section className="thesis-section" id="gap">
        <div className="thesis-content">
          <h2>The Gap</h2>

          <p>
            Current tools treat brand naming as a <strong>discovery problem</strong>—find
            available names. We treat it as an <strong>evaluation problem</strong>—score
            how good the name actually is.
          </p>

          <div className="gap-grid">
            <div className="gap-card gap-need">
              <h3>What Teams Need</h3>
              <ul>
                <li>Single source of truth for all name evaluation criteria</li>
                <li>Automated answers to "what does this name evoke?"</li>
                <li>Objective scoring to compare candidates</li>
                <li>International and cultural sensitivity checks</li>
                <li>Integration with their existing workflow</li>
              </ul>
            </div>
            <div className="gap-card gap-exists">
              <h3>What Exists Today</h3>
              <ul>
                <li>Fragmented tools requiring 10+ browser tabs</li>
                <li>Manual perception testing via surveys</li>
                <li>Subjective gut feelings from stakeholders</li>
                <li>Expensive linguist consultations</li>
                <li>No API access for programmatic evaluation</li>
              </ul>
            </div>
          </div>

          <div className="gap-conclusion">
            <strong>The gap:</strong> No one has built LLM-powered perception analysis
            into an automated brand evaluation scorecard. This is the missing piece
            that unifies all the fragmented tools.
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section className="thesis-section" id="product">
        <div className="thesis-content">
          <h2>The Product</h2>

          <p>
            Namecast is the brand name oracle. Enter a name,
            receive a comprehensive forecast covering everything from domain availability
            to AI-powered perception prophecy.
          </p>

          <div className="product-features">
            <div className="product-feature">
              <h3>Objective Checks</h3>
              <p>Automated verification across all platforms.</p>
              <ul>
                <li>Domain availability (20+ TLDs)</li>
                <li>Social handles (Twitter, IG, LinkedIn, TikTok)</li>
                <li>Trademark database search (USPTO, EUIPO)</li>
                <li>App store name availability</li>
              </ul>
            </div>

            <div className="product-feature">
              <h3>Linguistic Analysis</h3>
              <p>Phonetic and international evaluation.</p>
              <ul>
                <li>Pronunciation difficulty score</li>
                <li>Spelling complexity rating</li>
                <li>International meaning check (50+ languages)</li>
                <li>Cultural sensitivity analysis</li>
              </ul>
            </div>

            <div className="product-feature">
              <h3>AI Perception</h3>
              <p>LLM-powered brand fit analysis.</p>
              <ul>
                <li>"What does this name evoke?"</li>
                <li>Industry/sector association</li>
                <li>Mission alignment scoring</li>
                <li>Competitive differentiation analysis</li>
              </ul>
            </div>

            <div className="product-feature">
              <h3>Unified Scorecard</h3>
              <p>One score to compare all candidates.</p>
              <ul>
                <li>Weighted composite score (0-100)</li>
                <li>Side-by-side comparison view</li>
                <li>Exportable reports for stakeholders</li>
                <li>API access for programmatic evaluation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Business Model Section */}
      <section className="thesis-section" id="business">
        <div className="thesis-content">
          <h2>Business Model</h2>

          <p>
            Freemium model with API-first architecture. Free tier for individuals,
            paid tiers for agencies and enterprises who need volume and integrations.
          </p>

          <div className="model-stack">
            <div className="stack-layer stack-free">
              <div>
                <h3>Free</h3>
                <p>5 evaluations/month, basic scorecard</p>
              </div>
              <span className="price">$0</span>
            </div>
            <div className="stack-layer stack-api">
              <div>
                <h3>Pro</h3>
                <p>Unlimited evaluations, full AI analysis, API access</p>
              </div>
              <span className="price">$49/mo</span>
            </div>
            <div className="stack-layer stack-enterprise">
              <div>
                <h3>Enterprise</h3>
                <p>Custom integrations, bulk evaluation, dedicated support</p>
              </div>
              <span className="price">Custom</span>
            </div>
          </div>

          <p>
            <strong>Target customers:</strong> Startup founders, brand agencies,
            marketing teams at mid-market companies, domain investors, and
            developers building naming tools.
          </p>

          <p>
            <strong>Go-to-market:</strong> Product-led growth via free tier.
            Content marketing around brand naming best practices.
            Claude Code plugin for developer adoption.
            Partnerships with startup accelerators and domain registrars.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="thesis-cta">
        <h2>Ready to Forecast?</h2>
        <p>Try Namecast free. No signup required for your first prophecy.</p>
        <div className="cta-buttons">
          <a href="/" className="btn-primary">Consult the Oracle</a>
          <a href="mailto:hello@namecast.ai" className="btn-secondary">Get in Touch</a>
        </div>
      </section>
    </div>
  )
}
