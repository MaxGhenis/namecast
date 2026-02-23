"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface DomainPricing {
  registration: string;
  renewal: string;
}

interface EvaluationResult {
  name: string;
  overall_score: number;
  domain_score: number;
  social_score: number;
  pronunciation_score: number;
  international_score: number;
  brand_scope_score?: number;
  tagline_score?: number;
  similar_companies_score?: number;
  domains: Record<string, boolean>;
  domain_pricing?: Record<string, DomainPricing>;
  social: Record<string, boolean>;
  pronunciation: {
    score: number;
    syllables: number;
    spelling_difficulty: string;
  };
  international: Record<
    string,
    { has_issue: boolean; meaning: string | null }
  >;
  perception: {
    evokes: string;
    industry_association: string[];
    memorability: string;
    mission_alignment?: number;
  };
  brand_scope?: {
    narrowness: number;
    expansion_potential: number;
    vision_alignment: number;
    assessment: string;
  };
  taglines?: string[];
  similar_companies?: { confusion_risk: string; matches: string[] };
}

interface NameCandidate {
  name: string;
  source: "user" | "generated";
  domains_available: Record<string, boolean>;
  passed_domain_filter: boolean;
  rejection_reason: string | null;
  evaluation: EvaluationResult | null;
}

interface WorkflowResult {
  project_description: string;
  all_candidates: NameCandidate[];
  viable_count: number;
  evaluated_count: number;
  recommended: {
    name: string;
    source: string;
    score: number;
    evaluation: EvaluationResult | null;
  } | null;
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [password, setPassword] = useState(() => {
    try {
      return localStorage.getItem("namecast_password") || "";
    } catch {
      return "";
    }
  });

  const [projectDescription, setProjectDescription] = useState("");
  const [nameIdeas, setNameIdeas] = useState("");
  const [workflowResult, setWorkflowResult] =
    useState<WorkflowResult | null>(null);
  const [expandedName, setExpandedName] = useState<string | null>(null);

  const [progressMessage, setProgressMessage] = useState<string>("");
  const [progressCurrent, setProgressCurrent] = useState<number>(0);
  const [progressTotal, setProgressTotal] = useState<number>(0);
  const [candidateNames, setCandidateNames] = useState<string[]>([]);

  useEffect(() => {
    try {
      if (password) localStorage.setItem("namecast_password", password);
    } catch {
      /* noop */
    }
  }, [password]);

  const handleSubmit = async () => {
    if (!projectDescription.trim()) return;
    setIsLoading(true);
    setError(null);
    setWorkflowResult(null);
    setProgressMessage("");
    setProgressCurrent(0);
    setProgressTotal(0);
    setCandidateNames([]);

    try {
      const nameIdeasList = nameIdeas
        .split(",")
        .map((n) => n.trim())
        .filter((n) => n.length > 0);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (password) {
        headers["X-API-Password"] = password;
      }

      const response = await fetch(`${API_URL}/workflow/stream`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          project_description: projectDescription,
          name_ideas: nameIdeasList.length > 0 ? nameIdeasList : null,
          generate_count: nameIdeasList.length > 0 ? 5 : 10,
          max_to_evaluate: 5,
        }),
      });

      if (response.status === 401) {
        setError(
          "Invalid password. Contact hello@namecast.ai for beta access."
        );
        return;
      }

      if (!response.ok) {
        throw new Error("Evaluation failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const event of events) {
          if (!event.startsWith("data: ")) continue;

          try {
            const data = JSON.parse(event.slice(6));

            switch (data.type) {
              case "status":
                setProgressMessage(data.message);
                break;
              case "progress":
                setProgressMessage(data.message);
                setProgressCurrent(data.current);
                setProgressTotal(data.total);
                break;
              case "candidates":
                setCandidateNames(data.names);
                break;
              case "evaluation":
                setProgressMessage(`${data.name}: ${data.score}/100`);
                break;
              case "complete":
                setWorkflowResult(data.result);
                break;
            }
          } catch (e) {
            console.error("Failed to parse SSE event:", e);
          }
        }
      }
    } catch (err) {
      if (!error) {
        setError(
          "Could not connect to the API. Please try again later or contact hello@namecast.ai for help."
        );
      }
      console.error(err);
    } finally {
      setIsLoading(false);
      setProgressMessage("");
    }
  };

  return (
    <div
      className="font-[family-name:var(--font-satoshi)] leading-[1.7] relative overflow-x-hidden"
      style={{ background: "var(--color-bg)", color: "var(--color-text-primary)" }}
    >
      {/* Grid background effect */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{
          background: `
            linear-gradient(var(--color-border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
        }}
      />

      {/* Navigation */}
      <nav
        className="fixed top-[var(--spacing-md)] left-1/2 -translate-x-1/2 z-100 backdrop-blur-[20px] rounded-[var(--radius-2xl)] max-sm:top-[var(--spacing-sm)] max-sm:left-[var(--spacing-sm)] max-sm:right-[var(--spacing-sm)] max-sm:translate-x-0"
        style={{
          background: "rgba(6, 6, 12, 0.8)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.03), 0 20px 50px -10px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div className="py-[var(--spacing-sm)] px-[var(--spacing-lg)] flex justify-between items-center gap-[var(--spacing-3xl)] max-sm:px-[var(--spacing-md)] max-sm:gap-[var(--spacing-md)]">
          <a
            href="/"
            className="flex items-center gap-[var(--spacing-sm)] font-[family-name:var(--font-display)] text-[1.125rem] font-semibold no-underline tracking-[-0.02em] transition-opacity duration-[var(--duration-fast)] hover:opacity-80"
            style={{ color: "var(--color-text-primary)" }}
          >
            <svg className="w-[26px] h-[26px]" viewBox="0 0 32 32" fill="none" style={{ color: "var(--color-accent)" }}>
              <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" />
              <circle cx="16" cy="16" r="5" fill="currentColor" />
              <path d="M16 4v4M16 24v4M4 16h4M24 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M8 8l3 3M21 21l3 3M8 24l3-3M21 11l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            </svg>
            Namecast
          </a>
          <div className="flex gap-[var(--spacing-xl)] max-sm:gap-[var(--spacing-md)]">
            <a
              href="https://github.com/MaxGhenis/namecast"
              className="font-[family-name:var(--font-display)] text-[0.875rem] font-medium no-underline relative transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-text-primary)] max-sm:text-[0.8rem]"
              style={{ color: "var(--color-text-muted)" }}
            >
              GitHub
            </a>
            <a
              href="mailto:hello@namecast.ai"
              className="font-[family-name:var(--font-display)] text-[0.875rem] font-medium no-underline relative transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-text-primary)] max-sm:text-[0.8rem]"
              style={{ color: "var(--color-text-muted)" }}
            >
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center pt-[120px] relative py-[var(--spacing-4xl)] px-[var(--spacing-lg)] max-w-[1200px] mx-auto max-md:min-h-[90vh] max-md:pt-[100px] max-md:py-[var(--spacing-3xl)] max-md:px-[var(--spacing-md)]">
        {/* Cosmic glow */}
        <div
          className="absolute w-[900px] h-[900px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none max-md:w-[500px] max-md:h-[500px]"
          style={{
            background: `
              radial-gradient(ellipse at 30% 30%, rgba(6, 182, 212, 0.25) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 60%, rgba(245, 158, 11, 0.15) 0%, transparent 40%),
              radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)`,
            animation: "cosmic-pulse 12s ease-in-out infinite",
            filter: "blur(60px)",
          }}
        />
        {/* Star particles */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(2px 2px at 20% 30%, rgba(6, 182, 212, 0.5) 0%, transparent 100%),
              radial-gradient(2px 2px at 40% 70%, rgba(245, 158, 11, 0.4) 0%, transparent 100%),
              radial-gradient(1px 1px at 60% 20%, rgba(99, 102, 241, 0.5) 0%, transparent 100%),
              radial-gradient(2px 2px at 80% 50%, rgba(6, 182, 212, 0.4) 0%, transparent 100%),
              radial-gradient(1px 1px at 10% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 100%),
              radial-gradient(2px 2px at 90% 90%, rgba(6, 182, 212, 0.4) 0%, transparent 100%)`,
            animation: "drift 20s linear infinite",
          }}
        />

        <div className="max-w-[900px] relative z-2">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-[var(--spacing-sm)] py-[var(--spacing-sm)] px-[var(--spacing-md)] rounded-[var(--radius-2xl)] font-[family-name:var(--font-satoshi)] text-[0.8rem] font-medium tracking-[0.05em] uppercase mb-[var(--spacing-xl)]"
            style={{
              background: "rgba(6, 182, 212, 0.1)",
              border: "1px solid rgba(6, 182, 212, 0.3)",
              color: "var(--color-accent)",
              animation: "fade-in-up 0.8s var(--ease-out) both",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: "var(--color-accent)",
                animation: "pulse-dot 2s ease-in-out infinite",
              }}
            />
            Brand Name Oracle
          </div>

          {/* Heading */}
          <h1
            className="font-[family-name:var(--font-clash)] text-[clamp(3.5rem,10vw,7rem)] font-semibold leading-[0.95] tracking-[-0.04em] mb-[var(--spacing-xl)]"
            style={{ animation: "fade-in-up 0.8s var(--ease-out) 0.1s both" }}
          >
            <span
              className="bg-clip-text"
              style={{
                background: "linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-text-primary) 30%, var(--color-accent) 60%, var(--color-gold) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Forecast Your Name&apos;s
            </span>
            <br />
            <span className="relative inline-block">
              Future Success
              <span
                className="absolute bottom-[0.1em] left-0 right-0 h-[0.15em] opacity-60 -skew-x-12"
                style={{ background: "linear-gradient(90deg, var(--color-accent), var(--color-gold))" }}
              />
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="font-[family-name:var(--font-satoshi)] text-[1.35rem] font-normal max-w-[600px] mx-auto leading-[1.7] mb-[var(--spacing-2xl)]"
            style={{
              color: "var(--color-text-secondary)",
              animation: "fade-in-up 0.8s var(--ease-out) 0.2s both",
            }}
          >
            See how people will perceive your brand before you launch. Domain
            availability. Social handles. Similar companies. AI-powered
            perception forecasting. All in one oracle.
          </p>

          {/* CTA buttons */}
          <div
            className="flex gap-[var(--spacing-md)] justify-center flex-wrap max-[480px]:flex-col max-[480px]:w-full max-[480px]:px-[var(--spacing-md)]"
            style={{ animation: "fade-in-up 0.8s var(--ease-out) 0.3s both" }}
          >
            <a
              href="#demo"
              className="font-[family-name:var(--font-satoshi)] py-[var(--spacing-md)] px-[var(--spacing-xl)] text-[0.95rem] font-semibold rounded-[var(--radius-xl)] no-underline cursor-pointer relative overflow-hidden text-white transition-all duration-[var(--duration-normal)] hover:-translate-y-0.5 max-[480px]:w-full max-[480px]:text-center"
              style={{
                background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dim) 100%)",
                boxShadow: "0 0 0 1px rgba(6, 182, 212, 0.5), 0 4px 24px -4px rgba(6, 182, 212, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
              }}
            >
              Try the demo
            </a>
            <a
              href="https://github.com/MaxGhenis/namecast"
              className="font-[family-name:var(--font-satoshi)] py-[var(--spacing-md)] px-[var(--spacing-xl)] text-[0.95rem] font-semibold rounded-[var(--radius-xl)] no-underline cursor-pointer transition-all duration-[var(--duration-normal)] hover:-translate-y-0.5 max-[480px]:w-full max-[480px]:text-center"
              style={{
                background: "transparent",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
              }}
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section
        id="demo"
        className="relative overflow-hidden py-[var(--spacing-4xl)] px-[var(--spacing-lg)] max-md:py-[var(--spacing-3xl)] max-md:px-[var(--spacing-md)]"
        style={{
          background: "var(--color-bg-elevated)",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {/* Top glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center top, var(--color-accent-glow) 0%, transparent 70%)" }}
        />

        <div className="max-w-[800px] mx-auto relative z-1">
          {/* Demo header */}
          <div className="text-center mb-[var(--spacing-2xl)]">
            <h2
              className="font-[family-name:var(--font-clash)] text-[clamp(1.5rem,4vw,2rem)] font-semibold mb-[var(--spacing-sm)] tracking-[-0.02em]"
            >
              Find your perfect name
            </h2>
            <p style={{ color: "var(--color-text-muted)" }} className="text-base">
              Describe your project, add name ideas if you have them, and let AI evaluate everything
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-[var(--spacing-md)] mb-[var(--spacing-xl)]">
            {/* Password group */}
            <div
              className="flex gap-[var(--spacing-sm)] items-center py-[var(--spacing-sm)] px-[var(--spacing-md)] rounded-[var(--radius-lg)] text-[0.85rem]"
              style={{
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
              }}
            >
              <label
                className="font-[family-name:var(--font-satoshi)] text-[0.8rem] font-medium whitespace-nowrap uppercase tracking-[0.05em]"
                style={{ color: "var(--color-gold)" }}
              >
                Beta password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter access password..."
                className="flex-1 py-[var(--spacing-sm)] px-[var(--spacing-md)] font-[family-name:var(--font-satoshi)] text-[0.9rem] rounded-[var(--radius-md)] outline-none transition-all duration-[var(--duration-fast)] focus:shadow-[0_0_0_3px_var(--color-accent-glow)]"
                style={{
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                }}
              />
            </div>
            <p
              className="text-[0.8rem] text-center mt-[var(--spacing-sm)] italic"
              style={{ color: "var(--color-text-muted)" }}
            >
              During beta, a password is required. Contact hello@namecast.ai for
              access.
            </p>

            <textarea
              value={projectDescription}
              onChange={(e) => {
                setProjectDescription(e.target.value);
                setWorkflowResult(null);
                setError(null);
              }}
              placeholder="Describe your project, company, or product... (e.g., 'A SaaS tool for tracking carbon emissions for small businesses')"
              className="w-full py-[var(--spacing-md)] px-[var(--spacing-lg)] font-[family-name:var(--font-satoshi)] text-base rounded-[var(--radius-lg)] resize-y min-h-[80px] outline-none transition-all duration-[var(--duration-fast)] focus:shadow-[0_0_0_3px_var(--color-accent-glow)]"
              style={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
              }}
              rows={3}
            />

            <input
              type="text"
              value={nameIdeas}
              onChange={(e) => {
                setNameIdeas(e.target.value);
                setWorkflowResult(null);
                setError(null);
              }}
              placeholder="Your name ideas (optional, comma-separated)..."
              className="py-[var(--spacing-md)] px-[var(--spacing-lg)] font-[family-name:var(--font-satoshi)] text-[1.1rem] rounded-[var(--radius-lg)] outline-none transition-all duration-[var(--duration-fast)] focus:shadow-[0_0_0_3px_var(--color-accent-glow)]"
              style={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            />

            <button
              onClick={handleSubmit}
              className="w-full py-[var(--spacing-md)] px-[var(--spacing-xl)] font-[family-name:var(--font-satoshi)] text-[0.95rem] font-semibold text-white border-none rounded-[var(--radius-lg)] cursor-pointer transition-all duration-[var(--duration-fast)] whitespace-nowrap hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--color-accent)" }}
              disabled={isLoading || !projectDescription.trim()}
            >
              {isLoading ? "Evaluating..." : "Evaluate names"}
            </button>
          </div>

          {/* Progress indicator */}
          {isLoading && (
            <div
              className="mt-[var(--spacing-lg)] p-[var(--spacing-lg)] rounded-[var(--radius-lg)]"
              style={{
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="text-[0.9rem] font-medium mb-[var(--spacing-sm)]"
                style={{ color: "var(--color-accent)" }}
              >
                {progressMessage || "Starting..."}
              </div>
              {progressTotal > 0 && (
                <div
                  className="h-1 rounded-sm overflow-hidden mb-[var(--spacing-md)]"
                  style={{ background: "rgba(6, 182, 212, 0.2)" }}
                >
                  <div
                    className="h-full rounded-sm transition-[width] duration-300 ease-linear"
                    style={{
                      width: `${(progressCurrent / progressTotal) * 100}%`,
                      background: "linear-gradient(90deg, var(--color-accent), var(--color-gold))",
                    }}
                  />
                </div>
              )}
              {candidateNames.length > 0 && (
                <div className="flex flex-wrap items-center gap-[var(--spacing-xs)] mt-[var(--spacing-sm)]">
                  <span
                    className="text-[0.75rem] uppercase tracking-[0.05em]"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Candidates:
                  </span>
                  {candidateNames.slice(0, 6).map((name, i) => (
                    <span
                      key={i}
                      className="text-[0.8rem] py-0.5 px-2 rounded-[var(--radius-sm)]"
                      style={{
                        background: "rgba(6, 182, 212, 0.15)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {name}
                    </span>
                  ))}
                  {candidateNames.length > 6 && (
                    <span className="text-[0.75rem]" style={{ color: "var(--color-text-muted)" }}>
                      +{candidateNames.length - 6} more
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="mt-[var(--spacing-lg)] py-[var(--spacing-md)] px-[var(--spacing-lg)] rounded-[var(--radius-lg)] text-[0.9rem] leading-normal"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#ef4444",
              }}
            >
              {error}
            </div>
          )}

          {/* Workflow Results */}
          {workflowResult && (
            <div
              className="overflow-hidden rounded-[var(--radius-xl)]"
              style={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                animation: "result-appear 0.5s var(--ease-spring)",
              }}
            >
              {/* Summary */}
              <div
                className="flex items-center justify-center gap-[var(--spacing-md)] p-[var(--spacing-lg)] flex-wrap max-md:flex-col max-md:gap-[var(--spacing-sm)]"
                style={{
                  background: "var(--color-bg-elevated)",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <span
                  className="font-[family-name:var(--font-satoshi)] text-[0.95rem]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <strong
                    className="font-[family-name:var(--font-clash)] text-2xl inline-block mr-[var(--spacing-xs)]"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {workflowResult.all_candidates.length}
                  </strong>{" "}
                  candidates
                </span>
                <span className="text-[1.2rem] max-md:rotate-90" style={{ color: "var(--color-accent)" }}>
                  &rarr;
                </span>
                <span
                  className="font-[family-name:var(--font-satoshi)] text-[0.95rem]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <strong
                    className="font-[family-name:var(--font-clash)] text-2xl inline-block mr-[var(--spacing-xs)]"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {workflowResult.viable_count}
                  </strong>{" "}
                  with domains
                </span>
                <span className="text-[1.2rem] max-md:rotate-90" style={{ color: "var(--color-accent)" }}>
                  &rarr;
                </span>
                <span
                  className="font-[family-name:var(--font-satoshi)] text-[0.95rem]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <strong
                    className="font-[family-name:var(--font-clash)] text-2xl inline-block mr-[var(--spacing-xs)]"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {workflowResult.evaluated_count}
                  </strong>{" "}
                  evaluated
                </span>
              </div>

              {/* Recommendation */}
              {workflowResult.recommended && (
                <div
                  className="p-[var(--spacing-xl)] text-center"
                  style={{
                    background: "linear-gradient(180deg, rgba(6, 182, 212, 0.05) 0%, transparent 100%)",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    className="inline-block py-[var(--spacing-xs)] px-[var(--spacing-md)] text-white font-[family-name:var(--font-satoshi)] text-[0.7rem] font-semibold uppercase tracking-[0.1em] rounded-[var(--radius-md)] mb-[var(--spacing-md)]"
                    style={{
                      background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-gold) 100%)",
                    }}
                  >
                    Recommended
                  </div>
                  <div
                    className="font-[family-name:var(--font-clash)] text-[2.5rem] font-semibold mb-[var(--spacing-sm)]"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {workflowResult.recommended.name}
                  </div>
                  <div
                    className="font-[family-name:var(--font-satoshi)] text-[1.1rem] mb-[var(--spacing-xs)]"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Score:{" "}
                    <strong className="font-bold" style={{ color: "var(--color-success)" }}>
                      {Math.round(workflowResult.recommended.score)}
                    </strong>
                    /100
                  </div>
                  <div
                    className="font-[family-name:var(--font-satoshi)] text-[0.85rem]"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Source:{" "}
                    {workflowResult.recommended.source === "user"
                      ? "Your idea"
                      : "AI generated"}
                  </div>
                </div>
              )}

              {/* Candidates Table */}
              <div className="p-[var(--spacing-lg)] max-md:overflow-x-auto">
                <h4
                  className="font-[family-name:var(--font-clash)] text-base font-medium uppercase tracking-[0.05em] mb-[var(--spacing-md)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  All candidates
                </h4>
                <table className="w-full border-collapse font-[family-name:var(--font-satoshi)] max-md:min-w-[500px]">
                  <thead>
                    <tr>
                      {["Name", "Source", ".com", ".ai", ".io", "Score", "Status"].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left py-[var(--spacing-sm)] px-[var(--spacing-md)] text-[0.75rem] font-semibold uppercase tracking-[0.05em]"
                            style={{
                              color: "var(--color-text-muted)",
                              borderBottom: "1px solid var(--color-border)",
                            }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {workflowResult.all_candidates
                      .sort((a, b) => {
                        if (a.passed_domain_filter !== b.passed_domain_filter) {
                          return a.passed_domain_filter ? -1 : 1;
                        }
                        const scoreA = a.evaluation?.overall_score ?? 0;
                        const scoreB = b.evaluation?.overall_score ?? 0;
                        return scoreB - scoreA;
                      })
                      .map((candidate, i) => {
                        const pricing = candidate.evaluation?.domain_pricing;
                        const isExpanded = expandedName === candidate.name;
                        const eval_ = candidate.evaluation;

                        return (
                          <CandidateRow
                            key={i}
                            candidate={candidate}
                            index={i}
                            pricing={pricing}
                            isExpanded={isExpanded}
                            eval_={eval_}
                            isRecommended={workflowResult.recommended?.name === candidate.name}
                            onToggle={() =>
                              eval_ && setExpandedName(isExpanded ? null : candidate.name)
                            }
                          />
                        );
                      })}
                  </tbody>
                </table>
              </div>

              <div
                className="mt-[var(--spacing-lg)] p-[var(--spacing-md)] rounded-[var(--radius-md)] font-[family-name:var(--font-satoshi)] text-[0.75rem] text-center leading-normal mx-[var(--spacing-lg)] mb-[var(--spacing-lg)]"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-muted)",
                }}
              >
                This tool provides general information only. Verify domain
                availability and conduct your own due diligence before
                finalizing your brand name.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="text-center py-[var(--spacing-4xl)] px-[var(--spacing-lg)] max-w-[1200px] mx-auto relative max-md:py-[var(--spacing-3xl)] max-md:px-[var(--spacing-md)]">
        <h2 className="font-[family-name:var(--font-clash)] text-[clamp(2rem,5vw,3rem)] font-semibold tracking-[-0.03em] mb-[var(--spacing-md)]">
          The complete name oracle
        </h2>
        <p
          className="text-[1.15rem] max-w-[600px] mx-auto mb-[var(--spacing-3xl)]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Forecast every dimension of your brand name&apos;s future. Automated
          prophecies that would take hours, delivered in seconds.
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[var(--spacing-lg)] max-md:grid-cols-1">
          {[
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              ),
              title: "Domain & social availability",
              desc: "Check .com, .io, .co and 20+ TLDs. Verify Twitter, Instagram, LinkedIn, TikTok handles. Get alternatives if taken.",
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              ),
              title: "Similar company check",
              desc: "Find existing companies with similar names. Research potential naming conflicts before you commit.",
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                </svg>
              ),
              title: "Pronunciation score",
              desc: "Phonetic analysis for ease of spelling and pronunciation. Test across different accents and language backgrounds.",
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              ),
              title: "International check",
              desc: 'Detect embarrassing meanings in other languages. Cultural sensitivity analysis for global expansion.',
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              ),
              title: "AI perception forecasting",
              desc: 'LLM-powered perception oracles. "What will people think?" "Does it align with our mission?" Foresight at scale.',
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="12" cy="12" r="8" opacity="0.5" />
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
                </svg>
              ),
              title: "Brand scope analysis",
              desc: '"TaxGraph" limits you to tax. "Amazon" allows unlimited growth. Know before you commit.',
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              ),
              title: "Tagline generation",
              desc: "AI-generated taglines that complement your name. Perfect for names that need explanation.",
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              ),
              title: "Automated scorecard",
              desc: "One unified score combining all factors. Compare candidates side-by-side. Export reports for stakeholders.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-[var(--spacing-xl)] text-left transition-all duration-[var(--duration-normal)] relative overflow-hidden group rounded-[var(--radius-xl)] hover:-translate-y-1"
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="w-12 h-12 mb-[var(--spacing-lg)] p-[var(--spacing-sm)] rounded-[var(--radius-lg)] flex items-center justify-center"
                style={{
                  background: "var(--color-accent-glow)",
                  color: "var(--color-accent)",
                }}
              >
                {feature.icon}
              </div>
              <h3 className="font-[family-name:var(--font-clash)] text-[1.25rem] font-semibold mb-[var(--spacing-sm)] tracking-[0.01em]">
                {feature.title}
              </h3>
              <p
                className="font-[family-name:var(--font-satoshi)] text-base leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        className="py-[var(--spacing-4xl)] px-[var(--spacing-lg)] max-w-[1200px] mx-auto relative max-md:py-[var(--spacing-3xl)] max-md:px-[var(--spacing-md)]"
        style={{
          background: "var(--color-bg-elevated)",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <h2 className="font-[family-name:var(--font-clash)] text-[clamp(2rem,5vw,3rem)] font-semibold tracking-[-0.03em] text-center mb-[var(--spacing-3xl)]">
          How it works
        </h2>
        <div className="grid grid-cols-3 gap-[var(--spacing-xl)] relative max-md:grid-cols-1 max-md:gap-[var(--spacing-2xl)]">
          {/* Connector line (hidden on mobile) */}
          <div
            className="absolute top-[48px] h-0.5 pointer-events-none max-md:hidden"
            style={{
              left: "calc(16.67% + 24px)",
              right: "calc(16.67% + 24px)",
              background: "linear-gradient(90deg, var(--color-border) 0%, var(--color-accent) 50%, var(--color-border) 100%)",
            }}
          />
          {[
            {
              num: "1",
              title: "Cast your names",
              desc: "Enter your brand name candidates. Let the oracle receive your naming intentions and prepare its vision.",
            },
            {
              num: "2",
              title: "Receive the forecast",
              desc: "Our oracle checks domains, social handles, similar companies, pronunciation, and forecasts how people will perceive each name.",
            },
            {
              num: "3",
              title: "Choose your destiny",
              desc: "Review the unified scorecard, compare candidates side-by-side, and choose the name that's destined for success.",
            },
          ].map((step, i) => (
            <div key={i} className="text-center relative">
              <div
                className="w-12 h-12 mx-auto mb-[var(--spacing-lg)] flex items-center justify-center rounded-full font-[family-name:var(--font-clash)] text-[1.25rem] font-bold relative z-1"
                style={{
                  background: "var(--color-bg)",
                  border: "2px solid var(--color-accent)",
                  color: "var(--color-accent)",
                }}
              >
                {step.num}
              </div>
              <h3 className="font-[family-name:var(--font-clash)] text-[1.15rem] font-semibold mb-[var(--spacing-sm)]">
                {step.title}
              </h3>
              <p
                className="font-[family-name:var(--font-satoshi)] text-[0.95rem] leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-[var(--spacing-4xl)] px-[var(--spacing-lg)] relative max-w-[1200px] mx-auto max-md:py-[var(--spacing-3xl)] max-md:px-[var(--spacing-md)]">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at center bottom, var(--color-accent-glow) 0%, transparent 60%),
              radial-gradient(ellipse at 30% 100%, var(--color-gold-glow) 0%, transparent 40%),
              radial-gradient(ellipse at 70% 80%, var(--color-indigo-glow) 0%, transparent 50%)`,
          }}
        />
        <h2 className="font-[family-name:var(--font-clash)] text-[clamp(2rem,5vw,3.5rem)] font-semibold tracking-[-0.03em] mb-[var(--spacing-md)] relative z-1">
          See your name&apos;s future
        </h2>
        <p
          className="font-[family-name:var(--font-satoshi)] text-[1.2rem] mb-[var(--spacing-xl)] relative z-1"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Stop guessing. Start forecasting. Know your name&apos;s destiny before
          you commit.
        </p>
        <div className="flex gap-[var(--spacing-md)] justify-center flex-wrap relative z-1 max-[480px]:flex-col max-[480px]:w-full max-[480px]:px-[var(--spacing-md)]">
          <a
            href="#demo"
            className="font-[family-name:var(--font-satoshi)] py-[var(--spacing-md)] px-[var(--spacing-xl)] text-[0.95rem] font-semibold rounded-[var(--radius-xl)] no-underline cursor-pointer text-white transition-all duration-[var(--duration-normal)] hover:-translate-y-0.5 max-[480px]:w-full max-[480px]:text-center"
            style={{
              background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dim) 100%)",
              boxShadow: "0 0 0 1px rgba(6, 182, 212, 0.5), 0 4px 24px -4px rgba(6, 182, 212, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            }}
          >
            Consult the oracle
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="text-center py-[var(--spacing-2xl)] px-[var(--spacing-lg)] mt-[var(--spacing-2xl)]"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <p
          className="font-[family-name:var(--font-satoshi)] text-[0.85rem] mb-[var(--spacing-sm)]"
          style={{ color: "var(--color-text-muted)" }}
        >
          Open source brand name intelligence
        </p>
        <div className="flex justify-center items-center gap-[var(--spacing-sm)] flex-wrap">
          <a
            href="https://github.com/MaxGhenis/namecast"
            className="font-[family-name:var(--font-satoshi)] text-[0.8rem] no-underline transition-colors duration-200 hover:text-[var(--color-accent)]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            GitHub
          </a>
          <span className="text-[0.7rem]" style={{ color: "var(--color-text-muted)" }}>
            &middot;
          </span>
          <a
            href="https://pypi.org/project/namecast/"
            className="font-[family-name:var(--font-satoshi)] text-[0.8rem] no-underline transition-colors duration-200 hover:text-[var(--color-accent)]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Python Package
          </a>
          <span className="text-[0.7rem]" style={{ color: "var(--color-text-muted)" }}>
            &middot;
          </span>
          <a
            href="https://github.com/MaxGhenis/namecast#claude-code-plugin"
            className="font-[family-name:var(--font-satoshi)] text-[0.8rem] no-underline transition-colors duration-200 hover:text-[var(--color-accent)]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Claude Code Plugin
          </a>
        </div>
      </footer>
    </div>
  );
}

/* Candidate Row Component */
function CandidateRow({
  candidate,
  index,
  pricing,
  isExpanded,
  eval_,
  isRecommended,
  onToggle,
}: {
  candidate: NameCandidate;
  index: number;
  pricing: Record<string, DomainPricing> | undefined;
  isExpanded: boolean;
  eval_: EvaluationResult | null;
  isRecommended: boolean;
  onToggle: () => void;
}) {
  const rowStyle: React.CSSProperties = {
    opacity: !candidate.passed_domain_filter ? 0.5 : 1,
    cursor: eval_ ? "pointer" : "default",
    background: isExpanded ? "rgba(6, 182, 212, 0.1)" : undefined,
    transition: "background 0.2s",
  };

  const tdStyle: React.CSSProperties = {
    padding: "var(--spacing-sm) var(--spacing-md)",
    fontSize: "0.9rem",
    color: "var(--color-text-secondary)",
    borderBottom: "1px solid var(--color-border)",
  };

  const renderDomainCell = (tld: string) => {
    const key = `.${tld}`;
    const isAvailable = candidate.domains_available[key];
    return (
      <td style={{ ...tdStyle, color: isAvailable ? "var(--color-success)" : "var(--color-error)" }}>
        {isAvailable ? (
          <a
            href={`https://porkbun.com/checkout/search?q=${candidate.name}.${tld}`}
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline inline-flex items-center gap-1 transition-opacity duration-200 hover:opacity-80 hover:underline"
            style={{ color: "var(--color-success)" }}
            onClick={(e) => e.stopPropagation()}
          >
            &#10003;{" "}
            {pricing?.[tld] && (
              <span className="text-[0.75rem] opacity-80 font-normal">
                ${pricing[tld].registration}
              </span>
            )}
          </a>
        ) : (
          "\u2717"
        )}
      </td>
    );
  };

  return (
    <>
      <tr
        style={rowStyle}
        onClick={onToggle}
        className={eval_ ? "hover:bg-[rgba(6,182,212,0.05)]" : ""}
      >
        <td style={{ ...tdStyle, fontWeight: 500, color: "var(--color-text-primary)" }}>
          {isRecommended && (
            <span className="mr-[var(--spacing-xs)]" style={{ color: "var(--color-gold)" }}>
              &#9733;
            </span>
          )}
          {candidate.name}
          {eval_ && (
            <span
              className="ml-[var(--spacing-sm)] text-[0.7rem] transition-transform duration-200"
              style={{ color: "var(--color-text-muted)" }}
            >
              {isExpanded ? "\u25BC" : "\u25B6"}
            </span>
          )}
        </td>
        <td style={tdStyle}>{candidate.source === "user" ? "You" : "AI"}</td>
        {renderDomainCell("com")}
        {renderDomainCell("ai")}
        {renderDomainCell("io")}
        <td style={tdStyle}>
          {candidate.evaluation
            ? Math.round(candidate.evaluation.overall_score)
            : "-"}
        </td>
        <td style={tdStyle}>
          {candidate.evaluation
            ? "Evaluated"
            : candidate.passed_domain_filter
              ? "Not evaluated"
              : "No domain"}
        </td>
      </tr>
      {isExpanded && eval_ && (
        <tr>
          <td
            colSpan={7}
            style={{
              padding: 0,
              background: "rgba(15, 23, 42, 0.6)",
              borderBottom: "2px solid var(--color-accent)",
            }}
          >
            <div className="p-[var(--spacing-lg)] grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[var(--spacing-lg)]">
              {/* Score Breakdown */}
              <DetailSection title="Score breakdown">
                <div className="grid grid-cols-3 gap-[var(--spacing-sm)]">
                  {[
                    { label: "Domain", value: Math.round(eval_.domain_score) },
                    { label: "Social", value: Math.round(eval_.social_score) },
                    { label: "Pronunciation", value: Math.round(eval_.pronunciation_score) },
                    { label: "International", value: eval_.international_score },
                    ...(eval_.brand_scope_score !== undefined
                      ? [{ label: "Brand Scope", value: Math.round(eval_.brand_scope_score) }]
                      : []),
                    ...(eval_.similar_companies_score !== undefined
                      ? [{ label: "Uniqueness", value: Math.round(eval_.similar_companies_score) }]
                      : []),
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center p-[var(--spacing-sm)] rounded-[var(--radius-sm)]"
                      style={{ background: "rgba(15, 23, 42, 0.5)" }}
                    >
                      <span
                        className="text-[0.7rem] uppercase tracking-[0.05em]"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {item.label}
                      </span>
                      <span
                        className="font-[family-name:var(--font-clash)] text-[1.25rem] font-semibold"
                        style={{ color: "var(--color-accent)" }}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </DetailSection>

              {/* Pronunciation */}
              <DetailSection title="Pronunciation">
                <div className="text-[0.85rem]" style={{ color: "var(--color-text-secondary)" }}>
                  <p className="my-[var(--spacing-xs)]">
                    <strong style={{ color: "var(--color-text-primary)" }}>Syllables:</strong>{" "}
                    {eval_.pronunciation.syllables}
                  </p>
                  <p className="my-[var(--spacing-xs)]">
                    <strong style={{ color: "var(--color-text-primary)" }}>Spelling Difficulty:</strong>{" "}
                    {eval_.pronunciation.spelling_difficulty}
                  </p>
                  <p className="my-[var(--spacing-xs)]">
                    <strong style={{ color: "var(--color-text-primary)" }}>Phonetic Score:</strong>{" "}
                    {eval_.pronunciation.score}/10
                  </p>
                </div>
              </DetailSection>

              {/* Perception */}
              <DetailSection title="Perception">
                <div className="text-[0.85rem]" style={{ color: "var(--color-text-secondary)" }}>
                  <p className="my-[var(--spacing-xs)]">
                    <strong style={{ color: "var(--color-text-primary)" }}>Evokes:</strong>{" "}
                    {eval_.perception.evokes}
                  </p>
                  <p className="my-[var(--spacing-xs)]">
                    <strong style={{ color: "var(--color-text-primary)" }}>Industry Association:</strong>{" "}
                    {eval_.perception.industry_association.join(", ")}
                  </p>
                  <p className="my-[var(--spacing-xs)]">
                    <strong style={{ color: "var(--color-text-primary)" }}>Memorability:</strong>{" "}
                    {eval_.perception.memorability}
                  </p>
                </div>
              </DetailSection>

              {/* Similar Companies */}
              {eval_.similar_companies_score !== undefined && (
                <DetailSection title="Similar companies">
                  <div className="text-[0.85rem]" style={{ color: "var(--color-text-secondary)" }}>
                    <p className="my-[var(--spacing-xs)]">
                      <strong style={{ color: "var(--color-text-primary)" }}>Confusion Risk:</strong>{" "}
                      {eval_.similar_companies?.confusion_risk || "Unknown"}
                    </p>
                    {eval_.similar_companies?.matches &&
                      eval_.similar_companies.matches.length > 0 && (
                        <p className="my-[var(--spacing-xs)]">
                          <strong style={{ color: "var(--color-text-primary)" }}>Matches:</strong>{" "}
                          {eval_.similar_companies.matches.join(", ")}
                        </p>
                      )}
                  </div>
                </DetailSection>
              )}

              {/* International */}
              <DetailSection title="International safety">
                <div className="flex flex-wrap gap-[var(--spacing-xs)]">
                  {Object.entries(eval_.international).map(([lang, data]) => (
                    <span
                      key={lang}
                      className="text-[0.75rem] py-0.5 px-2 rounded-[var(--radius-sm)] capitalize"
                      style={{
                        background: data.has_issue
                          ? "rgba(239, 68, 68, 0.2)"
                          : "rgba(34, 197, 94, 0.2)",
                        color: data.has_issue ? "var(--color-error)" : "var(--color-success)",
                      }}
                    >
                      {lang}: {data.has_issue ? `\u26A0 ${data.meaning}` : "\u2713"}
                    </span>
                  ))}
                </div>
              </DetailSection>

              {/* Brand Scope */}
              {eval_.brand_scope && (
                <DetailSection title="Brand scope">
                  <div className="text-[0.85rem]" style={{ color: "var(--color-text-secondary)" }}>
                    <p className="my-[var(--spacing-xs)]">
                      <strong style={{ color: "var(--color-text-primary)" }}>Narrowness:</strong>{" "}
                      {eval_.brand_scope.narrowness}/10 (lower = more flexible)
                    </p>
                    <p className="my-[var(--spacing-xs)]">
                      <strong style={{ color: "var(--color-text-primary)" }}>Expansion Potential:</strong>{" "}
                      {eval_.brand_scope.expansion_potential}/10
                    </p>
                    <p className="my-[var(--spacing-xs)]">
                      <strong style={{ color: "var(--color-text-primary)" }}>Vision Alignment:</strong>{" "}
                      {eval_.brand_scope.vision_alignment}/10
                    </p>
                    <p
                      className="mt-[var(--spacing-sm)] italic text-[0.8rem]"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {eval_.brand_scope.assessment}
                    </p>
                  </div>
                </DetailSection>
              )}

              {/* Taglines */}
              {eval_.taglines && eval_.taglines.length > 0 && (
                <DetailSection title="Suggested taglines">
                  <div className="text-[0.85rem]" style={{ color: "var(--color-text-secondary)" }}>
                    {eval_.taglines.map((tl, idx) => (
                      <p key={idx} className="italic my-[var(--spacing-xs)]" style={{ color: "var(--color-text-primary)" }}>
                        &ldquo;{tl}&rdquo;
                      </p>
                    ))}
                  </div>
                </DetailSection>
              )}

              {/* Social Handles */}
              <DetailSection title="Social handles">
                <div className="flex flex-wrap gap-[var(--spacing-xs)]">
                  {Object.entries(eval_.social).map(([platform, avail]) => (
                    <span
                      key={platform}
                      className="text-[0.75rem] py-0.5 px-2 rounded-[var(--radius-sm)] capitalize"
                      style={{
                        background: avail
                          ? "rgba(34, 197, 94, 0.2)"
                          : "rgba(239, 68, 68, 0.2)",
                        color: avail ? "var(--color-success)" : "var(--color-error)",
                      }}
                    >
                      {platform}: {avail ? "\u2713 Available" : "\u2717 Taken"}
                    </span>
                  ))}
                </div>
              </DetailSection>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* Detail Section Component */
function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[var(--radius-md)] p-[var(--spacing-md)]"
      style={{
        background: "rgba(30, 41, 59, 0.5)",
        border: "1px solid var(--color-border)",
      }}
    >
      <h5
        className="font-[family-name:var(--font-clash)] text-[0.85rem] font-semibold uppercase tracking-[0.05em] mb-[var(--spacing-sm)]"
        style={{ color: "var(--color-accent)" }}
      >
        {title}
      </h5>
      {children}
    </div>
  );
}
