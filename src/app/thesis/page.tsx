"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const sections = ["Problem", "Competitors", "Gap", "Product", "Business"];

export default function ThesisPage() {
  const [activeSection, setActiveSection] = useState("Problem");

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((s) =>
        document.getElementById(s.toLowerCase())
      );
      const scrollPosition = window.scrollY + 200;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId.toLowerCase());
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className="font-[family-name:var(--font-satoshi)] leading-[1.8] min-h-screen"
      style={{ background: "var(--color-bg)", color: "var(--color-text-primary)" }}
    >
      {/* Top Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 h-16 flex items-center px-[var(--spacing-lg)] backdrop-blur-[24px] z-100"
        style={{
          background: "rgba(6, 6, 12, 0.88)",
          borderBottom: "1px solid rgba(30, 30, 69, 0.5)",
          boxShadow: "0 1px 0 rgba(6, 182, 212, 0.04)",
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-[var(--spacing-sm)] font-[family-name:var(--font-display)] text-[1.125rem] font-semibold no-underline tracking-[-0.02em] transition-opacity duration-200 hover:opacity-80"
          style={{ color: "var(--color-text-primary)" }}
        >
          <svg
            className="w-[26px] h-[26px]"
            viewBox="0 0 32 32"
            fill="none"
            style={{ color: "var(--color-accent)" }}
          >
            <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" />
            <circle cx="16" cy="16" r="5" fill="currentColor" />
            <path
              d="M16 4v4M16 24v4M4 16h4M24 16h4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M8 8l3 3M21 21l3 3M8 24l3-3M21 11l3-3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
          Namecast
        </Link>
      </nav>

      {/* Section Navigation */}
      <nav
        className="fixed top-20 left-1/2 -translate-x-1/2 flex gap-0.5 p-1 backdrop-blur-[24px] rounded-full z-50 max-md:top-auto max-md:bottom-[var(--spacing-md)] max-md:flex-wrap max-md:max-w-[95%] max-md:justify-center max-md:rounded-[var(--radius-2xl)]"
        style={{
          background: "rgba(8, 8, 18, 0.92)",
          border: "1px solid rgba(30, 30, 69, 0.5)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
        }}
      >
        {sections.map((section) => (
          <button
            key={section}
            className="py-2 px-5 font-[family-name:var(--font-satoshi)] text-[0.8rem] font-medium border-none rounded-full cursor-pointer transition-all duration-200 whitespace-nowrap max-md:py-2 max-md:px-3 max-md:text-[0.75rem]"
            style={{
              background:
                activeSection === section
                  ? "var(--color-accent)"
                  : "transparent",
              color:
                activeSection === section
                  ? "white"
                  : "var(--color-text-muted)",
              boxShadow:
                activeSection === section
                  ? "0 2px 12px -2px rgba(6, 182, 212, 0.4)"
                  : "none",
            }}
            onClick={() => scrollToSection(section)}
            onMouseEnter={(e) => {
              if (activeSection !== section) {
                e.currentTarget.style.color = "var(--color-text-primary)";
                e.currentTarget.style.background = "rgba(30, 30, 69, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== section) {
                e.currentTarget.style.color = "var(--color-text-muted)";
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            {section}
          </button>
        ))}
      </nav>

      {/* Hero */}
      <header className="min-h-[70vh] flex flex-col justify-center items-center text-center pt-[140px] pb-[var(--spacing-4xl)] px-[var(--spacing-lg)] relative">
        {/* Multi-layer glow */}
        <div
          className="absolute w-[700px] h-[700px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at 40% 40%, rgba(6, 182, 212, 0.2) 0%, transparent 50%),
              radial-gradient(ellipse at 60% 60%, rgba(99, 102, 241, 0.12) 0%, transparent 50%)`,
            filter: "blur(40px)",
            animation: "cosmic-pulse 15s ease-in-out infinite",
          }}
        />
        <span
          className="font-[family-name:var(--font-mono)] text-[0.75rem] font-medium uppercase tracking-[0.25em] mb-[var(--spacing-md)] relative z-1 py-1.5 px-4 rounded-full"
          style={{
            color: "var(--color-accent)",
            background: "rgba(6, 182, 212, 0.08)",
            border: "1px solid rgba(6, 182, 212, 0.2)",
          }}
        >
          Investment thesis
        </span>
        <h1
          className="font-[family-name:var(--font-clash)] text-[clamp(2.5rem,7vw,4.5rem)] font-bold tracking-[-0.03em] mb-[var(--spacing-lg)] relative z-1 bg-clip-text leading-[1.1]"
          style={{
            background:
              "linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-text-primary) 40%, var(--color-accent) 80%, var(--color-gold) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          AI-powered brand name intelligence
        </h1>
        <p
          className="font-[family-name:var(--font-satoshi)] text-[1.25rem] max-w-[560px] leading-[1.7] relative z-1"
          style={{ color: "var(--color-text-secondary)" }}
        >
          The market for brand naming is fragmented across dozens of tools. None
          combine objective availability checks with LLM-powered perception
          analysis. We&apos;re building the unified scorecard.
        </p>
        <p
          className="font-[family-name:var(--font-mono)] text-[0.8rem] mt-[var(--spacing-xl)] relative z-1 tracking-[0.05em]"
          style={{ color: "var(--color-text-faint)" }}
        >
          December 2024 &middot; Namecast
        </p>
      </header>

      {/* Problem Section */}
      <section
        id="problem"
        className="min-h-screen py-[var(--spacing-4xl)] px-[var(--spacing-lg)] flex flex-col items-center max-md:min-h-0 max-md:py-[var(--spacing-3xl)] max-md:px-[var(--spacing-md)]"
      >
        <div className="max-w-[720px] w-full">
          <h2 className="font-[family-name:var(--font-clash)] text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.02em] mb-[var(--spacing-xl)] relative inline-block">
            The problem
            <span
              className="absolute -bottom-2 left-0 h-[2px] w-12 rounded-full"
              style={{ background: "linear-gradient(90deg, var(--color-accent), transparent)" }}
            />
          </h2>

          <p
            className="font-[family-name:var(--font-clash)] text-[1.4rem] font-medium leading-[1.5] mb-[var(--spacing-xl)]"
          >
            Naming a brand requires checking multiple disconnected systems, and
            the most important question&mdash;&ldquo;does this name fit our
            identity?&rdquo;&mdash;has no automated answer.
          </p>

          <div className="grid grid-cols-3 gap-[var(--spacing-md)] mb-[var(--spacing-2xl)] max-md:grid-cols-1">
            {[
              {
                title: "Founders",
                desc: "Spend weeks manually checking domains, handles, and similar companies across 10+ different websites before picking a name.",
              },
              {
                title: "Brand agencies",
                desc: "Charge $50K+ for naming projects but still use spreadsheets to track availability across platforms.",
              },
              {
                title: "Marketing teams",
                desc: "Launch products with names that don't resonate internationally or have embarrassing meanings in other languages.",
              },
            ].map((ex) => (
              <div
                key={ex.title}
                className="p-[var(--spacing-lg)] rounded-[var(--radius-lg)] transition-all duration-300 hover:-translate-y-1 border-hover-glow group"
                style={{
                  background: "var(--color-bg-card)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <h4
                  className="font-[family-name:var(--font-clash)] text-[0.8rem] font-semibold uppercase tracking-[0.1em] mb-[var(--spacing-sm)] transition-colors duration-200 group-hover:text-[var(--color-accent-bright)]"
                  style={{ color: "var(--color-accent)" }}
                >
                  {ex.title}
                </h4>
                <p
                  className="text-[0.95rem] leading-relaxed m-0"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {ex.desc}
                </p>
              </div>
            ))}
          </div>

          <p
            className="font-[family-name:var(--font-satoshi)] text-[1.15rem] leading-[1.9] mb-[var(--spacing-lg)]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            The brand naming process is{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              fragmented
            </strong>
            . Domain registrars check domains. Social tools check handles. Search
            engines find competitors. Linguists check pronunciation. Nobody
            checks &ldquo;what does this name make people think of?&rdquo;
          </p>

          <p
            className="font-[family-name:var(--font-satoshi)] text-[1.15rem] leading-[1.9] mb-[var(--spacing-lg)]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <strong style={{ color: "var(--color-text-primary)" }}>
              LLMs change this.
            </strong>{" "}
            For the first time, we can automate the subjective parts of brand
            evaluation: &ldquo;What kind of company do you think
            &lsquo;Nexlify&rsquo; is?&rdquo; &ldquo;Does &lsquo;Luminary&rsquo;
            align with a mission about education?&rdquo; This unlocks the final
            piece of an automated scorecard.
          </p>
        </div>
      </section>

      {/* Competitors Section */}
      <section
        id="competitors"
        className="min-h-screen py-[var(--spacing-4xl)] px-[var(--spacing-lg)] flex flex-col items-center max-md:min-h-0 max-md:py-[var(--spacing-3xl)] max-md:px-[var(--spacing-md)]"
      >
        <div className="max-w-[720px] w-full">
          <h2 className="font-[family-name:var(--font-clash)] text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.02em] mb-[var(--spacing-xl)] relative inline-block">
            Competitive landscape
            <span
              className="absolute -bottom-2 left-0 h-[2px] w-12 rounded-full"
              style={{ background: "linear-gradient(90deg, var(--color-accent), transparent)" }}
            />
          </h2>

          <p
            className="font-[family-name:var(--font-satoshi)] text-[1.15rem] leading-[1.9] mb-[var(--spacing-lg)]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            The brand naming tool market is fragmented. Each tool does one or two
            things well, but none provide a unified evaluation platform.
          </p>

          {/* Competitive Table */}
          <div
            className="overflow-x-auto my-[var(--spacing-xl)] rounded-[var(--radius-xl)]"
            style={{
              border: "1px solid var(--color-border)",
              boxShadow: "0 4px 24px -8px rgba(0, 0, 0, 0.3)",
            }}
          >
            <table className="w-full border-collapse font-[family-name:var(--font-satoshi)] text-[0.9rem]">
              <thead>
                <tr>
                  {[
                    "Feature",
                    "BrandSnap",
                    "Namify",
                    "Squadhelp",
                    "KnowEm",
                    "Namecast",
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={`py-[var(--spacing-md)] px-[var(--spacing-lg)] font-semibold text-[0.85rem] uppercase tracking-[0.05em] ${i === 0 ? "text-left" : "text-center"}`}
                      style={{
                        background:
                          h === "Namecast"
                            ? "var(--color-accent-glow)"
                            : "var(--color-bg-elevated)",
                        color: "var(--color-text-primary)",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Domain check", "✓", "✓", "✓", "✓", "✓"],
                  ["Social handles", "✓", "~", "~", "✓", "✓"],
                  ["Similar company search", "✗", "✗", "~", "✗", "✓"],
                  ["Pronunciation score", "✗", "✗", "✗", "✗", "✓"],
                  ["International check", "✗", "✗", "✗", "✗", "✓"],
                  ["AI perception analysis", "✗", "✗", "✗", "✗", "✓"],
                  ["Mission alignment", "✗", "✗", "✗", "✗", "✓"],
                  ["Unified scorecard", "✗", "✗", "~", "✗", "✓"],
                ].map((row) => (
                  <tr
                    key={row[0]}
                    className="transition-colors duration-150 hover:bg-[var(--color-bg-elevated)]"
                  >
                    {row.map((cell, i) => (
                      <td
                        key={i}
                        className={`py-[var(--spacing-md)] px-[var(--spacing-lg)] ${i === 0 ? "text-left" : "text-center"}`}
                        style={{
                          color:
                            i === 0
                              ? "var(--color-text-secondary)"
                              : cell === "✓"
                                ? "var(--color-success)"
                                : cell === "~"
                                  ? "var(--color-gold)"
                                  : "var(--color-text-faint)",
                          fontWeight: cell === "✓" ? "bold" : undefined,
                          fontSize: i > 0 ? "1.1rem" : undefined,
                          background:
                            i === 5 ? "var(--color-accent-glow)" : undefined,
                          borderBottom: "1px solid var(--color-border)",
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Competitor Notes */}
          <div className="grid grid-cols-2 gap-[var(--spacing-md)] mt-[var(--spacing-xl)] max-md:grid-cols-1">
            {[
              {
                name: "BrandSnap.ai",
                desc: "Free AI name generator with domain availability checks. Strong on availability but no perception analysis or scoring.",
              },
              {
                name: "Namify",
                desc: "Name generation with domain checks and free logo creation. Focus on quantity over evaluation depth.",
              },
              {
                name: "Squadhelp",
                desc: "Human-powered naming contests with audience testing. High quality but slow and expensive ($299-999).",
              },
              {
                name: "KnowEm",
                desc: "Comprehensive social handle checker (500+ platforms). No pronunciation or perception analysis.",
              },
            ].map((c) => (
              <div
                key={c.name}
                className="p-[var(--spacing-lg)] rounded-[var(--radius-lg)] transition-all duration-300 border-hover-glow"
                style={{
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <h4 className="font-[family-name:var(--font-clash)] text-base font-semibold mb-[var(--spacing-sm)]">
                  {c.name}
                </h4>
                <p
                  className="text-[0.9rem] leading-relaxed m-0"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gap Section */}
      <section
        id="gap"
        className="min-h-screen py-[var(--spacing-4xl)] px-[var(--spacing-lg)] flex flex-col items-center max-md:min-h-0 max-md:py-[var(--spacing-3xl)] max-md:px-[var(--spacing-md)]"
      >
        <div className="max-w-[720px] w-full">
          <h2 className="font-[family-name:var(--font-clash)] text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.02em] mb-[var(--spacing-xl)] relative inline-block">
            The gap
            <span
              className="absolute -bottom-2 left-0 h-[2px] w-12 rounded-full"
              style={{ background: "linear-gradient(90deg, var(--color-accent), transparent)" }}
            />
          </h2>

          <p
            className="font-[family-name:var(--font-satoshi)] text-[1.15rem] leading-[1.9] mb-[var(--spacing-lg)]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Current tools treat brand naming as a{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              discovery problem
            </strong>
            &mdash;find available names. We treat it as an{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              evaluation problem
            </strong>
            &mdash;score how good the name actually is.
          </p>

          <div className="grid grid-cols-2 gap-[var(--spacing-lg)] my-[var(--spacing-2xl)] max-md:grid-cols-1">
            <div
              className="p-[var(--spacing-xl)] rounded-[var(--radius-xl)]"
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
              }}
            >
              <h3 className="font-[family-name:var(--font-clash)] text-[1.1rem] font-semibold mb-[var(--spacing-md)]" style={{ color: "var(--color-accent)" }}>
                What teams need
              </h3>
              <ul className="list-none p-0">
                {[
                  "Single source of truth for all name evaluation criteria",
                  'Automated answers to "what does this name evoke?"',
                  "Objective scoring to compare candidates",
                  "International and cultural sensitivity checks",
                  "Integration with their existing workflow",
                ].map((item) => (
                  <li
                    key={item}
                    className="text-base leading-[1.7] mb-[var(--spacing-sm)] pl-[var(--spacing-lg)] relative before:content-[''] before:absolute before:left-0 before:top-[0.7em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[var(--color-accent)]"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="p-[var(--spacing-xl)] rounded-[var(--radius-xl)]"
              style={{
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
              }}
            >
              <h3 className="font-[family-name:var(--font-clash)] text-[1.1rem] font-semibold mb-[var(--spacing-md)]" style={{ color: "var(--color-text-muted)" }}>
                What exists today
              </h3>
              <ul className="list-none p-0">
                {[
                  "Fragmented tools requiring 10+ browser tabs",
                  "Manual perception testing via surveys",
                  "Subjective gut feelings from stakeholders",
                  "Expensive linguist consultations",
                  "No API access for programmatic evaluation",
                ].map((item) => (
                  <li
                    key={item}
                    className="text-base leading-[1.7] mb-[var(--spacing-sm)] pl-[var(--spacing-lg)] relative before:content-[''] before:absolute before:left-0 before:top-[0.7em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[var(--color-accent)]"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="p-[var(--spacing-xl)] rounded-[var(--radius-lg)] mt-[var(--spacing-lg)] text-[1.1rem] relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(99, 102, 241, 0.06) 100%)",
              borderLeft: "3px solid var(--color-accent)",
              border: "1px solid rgba(6, 182, 212, 0.2)",
              borderLeftWidth: "3px",
              borderLeftColor: "var(--color-accent)",
            }}
          >
            <strong style={{ color: "var(--color-accent)" }}>The gap:</strong> No one has built LLM-powered perception
            analysis into an automated brand evaluation scorecard. This is the
            missing piece that unifies all the fragmented tools.
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section
        id="product"
        className="min-h-screen py-[var(--spacing-4xl)] px-[var(--spacing-lg)] flex flex-col items-center max-md:min-h-0 max-md:py-[var(--spacing-3xl)] max-md:px-[var(--spacing-md)]"
      >
        <div className="max-w-[720px] w-full">
          <h2 className="font-[family-name:var(--font-clash)] text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.02em] mb-[var(--spacing-xl)] relative inline-block">
            The product
            <span
              className="absolute -bottom-2 left-0 h-[2px] w-12 rounded-full"
              style={{ background: "linear-gradient(90deg, var(--color-accent), transparent)" }}
            />
          </h2>

          <p
            className="font-[family-name:var(--font-satoshi)] text-[1.15rem] leading-[1.9] mb-[var(--spacing-lg)]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Namecast is the brand name oracle. Enter a name, receive a
            comprehensive forecast covering everything from domain availability to
            AI-powered perception prophecy.
          </p>

          <div className="grid grid-cols-2 gap-[var(--spacing-lg)] my-[var(--spacing-2xl)] max-md:grid-cols-1">
            {[
              {
                title: "Objective checks",
                desc: "Automated verification across all platforms.",
                items: [
                  "Domain availability (20+ TLDs)",
                  "Social handles (Twitter, IG, LinkedIn, TikTok)",
                  "Similar company search",
                  "App store name availability",
                ],
              },
              {
                title: "Linguistic analysis",
                desc: "Phonetic and international evaluation.",
                items: [
                  "Pronunciation difficulty score",
                  "Spelling complexity rating",
                  "International meaning check (50+ languages)",
                  "Cultural sensitivity analysis",
                ],
              },
              {
                title: "AI perception",
                desc: "LLM-powered brand fit analysis.",
                items: [
                  '"What does this name evoke?"',
                  "Industry/sector association",
                  "Mission alignment scoring",
                  "Competitive differentiation analysis",
                ],
              },
              {
                title: "Unified scorecard",
                desc: "One score to compare all candidates.",
                items: [
                  "Weighted composite score (0-100)",
                  "Side-by-side comparison view",
                  "Exportable reports for stakeholders",
                  "API access for programmatic evaluation",
                ],
              },
            ].map((f) => (
              <div
                key={f.title}
                className="p-[var(--spacing-xl)] rounded-[var(--radius-xl)] transition-all duration-300 border-hover-glow group"
                style={{
                  background: "var(--color-bg-card)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <h3 className="font-[family-name:var(--font-clash)] text-[1.15rem] font-semibold mb-[var(--spacing-xs)] tracking-[-0.01em]">
                  {f.title}
                </h3>
                <p
                  className="text-[0.95rem] mb-[var(--spacing-md)]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {f.desc}
                </p>
                <ul className="list-none p-0">
                  {f.items.map((item) => (
                    <li
                      key={item}
                      className="text-[0.9rem] mb-[var(--spacing-xs)] pl-[var(--spacing-lg)] relative"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      <span
                        className="absolute left-0 text-[0.75rem] top-[0.2em] transition-transform duration-200 group-hover:translate-x-0.5"
                        style={{ color: "var(--color-accent)" }}
                      >
                        &#10095;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Model Section */}
      <section
        id="business"
        className="min-h-screen py-[var(--spacing-4xl)] px-[var(--spacing-lg)] flex flex-col items-center max-md:min-h-0 max-md:py-[var(--spacing-3xl)] max-md:px-[var(--spacing-md)]"
      >
        <div className="max-w-[720px] w-full">
          <h2 className="font-[family-name:var(--font-clash)] text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.02em] mb-[var(--spacing-xl)] relative inline-block">
            Business model
            <span
              className="absolute -bottom-2 left-0 h-[2px] w-12 rounded-full"
              style={{ background: "linear-gradient(90deg, var(--color-accent), transparent)" }}
            />
          </h2>

          <p
            className="font-[family-name:var(--font-satoshi)] text-[1.15rem] leading-[1.9] mb-[var(--spacing-lg)]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Freemium model with API-first architecture. Free tier for
            individuals, paid tiers for agencies and enterprises who need volume
            and integrations.
          </p>

          {/* Pricing Stack */}
          <div className="flex flex-col gap-1 my-[var(--spacing-2xl)] rounded-[var(--radius-xl)] overflow-hidden">
            {[
              {
                name: "Free",
                desc: "5 evaluations/month, basic scorecard",
                price: "$0",
                borderColor: "var(--color-success)",
                glowColor: "rgba(16, 185, 129, 0.06)",
              },
              {
                name: "Pro",
                desc: "Unlimited evaluations, full AI analysis, API access",
                price: "$49/mo",
                borderColor: "var(--color-accent)",
                glowColor: "rgba(6, 182, 212, 0.06)",
              },
              {
                name: "Enterprise",
                desc: "Custom integrations, bulk evaluation, dedicated support",
                price: "Custom",
                borderColor: "var(--color-gold)",
                glowColor: "rgba(245, 158, 11, 0.06)",
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className="flex justify-between items-center py-[var(--spacing-lg)] px-[var(--spacing-xl)] transition-all duration-300 group rounded-[var(--radius-md)]"
                style={{
                  background: "var(--color-bg-card)",
                  borderLeft: `3px solid ${tier.borderColor}`,
                  border: `1px solid var(--color-border)`,
                  borderLeftWidth: "3px",
                  borderLeftColor: tier.borderColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = tier.glowColor;
                  e.currentTarget.style.borderLeftColor = tier.borderColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--color-bg-card)";
                  e.currentTarget.style.borderLeftColor = tier.borderColor;
                }}
              >
                <div>
                  <h3 className="font-[family-name:var(--font-clash)] text-[1.05rem] font-semibold mb-1">
                    {tier.name}
                  </h3>
                  <p
                    className="text-[0.9rem] m-0"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {tier.desc}
                  </p>
                </div>
                <span
                  className="font-[family-name:var(--font-mono)] text-[1rem] font-semibold ml-[var(--spacing-lg)] whitespace-nowrap"
                  style={{ color: tier.borderColor }}
                >
                  {tier.price}
                </span>
              </div>
            ))}
          </div>

          <p
            className="font-[family-name:var(--font-satoshi)] text-[1.15rem] leading-[1.9] mb-[var(--spacing-lg)]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <strong style={{ color: "var(--color-text-primary)" }}>
              Target customers:
            </strong>{" "}
            Startup founders, brand agencies, marketing teams at mid-market
            companies, domain investors, and developers building naming tools.
          </p>

          <p
            className="font-[family-name:var(--font-satoshi)] text-[1.15rem] leading-[1.9] mb-[var(--spacing-lg)]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <strong style={{ color: "var(--color-text-primary)" }}>
              Go-to-market:
            </strong>{" "}
            Product-led growth via free tier. Content marketing around brand
            naming best practices. Claude Code plugin for developer adoption.
            Partnerships with startup accelerators and domain registrars.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-[var(--spacing-4xl)] px-[var(--spacing-lg)] text-center relative"
        style={{
          background: "var(--color-bg-elevated)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        {/* Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center top, var(--color-accent-glow) 0%, transparent 70%)",
          }}
        />
        <h2 className="font-[family-name:var(--font-clash)] text-[clamp(1.75rem,4vw,2.5rem)] mb-[var(--spacing-md)] relative z-1">
          Ready to forecast?
        </h2>
        <p
          className="font-[family-name:var(--font-satoshi)] text-[1.15rem] mb-[var(--spacing-xl)] relative z-1"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Try Namecast free. No signup required for your first prophecy.
        </p>
        <div className="flex justify-center gap-[var(--spacing-md)] relative z-1 max-md:flex-col max-md:items-center">
          <Link
            href="/"
            className="font-[family-name:var(--font-satoshi)] py-[var(--spacing-md)] px-[var(--spacing-2xl)] text-[0.95rem] font-semibold rounded-[var(--radius-xl)] no-underline text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(6,182,212,0.6),0_8px_32px_-4px_rgba(6,182,212,0.5)]"
            style={{
              background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dim) 100%)",
              boxShadow:
                "0 0 0 1px rgba(6, 182, 212, 0.5), 0 4px 20px -4px rgba(6, 182, 212, 0.4)",
            }}
          >
            Consult the oracle
          </Link>
          <a
            href="mailto:hello@namecast.ai"
            className="font-[family-name:var(--font-satoshi)] py-[var(--spacing-md)] px-[var(--spacing-2xl)] text-[0.95rem] font-semibold rounded-[var(--radius-xl)] no-underline transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.15)]"
            style={{
              background: "transparent",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)",
            }}
          >
            Get in touch
          </a>
        </div>
      </section>
    </div>
  );
}
