import { useState, useEffect } from 'react'
import * as s from '../styles/home.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface DomainPricing {
  registration: string
  renewal: string
}

interface EvaluationResult {
  name: string
  overall_score: number
  domain_score: number
  social_score: number
  pronunciation_score: number
  international_score: number
  brand_scope_score?: number
  tagline_score?: number
  similar_companies_score?: number
  domains: Record<string, boolean>
  domain_pricing?: Record<string, DomainPricing>
  social: Record<string, boolean>
  pronunciation: { score: number; syllables: number; spelling_difficulty: string }
  international: Record<string, { has_issue: boolean; meaning: string | null }>
  perception: { evokes: string; industry_association: string[]; memorability: string; mission_alignment?: number }
  brand_scope?: { narrowness: number; expansion_potential: number; vision_alignment: number; assessment: string }
  taglines?: string[]
  similar_companies?: { confusion_risk: string; matches: string[] }
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

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Password state
  const [password, setPassword] = useState(() => {
    try { return localStorage.getItem('namecast_password') || '' } catch { return '' }
  })

  // Workflow state
  const [projectDescription, setProjectDescription] = useState('')
  const [nameIdeas, setNameIdeas] = useState('')
  const [workflowResult, setWorkflowResult] = useState<WorkflowResult | null>(null)
  const [expandedName, setExpandedName] = useState<string | null>(null)

  // Progress state
  const [progressMessage, setProgressMessage] = useState<string>('')
  const [progressCurrent, setProgressCurrent] = useState<number>(0)
  const [progressTotal, setProgressTotal] = useState<number>(0)
  const [candidateNames, setCandidateNames] = useState<string[]>([])

  useEffect(() => {
    try { if (password) localStorage.setItem('namecast_password', password) } catch { /* noop */ }
  }, [password])

  const handleSubmit = async () => {
    if (!projectDescription.trim()) return
    setIsLoading(true)
    setError(null)
    setWorkflowResult(null)
    setProgressMessage('')
    setProgressCurrent(0)
    setProgressTotal(0)
    setCandidateNames([])

    try {
      const nameIdeasList = nameIdeas
        .split(',')
        .map(n => n.trim())
        .filter(n => n.length > 0)

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (password) {
        headers['X-API-Password'] = password
      }

      const response = await fetch(`${API_URL}/workflow/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          project_description: projectDescription,
          name_ideas: nameIdeasList.length > 0 ? nameIdeasList : null,
          generate_count: nameIdeasList.length > 0 ? 5 : 10,
          max_to_evaluate: 5,
        }),
      })

      if (response.status === 401) {
        setError('Invalid password. Contact hello@namecast.ai for beta access.')
        return
      }

      if (!response.ok) {
        throw new Error('Evaluation failed')
      }

      // Read the SSE stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      let buffer = ''

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Process complete events (end with \n\n)
        const events = buffer.split('\n\n')
        buffer = events.pop() || '' // Keep incomplete event in buffer

        for (const event of events) {
          if (!event.startsWith('data: ')) continue

          try {
            const data = JSON.parse(event.slice(6)) // Remove 'data: ' prefix

            switch (data.type) {
              case 'status':
                setProgressMessage(data.message)
                break
              case 'progress':
                setProgressMessage(data.message)
                setProgressCurrent(data.current)
                setProgressTotal(data.total)
                break
              case 'candidates':
                setCandidateNames(data.names)
                break
              case 'evaluation':
                setProgressMessage(`${data.name}: ${data.score}/100`)
                break
              case 'complete':
                setWorkflowResult(data.result)
                break
            }
          } catch (e) {
            console.error('Failed to parse SSE event:', e)
          }
        }
      }
    } catch (err) {
      if (!error) {
        setError('Could not connect to the API. Please try again later or contact hello@namecast.ai for help.')
      }
      console.error(err)
    } finally {
      setIsLoading(false)
      setProgressMessage('')
    }
  }

  return (
    <div className={s.home}>
      {/* Hero Section */}
      <section className={s.hero}>
        <div className={s.heroContent}>
          <div className={s.heroBadge}>Brand Name Oracle</div>
          <h1 className={s.heroH1}>
            <span className={s.gradientText}>Forecast Your Name's</span>
            <br />
            <span className={s.highlight}>Future Success</span>
          </h1>
          <p className={s.heroSubtitle}>
            See how people will perceive your brand before you launch.
            Domain availability. Social handles. Similar companies.
            AI-powered perception forecasting. All in one oracle.
          </p>
          <div className={s.heroCta}>
            <a href="#demo" className={s.btnPrimary}>Try the demo</a>
            <a href="https://github.com/MaxGhenis/namecast" className={s.btnSecondary}>View on GitHub</a>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className={s.demo} id="demo">
        <div className={s.demoContainer}>
          <div className={s.demoHeader}>
            <h2>Find your perfect name</h2>
            <p>Describe your project, add name ideas if you have them, and let AI evaluate everything</p>
          </div>

          <div className={s.workflowForm}>
            <div className={s.passwordGroup}>
              <label className={s.passwordLabel}>Beta password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter access password..."
                className={s.passwordInput}
              />
            </div>
            <p className={s.betaNote}>
              During beta, a password is required. Contact hello@namecast.ai for access.
            </p>
            <textarea
              value={projectDescription}
              onChange={(e) => {
                setProjectDescription(e.target.value)
                setWorkflowResult(null)
                setError(null)
              }}
              placeholder="Describe your project, company, or product... (e.g., 'A SaaS tool for tracking carbon emissions for small businesses')"
              className={s.demoTextarea}
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
              className={s.workflowFormInput}
            />
            <button
              onClick={handleSubmit}
              className={`${s.demoButton} ${s.fullWidth}`}
              disabled={isLoading || !projectDescription.trim()}
            >
              {isLoading ? 'Evaluating...' : 'Evaluate names'}
            </button>
          </div>

          {/* Progress indicator */}
          {isLoading && (
            <div className={s.progressContainer}>
              <div className={s.progressMessage}>{progressMessage || 'Starting...'}</div>
              {progressTotal > 0 && (
                <div className={s.progressBarContainer}>
                  <div
                    className={s.progressBar}
                    style={{ width: `${(progressCurrent / progressTotal) * 100}%` }}
                  />
                </div>
              )}
              {candidateNames.length > 0 && (
                <div className={s.candidatePreview}>
                  <span className={s.previewLabel}>Candidates:</span>
                  {candidateNames.slice(0, 6).map((name, i) => (
                    <span key={i} className={s.previewName}>{name}</span>
                  ))}
                  {candidateNames.length > 6 && (
                    <span className={s.previewMore}>+{candidateNames.length - 6} more</span>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className={s.evalError}>
              {error}
            </div>
          )}

          {/* Workflow Results */}
          {workflowResult && (
            <div className={s.workflowResults}>
              {/* Summary */}
              <div className={s.workflowSummary}>
                <span className={s.summaryStat}>
                  <strong>{workflowResult.all_candidates.length}</strong> candidates
                </span>
                <span className={s.summaryArrow}>&rarr;</span>
                <span className={s.summaryStat}>
                  <strong>{workflowResult.viable_count}</strong> with domains
                </span>
                <span className={s.summaryArrow}>&rarr;</span>
                <span className={s.summaryStat}>
                  <strong>{workflowResult.evaluated_count}</strong> evaluated
                </span>
              </div>

              {/* Recommendation */}
              {workflowResult.recommended && (
                <div className={s.recommendationCard}>
                  <div className={s.recBadge}>Recommended</div>
                  <div className={s.recName}>{workflowResult.recommended.name}</div>
                  <div className={s.recScore}>
                    Score: <strong>{Math.round(workflowResult.recommended.score)}</strong>/100
                  </div>
                  <div className={s.recSource}>
                    Source: {workflowResult.recommended.source === 'user' ? 'Your idea' : 'AI generated'}
                  </div>
                </div>
              )}

              {/* Candidates Table */}
              <div className={s.candidatesTable}>
                <h4>All candidates</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Source</th>
                      <th>.com</th>
                      <th>.ai</th>
                      <th>.io</th>
                      <th>Score</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workflowResult.all_candidates
                      .sort((a, b) => {
                        if (a.passed_domain_filter !== b.passed_domain_filter) {
                          return a.passed_domain_filter ? -1 : 1
                        }
                        const scoreA = a.evaluation?.overall_score ?? 0
                        const scoreB = b.evaluation?.overall_score ?? 0
                        return scoreB - scoreA
                      })
                      .map((candidate, i) => {
                        const pricing = candidate.evaluation?.domain_pricing
                        const isExpanded = expandedName === candidate.name
                        const eval_ = candidate.evaluation
                        const rowClasses = [
                          !candidate.passed_domain_filter ? s.filteredOut : '',
                          eval_ ? s.clickable : '',
                          isExpanded ? s.expanded : '',
                        ].filter(Boolean).join(' ')

                        return (
                          <>
                          <tr
                            key={i}
                            className={rowClasses}
                            onClick={() => eval_ && setExpandedName(isExpanded ? null : candidate.name)}
                          >
                            <td className={s.candidateName}>
                              {workflowResult.recommended?.name === candidate.name && (
                                <span className={s.starBadge}>&#9733;</span>
                              )}
                              {candidate.name}
                              {eval_ && <span className={s.expandIcon}>{isExpanded ? '\u25BC' : '\u25B6'}</span>}
                            </td>
                            <td>{candidate.source === 'user' ? 'You' : 'AI'}</td>
                            <td className={candidate.domains_available['.com'] ? s.available : s.unavailable}>
                              {candidate.domains_available['.com'] ? (
                                <a
                                  href={`https://porkbun.com/checkout/search?q=${candidate.name}.com`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={s.domainLink}
                                  title={pricing?.com ? `$${pricing.com.registration}/yr` : 'Buy domain'}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  &#10003; {pricing?.com && <span className={s.price}>${pricing.com.registration}</span>}
                                </a>
                              ) : '\u2717'}
                            </td>
                            <td className={candidate.domains_available['.ai'] ? s.available : s.unavailable}>
                              {candidate.domains_available['.ai'] ? (
                                <a
                                  href={`https://porkbun.com/checkout/search?q=${candidate.name}.ai`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={s.domainLink}
                                  title={pricing?.ai ? `$${pricing.ai.registration}/yr` : 'Buy domain'}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  &#10003; {pricing?.ai && <span className={s.price}>${pricing.ai.registration}</span>}
                                </a>
                              ) : '\u2717'}
                            </td>
                            <td className={candidate.domains_available['.io'] ? s.available : s.unavailable}>
                              {candidate.domains_available['.io'] ? (
                                <a
                                  href={`https://porkbun.com/checkout/search?q=${candidate.name}.io`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={s.domainLink}
                                  title={pricing?.io ? `$${pricing.io.registration}/yr` : 'Buy domain'}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  &#10003; {pricing?.io && <span className={s.price}>${pricing.io.registration}</span>}
                                </a>
                              ) : '\u2717'}
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
                          {isExpanded && eval_ && (
                            <tr key={`${i}-details`} className={s.detailsRow}>
                              <td colSpan={7}>
                                <div className={s.nameDetails}>
                                  {/* Score Breakdown */}
                                  <div className={s.detailSection}>
                                    <h5>Score breakdown</h5>
                                    <div className={s.scoreGrid}>
                                      <div className={s.scoreItem}>
                                        <span className={s.scoreLabel}>Domain</span>
                                        <span className={s.scoreValue}>{Math.round(eval_.domain_score)}</span>
                                      </div>
                                      <div className={s.scoreItem}>
                                        <span className={s.scoreLabel}>Social</span>
                                        <span className={s.scoreValue}>{Math.round(eval_.social_score)}</span>
                                      </div>
                                      <div className={s.scoreItem}>
                                        <span className={s.scoreLabel}>Pronunciation</span>
                                        <span className={s.scoreValue}>{Math.round(eval_.pronunciation_score)}</span>
                                      </div>
                                      <div className={s.scoreItem}>
                                        <span className={s.scoreLabel}>International</span>
                                        <span className={s.scoreValue}>{eval_.international_score}</span>
                                      </div>
                                      {eval_.brand_scope_score !== undefined && (
                                        <div className={s.scoreItem}>
                                          <span className={s.scoreLabel}>Brand Scope</span>
                                          <span className={s.scoreValue}>{Math.round(eval_.brand_scope_score)}</span>
                                        </div>
                                      )}
                                      {eval_.similar_companies_score !== undefined && (
                                        <div className={s.scoreItem}>
                                          <span className={s.scoreLabel}>Uniqueness</span>
                                          <span className={s.scoreValue}>{Math.round(eval_.similar_companies_score)}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Pronunciation */}
                                  <div className={s.detailSection}>
                                    <h5>Pronunciation</h5>
                                    <div className={s.detailContent}>
                                      <p><strong>Syllables:</strong> {eval_.pronunciation.syllables}</p>
                                      <p><strong>Spelling Difficulty:</strong> {eval_.pronunciation.spelling_difficulty}</p>
                                      <p><strong>Phonetic Score:</strong> {eval_.pronunciation.score}/10</p>
                                    </div>
                                  </div>

                                  {/* Perception */}
                                  <div className={s.detailSection}>
                                    <h5>Perception</h5>
                                    <div className={s.detailContent}>
                                      <p><strong>Evokes:</strong> {eval_.perception.evokes}</p>
                                      <p><strong>Industry Association:</strong> {eval_.perception.industry_association.join(', ')}</p>
                                      <p><strong>Memorability:</strong> {eval_.perception.memorability}</p>
                                    </div>
                                  </div>

                                  {/* Similar Companies */}
                                  {eval_.similar_companies_score !== undefined && (
                                    <div className={s.detailSection}>
                                      <h5>Similar companies</h5>
                                      <div className={s.detailContent}>
                                        <p><strong>Confusion Risk:</strong> {eval_.similar_companies?.confusion_risk || 'Unknown'}</p>
                                        {eval_.similar_companies?.matches && eval_.similar_companies.matches.length > 0 && (
                                          <p><strong>Matches:</strong> {eval_.similar_companies.matches.join(', ')}</p>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* International */}
                                  <div className={s.detailSection}>
                                    <h5>International safety</h5>
                                    <div className={`${s.detailContent} ${s.internationalGrid}`}>
                                      {Object.entries(eval_.international).map(([lang, data]) => (
                                        <span key={lang} className={`${s.langBadge} ${data.has_issue ? s.langIssue : s.langSafe}`}>
                                          {lang}: {data.has_issue ? `\u26A0 ${data.meaning}` : '\u2713'}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Brand Scope */}
                                  {eval_.brand_scope && (
                                    <div className={s.detailSection}>
                                      <h5>Brand scope</h5>
                                      <div className={s.detailContent}>
                                        <p><strong>Narrowness:</strong> {eval_.brand_scope.narrowness}/10 (lower = more flexible)</p>
                                        <p><strong>Expansion Potential:</strong> {eval_.brand_scope.expansion_potential}/10</p>
                                        <p><strong>Vision Alignment:</strong> {eval_.brand_scope.vision_alignment}/10</p>
                                        <p className={s.assessment}>{eval_.brand_scope.assessment}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Taglines */}
                                  {eval_.taglines && eval_.taglines.length > 0 && (
                                    <div className={s.detailSection}>
                                      <h5>Suggested taglines</h5>
                                      <div className={`${s.detailContent} ${s.taglines}`}>
                                        {eval_.taglines.map((tl, idx) => (
                                          <p key={idx} className={s.tagline}>"{tl}"</p>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Social Handles */}
                                  <div className={s.detailSection}>
                                    <h5>Social handles</h5>
                                    <div className={`${s.detailContent} ${s.socialGrid}`}>
                                      {Object.entries(eval_.social).map(([platform, avail]) => (
                                        <span key={platform} className={`${s.socialBadge} ${avail ? s.socialAvailable : s.socialTaken}`}>
                                          {platform}: {avail ? '\u2713 Available' : '\u2717 Taken'}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                          </>
                        )
                      })}
                  </tbody>
                </table>
              </div>

              <div className={s.evalDisclaimer}>
                This tool provides general information only. Verify domain availability
                and conduct your own due diligence before finalizing your brand name.
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Features Section */}
      <section className={s.features}>
        <h2>The complete name oracle</h2>
        <p>
          Forecast every dimension of your brand name's future.
          Automated prophecies that would take hours, delivered in seconds.
        </p>
        <div className={s.featuresGrid}>
          <div className={s.featureCard}>
            <div className={s.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h3>Domain & social availability</h3>
            <p>
              Check .com, .io, .co and 20+ TLDs. Verify Twitter, Instagram,
              LinkedIn, TikTok handles. Get alternatives if taken.
            </p>
          </div>

          <div className={s.featureCard}>
            <div className={s.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3>Similar company check</h3>
            <p>
              Find existing companies with similar names.
              Research potential naming conflicts before you commit.
            </p>
          </div>

          <div className={s.featureCard}>
            <div className={s.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
              </svg>
            </div>
            <h3>Pronunciation score</h3>
            <p>
              Phonetic analysis for ease of spelling and pronunciation.
              Test across different accents and language backgrounds.
            </p>
          </div>

          <div className={s.featureCard}>
            <div className={s.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h3>International check</h3>
            <p>
              Detect embarrassing meanings in other languages.
              Cultural sensitivity analysis for global expansion.
            </p>
          </div>

          <div className={s.featureCard}>
            <div className={s.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3>AI perception forecasting</h3>
            <p>
              LLM-powered perception oracles. "What will people think?"
              "Does it align with our mission?" Foresight at scale.
            </p>
          </div>

          <div className={s.featureCard}>
            <div className={s.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="12" r="8" opacity="0.5" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
              </svg>
            </div>
            <h3>Brand scope analysis</h3>
            <p>
              Penalizes names that box you in. "TaxGraph" limits you to tax.
              "Amazon" allows unlimited growth. Know before you commit.
            </p>
          </div>

          <div className={s.featureCard}>
            <div className={s.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>Tagline generation</h3>
            <p>
              AI-generated taglines that complement your name. Perfect for
              names that need explanation.
            </p>
          </div>

          <div className={s.featureCard}>
            <div className={s.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3>Automated scorecard</h3>
            <p>
              One unified score combining all factors. Compare candidates
              side-by-side. Export reports for stakeholders.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={s.howItWorks}>
        <h2>How it works</h2>
        <div className={s.steps}>
          <div className={s.step}>
            <div className={s.stepNumber}>1</div>
            <h3>Cast your names</h3>
            <p>
              Enter your brand name candidates. Let the oracle receive
              your naming intentions and prepare its vision.
            </p>
          </div>
          <div className={s.step}>
            <div className={s.stepNumber}>2</div>
            <h3>Receive the forecast</h3>
            <p>
              Our oracle checks domains, social handles, similar companies, pronunciation,
              and forecasts how people will perceive each name.
            </p>
          </div>
          <div className={s.step}>
            <div className={s.stepNumber}>3</div>
            <h3>Choose your destiny</h3>
            <p>
              Review the unified scorecard, compare candidates side-by-side,
              and choose the name that's destined for success.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={s.cta}>
        <h2>See your name's future</h2>
        <p>
          Stop guessing. Start forecasting. Know your name's destiny before you commit.
        </p>
        <div className={s.ctaButtons}>
          <a href="#demo" className={s.btnPrimary}>Consult the oracle</a>
        </div>
      </section>

      {/* Footer */}
      <footer className={s.footer}>
        <p className={s.footerTagline}>Open source brand name intelligence</p>
        <div className={s.footerLinks}>
          <a href="https://github.com/MaxGhenis/namecast">GitHub</a>
          <span className={s.footerSep}>&middot;</span>
          <a href="https://pypi.org/project/namecast/">Python Package</a>
          <span className={s.footerSep}>&middot;</span>
          <a href="https://github.com/MaxGhenis/namecast#claude-code-plugin">Claude Code Plugin</a>
        </div>
      </footer>
    </div>
  )
}
