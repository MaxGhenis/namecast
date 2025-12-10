import { useState } from 'react'
import '../styles/Home.css'

const API_URL = 'http://localhost:8000'

interface EvaluationResult {
  name: string
  overall_score: number
  domain_score: number
  social_score: number
  trademark_score: number
  pronunciation_score: number
  international_score: number
  brand_scope_score?: number
  tagline_score?: number
  domains: Record<string, boolean>
  social: Record<string, boolean>
  trademark: { risk_level: string; matches: unknown[] }
  pronunciation: { score: number; syllables: number; spelling_difficulty: string }
  international: Record<string, { has_issue: boolean; meaning: string | null }>
  perception: { evokes: string; industry_association: string[]; memorability: string; mission_alignment?: number }
  brand_scope?: { narrowness: number; expansion_potential: number; vision_alignment: number; assessment: string }
  taglines?: string[]
}

interface NameCandidate {
  name: string
  source: 'user' | 'generated'
  domains_available: Record<string, boolean>
  passed_domain_filter: boolean
  rejection_reason: string | null
  evaluation: EvaluationResult | null
}

interface WorkflowResult {
  project_description: string
  all_candidates: NameCandidate[]
  viable_count: number
  evaluated_count: number
  recommended: {
    name: string
    source: string
    score: number
    evaluation: EvaluationResult | null
  } | null
}

type Mode = 'evaluate' | 'find'

export default function HomePage() {
  const [mode, setMode] = useState<Mode>('find')
  const [brandName, setBrandName] = useState('')
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Workflow state
  const [projectDescription, setProjectDescription] = useState('')
  const [nameIdeas, setNameIdeas] = useState('')
  const [workflowResult, setWorkflowResult] = useState<WorkflowResult | null>(null)

  const handleEvaluate = async () => {
    if (!brandName.trim()) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: brandName }),
      })

      if (!response.ok) {
        throw new Error('Evaluation failed')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('Could not connect to evaluation API. Make sure the server is running: uvicorn namecast.api:app --reload')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEvaluate()
  }

  const handleWorkflow = async () => {
    if (!projectDescription.trim()) return
    setIsLoading(true)
    setError(null)
    setWorkflowResult(null)

    try {
      const nameIdeasList = nameIdeas
        .split(',')
        .map(n => n.trim())
        .filter(n => n.length > 0)

      const response = await fetch(`${API_URL}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_description: projectDescription,
          name_ideas: nameIdeasList.length > 0 ? nameIdeasList : null,
          generate_count: 10,
          max_to_evaluate: 5,
        }),
      })

      if (!response.ok) {
        throw new Error('Workflow failed')
      }

      const data = await response.json()
      setWorkflowResult(data)
    } catch (err) {
      setError('Could not connect to API. Make sure the server is running: uvicorn namecast.api:app --reload')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate score ring offset (circumference = 2 * PI * 22 ≈ 138.2)
  const scoreOffset = result ? 138.2 - (138.2 * result.overall_score / 100) : 138.2

  // Count available domains and social handles
  const availableDomains = result ? Object.values(result.domains).filter(Boolean).length : 0
  const totalDomains = result ? Object.keys(result.domains).length : 0
  const availableSocial = result ? Object.values(result.social).filter(Boolean).length : 0
  const totalSocial = result ? Object.keys(result.social).length : 0

  // Count international issues
  const intlIssues = result
    ? Object.values(result.international).filter(v => v.has_issue).length
    : 0
  const intlLanguages = result ? Object.keys(result.international).length : 0

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">Brand Name Oracle</div>
          <h1>
            <span className="gradient-text">Forecast Your Name's</span>
            <br />
            <span className="highlight">Future Success</span>
          </h1>
          <p className="hero-subtitle">
            See how people will perceive your brand before you launch.
            Domain availability. Social handles. Trademark risk.
            AI-powered perception forecasting. All in one oracle.
          </p>
          <div className="hero-cta">
            <a href="#demo" className="btn-primary">Try It Free</a>
            <a href="/thesis" className="btn-secondary">Read the Thesis</a>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="demo" id="demo">
        <div className="demo-container">
          <div className="demo-header">
            <h2>{mode === 'find' ? 'Find Your Perfect Name' : 'Evaluate a Brand Name'}</h2>
            <p>{mode === 'find'
              ? 'Describe your project and let AI generate and evaluate names for you'
              : 'Enter any name to see its full evaluation scorecard'}</p>
          </div>

          {/* Mode Toggle */}
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === 'find' ? 'active' : ''}`}
              onClick={() => { setMode('find'); setResult(null); setError(null); }}
            >
              Find Names
            </button>
            <button
              className={`mode-btn ${mode === 'evaluate' ? 'active' : ''}`}
              onClick={() => { setMode('evaluate'); setWorkflowResult(null); setError(null); }}
            >
              Evaluate a Name
            </button>
          </div>

          {mode === 'find' ? (
            /* Workflow Mode */
            <div className="workflow-form">
              <textarea
                value={projectDescription}
                onChange={(e) => {
                  setProjectDescription(e.target.value)
                  setWorkflowResult(null)
                  setError(null)
                }}
                placeholder="Describe your project, company, or product... (e.g., 'A SaaS tool for tracking carbon emissions for small businesses')"
                className="demo-textarea"
                rows={3}
              />
              <input
                type="text"
                value={nameIdeas}
                onChange={(e) => {
                  setNameIdeas(e.target.value)
                  setWorkflowResult(null)
                  setError(null)
                }}
                placeholder="Your name ideas (optional, comma-separated)..."
                className="demo-input"
              />
              <button
                onClick={handleWorkflow}
                className="demo-button full-width"
                disabled={isLoading || !projectDescription.trim()}
              >
                {isLoading ? 'Generating & Evaluating...' : 'Find Names'}
              </button>
            </div>
          ) : (
            /* Single Name Mode */
            <div className="demo-input-group">
              <input
                type="text"
                value={brandName}
                onChange={(e) => {
                  setBrandName(e.target.value)
                  setResult(null)
                  setError(null)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter a brand name..."
                className="demo-input"
              />
              <button
                onClick={handleEvaluate}
                className="demo-button"
                disabled={isLoading || !brandName.trim()}
              >
                {isLoading ? 'Analyzing...' : 'Evaluate'}
              </button>
            </div>
          )}

          {error && (
            <div className="eval-error">
              {error}
            </div>
          )}

          {/* Workflow Results */}
          {workflowResult && (
            <div className="workflow-results">
              {/* Summary */}
              <div className="workflow-summary">
                <span className="summary-stat">
                  <strong>{workflowResult.all_candidates.length}</strong> candidates
                </span>
                <span className="summary-arrow">→</span>
                <span className="summary-stat">
                  <strong>{workflowResult.viable_count}</strong> with domains
                </span>
                <span className="summary-arrow">→</span>
                <span className="summary-stat">
                  <strong>{workflowResult.evaluated_count}</strong> evaluated
                </span>
              </div>

              {/* Recommendation */}
              {workflowResult.recommended && (
                <div className="recommendation-card">
                  <div className="rec-badge">Recommended</div>
                  <div className="rec-name">{workflowResult.recommended.name}</div>
                  <div className="rec-score">
                    Score: <strong>{Math.round(workflowResult.recommended.score)}</strong>/100
                  </div>
                  <div className="rec-source">
                    Source: {workflowResult.recommended.source === 'user' ? 'Your idea' : 'AI generated'}
                  </div>
                </div>
              )}

              {/* Candidates Table */}
              <div className="candidates-table">
                <h4>All Candidates</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Source</th>
                      <th>.com</th>
                      <th>.io</th>
                      <th>Score</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workflowResult.all_candidates
                      .sort((a, b) => {
                        // Sort by: passed filter first, then by score
                        if (a.passed_domain_filter !== b.passed_domain_filter) {
                          return a.passed_domain_filter ? -1 : 1
                        }
                        const scoreA = a.evaluation?.overall_score ?? 0
                        const scoreB = b.evaluation?.overall_score ?? 0
                        return scoreB - scoreA
                      })
                      .map((candidate, i) => (
                        <tr key={i} className={!candidate.passed_domain_filter ? 'filtered-out' : ''}>
                          <td className="candidate-name">
                            {workflowResult.recommended?.name === candidate.name && (
                              <span className="star-badge">★</span>
                            )}
                            {candidate.name}
                          </td>
                          <td>{candidate.source === 'user' ? 'You' : 'AI'}</td>
                          <td className={candidate.domains_available['.com'] ? 'available' : 'unavailable'}>
                            {candidate.domains_available['.com'] ? '✓' : '✗'}
                          </td>
                          <td className={candidate.domains_available['.io'] ? 'available' : 'unavailable'}>
                            {candidate.domains_available['.io'] ? '✓' : '✗'}
                          </td>
                          <td>
                            {candidate.evaluation
                              ? Math.round(candidate.evaluation.overall_score)
                              : '-'}
                          </td>
                          <td>
                            {candidate.evaluation
                              ? 'Evaluated'
                              : candidate.passed_domain_filter
                                ? 'Not evaluated'
                                : 'No domain'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="eval-disclaimer">
                This tool provides general information only and does not constitute legal advice.
                Consult a trademark attorney before finalizing your brand name.
              </div>
            </div>
          )}

          {/* Single Name Results */}
          {result && mode === 'evaluate' && (
            <div className="eval-results">
              <div className="eval-header">
                <span className="eval-name">{result.name}</span>
                <div className="eval-score">
                  <div className="score-ring">
                    <svg viewBox="0 0 48 48">
                      <circle className="score-ring-bg" cx="24" cy="24" r="22" />
                      <circle
                        className={`score-ring-fill ${result.overall_score >= 80 ? 'success' : result.overall_score >= 60 ? 'gold' : ''}`}
                        cx="24"
                        cy="24"
                        r="22"
                        style={{ strokeDashoffset: scoreOffset }}
                      />
                    </svg>
                    <span className="score-value">{Math.round(result.overall_score)}</span>
                  </div>
                </div>
              </div>

              <div className="eval-grid">
                <div className="eval-metric">
                  <svg className="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <div className="metric-label">Domains</div>
                  <div className={`metric-value ${availableDomains === totalDomains ? 'available' : availableDomains > 0 ? 'partial' : 'unavailable'}`}>
                    {availableDomains}/{totalDomains} Available
                  </div>
                </div>

                <div className="eval-metric">
                  <svg className="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  </svg>
                  <div className="metric-label">Social Handles</div>
                  <div className={`metric-value ${availableSocial === totalSocial ? 'available' : availableSocial > 0 ? 'partial' : 'unavailable'}`}>
                    {availableSocial}/{totalSocial} Available
                  </div>
                </div>

                <div className="eval-metric">
                  <svg className="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <div className="metric-label">Similar Names</div>
                  <div className={`metric-value ${result.trademark.matches.length === 0 ? 'available' : result.trademark.matches.length <= 2 ? 'partial' : 'unavailable'}`}>
                    {result.trademark.matches.length} Found
                  </div>
                </div>

                <div className="eval-metric">
                  <svg className="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                  </svg>
                  <div className="metric-label">Pronunciation</div>
                  <div className={`metric-value ${result.pronunciation.score >= 7 ? 'available' : result.pronunciation.score >= 5 ? 'partial' : 'unavailable'}`}>
                    {result.pronunciation.score.toFixed(1)}/10 ({result.pronunciation.syllables} syllables)
                  </div>
                </div>

                <div className="eval-metric">
                  <svg className="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <div className="metric-label">International</div>
                  <div className={`metric-value ${intlIssues === 0 ? 'available' : 'unavailable'}`}>
                    {intlIssues === 0 ? `${intlLanguages} Languages OK` : `${intlIssues} Issues Found`}
                  </div>
                </div>

                <div className="eval-metric">
                  <svg className="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <div className="metric-label">Memorability</div>
                  <div className="metric-value available">
                    {result.perception.memorability.charAt(0).toUpperCase() + result.perception.memorability.slice(1)}
                  </div>
                </div>

                {result.brand_scope && (
                  <div className="eval-metric">
                    <svg className="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <circle cx="12" cy="12" r="8" opacity="0.5" />
                      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
                    </svg>
                    <div className="metric-label">Brand Scope</div>
                    <div className={`metric-value ${result.brand_scope.expansion_potential >= 7 ? 'available' : result.brand_scope.expansion_potential >= 4 ? 'partial' : 'unavailable'}`}>
                      {result.brand_scope.expansion_potential >= 7 ? 'Expansive' : result.brand_scope.expansion_potential >= 4 ? 'Moderate' : 'Narrow'}
                    </div>
                  </div>
                )}
              </div>

              {/* Domain Details */}
              <div className="eval-details">
                <h4>Domain Availability</h4>
                <div className="domain-grid">
                  {Object.entries(result.domains).map(([tld, available]) => (
                    <span key={tld} className={`domain-chip ${available ? 'available' : 'taken'}`}>
                      {result.name.toLowerCase()}{tld}
                    </span>
                  ))}
                </div>
              </div>

              <div className="eval-ai-section">
                <div className="ai-header">
                  <span className="ai-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    AI Analysis
                  </span>
                  <span className="ai-label">Brand Perception Insight</span>
                </div>
                <div className="ai-insight">
                  <strong>Evokes:</strong> {result.perception.evokes}<br />
                  <strong>Industry Association:</strong> {result.perception.industry_association.join(', ')}
                </div>
              </div>

              {result.brand_scope && (
                <div className="eval-ai-section">
                  <div className="ai-header">
                    <span className="ai-badge scope-badge">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <circle cx="12" cy="12" r="8" opacity="0.5" />
                      </svg>
                      Brand Scope
                    </span>
                    <span className="ai-label">Expansion Potential</span>
                  </div>
                  <div className="ai-insight">
                    <strong>Assessment:</strong> {result.brand_scope.assessment}<br />
                    <strong>Expansion Score:</strong> {result.brand_scope.expansion_potential}/10
                    {result.brand_scope.expansion_potential < 5 && (
                      <span className="scope-warning"> ⚠️ This name may limit future growth</span>
                    )}
                  </div>
                </div>
              )}

              {result.taglines && result.taglines.length > 0 && (
                <div className="eval-ai-section">
                  <div className="ai-header">
                    <span className="ai-badge tagline-badge">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Taglines
                    </span>
                    <span className="ai-label">Suggested Taglines</span>
                  </div>
                  <div className="tagline-suggestions">
                    {result.taglines.map((tagline, i) => (
                      <div key={i} className="tagline-item">
                        "{tagline}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="eval-disclaimer">
                This tool provides general information only and does not constitute legal advice.
                Consult a trademark attorney before finalizing your brand name.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>The Complete Name Oracle</h2>
        <p>
          Forecast every dimension of your brand name's future.
          Automated prophecies that would take hours, delivered in seconds.
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h3>Domain & Social Availability</h3>
            <p>
              Check .com, .io, .co and 20+ TLDs. Verify Twitter, Instagram,
              LinkedIn, TikTok handles. Get alternatives if taken.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3>Similar Company Check</h3>
            <p>
              Find existing companies with similar names.
              Research potential naming conflicts before you commit.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
              </svg>
            </div>
            <h3>Pronunciation Score</h3>
            <p>
              Phonetic analysis for ease of spelling and pronunciation.
              Test across different accents and language backgrounds.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h3>International Check</h3>
            <p>
              Detect embarrassing meanings in other languages.
              Cultural sensitivity analysis for global expansion.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3>AI Perception Forecasting</h3>
            <p>
              LLM-powered perception oracles. "What will people think?"
              "Does it align with our mission?" Foresight at scale.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="12" r="8" opacity="0.5" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
              </svg>
            </div>
            <h3>Brand Scope Analysis</h3>
            <p>
              Penalizes names that box you in. "TaxGraph" limits you to tax.
              "Amazon" allows unlimited growth. Know before you commit.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>Tagline Generation</h3>
            <p>
              AI-generated taglines that complement your name. Perfect for
              names that need explanation. "Society, in silico."
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3>Automated Scorecard</h3>
            <p>
              One unified score combining all factors. Compare candidates
              side-by-side. Export reports for stakeholders.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Cast Your Names</h3>
            <p>
              Enter your brand name candidates. Let the oracle receive
              your naming intentions and prepare its vision.
            </p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Receive the Forecast</h3>
            <p>
              Our oracle checks domains, social handles, similar companies, pronunciation,
              and forecasts how people will perceive each name.
            </p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Choose Your Destiny</h3>
            <p>
              Review the unified scorecard, compare candidates side-by-side,
              and choose the name that's destined for success.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>See Your Name's Future</h2>
        <p>
          Stop guessing. Start forecasting. Know your name's destiny before you commit.
        </p>
        <div className="cta-buttons">
          <a href="#demo" className="btn-primary">Consult the Oracle</a>
          <a href="/thesis" className="btn-secondary">Read the Thesis</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-tagline">Open source brand name intelligence</p>
        <div className="footer-links">
          <a href="https://github.com/MaxGhenis/namecast">GitHub</a>
          <span className="footer-sep">·</span>
          <a href="https://pypi.org/project/namecast/">Python Package</a>
          <span className="footer-sep">·</span>
          <a href="https://github.com/MaxGhenis/namecast#claude-code-plugin">Claude Code Plugin</a>
        </div>
      </footer>
    </div>
  )
}
