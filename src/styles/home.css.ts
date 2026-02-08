import { style, globalStyle, keyframes } from '@vanilla-extract/css'

/*
 * Namecast Homepage - "Oracle/Forecast" Aesthetic
 * Cosmic foresight meets crystalline precision
 *
 * NOTE: The Clash Display & Satoshi fonts are loaded via an @import in index.css.
 * CSS variables (--color-*, --space-*, --radius-*, etc.) are defined in index.css :root.
 */

const fontClash = "'Clash Display', var(--font-display)"
const fontSatoshi = "'Satoshi', var(--font-body)"

// ============================================
//   KEYFRAMES
// ============================================

const cosmicPulse = keyframes({
  '0%, 100%': {
    transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
    opacity: '0.6',
  },
  '50%': {
    transform: 'translate(-50%, -50%) scale(1.1) rotate(10deg)',
    opacity: '0.8',
  },
})

const drift = keyframes({
  '0%': { transform: 'translateY(0) translateX(0)' },
  '100%': { transform: 'translateY(-100px) translateX(50px)' },
})

const pulseDot = keyframes({
  '0%, 100%': { opacity: '1', transform: 'scale(1)' },
  '50%': { opacity: '0.5', transform: 'scale(1.2)' },
})

const fadeInUp = keyframes({
  from: { opacity: '0', transform: 'translateY(24px)' },
  to: { opacity: '1', transform: 'translateY(0)' },
})

const resultAppear = keyframes({
  from: { opacity: '0', transform: 'translateY(20px) scale(0.98)' },
  to: { opacity: '1', transform: 'translateY(0) scale(1)' },
})

// ============================================
//   BASE
// ============================================

export const home = style({
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  fontFamily: fontSatoshi,
  lineHeight: 1.7,
  position: 'relative',
  overflowX: 'hidden',
})

// All sections inside .home
globalStyle(`${home} section`, {
  padding: 'var(--space-4xl) var(--space-lg)',
  maxWidth: 1200,
  margin: '0 auto',
  position: 'relative',
})

// ============================================
//   HERO SECTION
// ============================================

export const hero = style({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  paddingTop: 120,
  position: 'relative',
  '::before': {
    content: '""',
    position: 'absolute',
    width: 900,
    height: 900,
    background: `
      radial-gradient(ellipse at 30% 30%, rgba(6, 182, 212, 0.25) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 60%, rgba(245, 158, 11, 0.15) 0%, transparent 40%),
      radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)`,
    borderRadius: '50%',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    animation: `${cosmicPulse} 12s ease-in-out infinite`,
    pointerEvents: 'none',
    filter: 'blur(60px)',
  },
  '::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      radial-gradient(2px 2px at 20% 30%, rgba(6, 182, 212, 0.5) 0%, transparent 100%),
      radial-gradient(2px 2px at 40% 70%, rgba(245, 158, 11, 0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 60% 20%, rgba(99, 102, 241, 0.5) 0%, transparent 100%),
      radial-gradient(2px 2px at 80% 50%, rgba(6, 182, 212, 0.4) 0%, transparent 100%),
      radial-gradient(1px 1px at 10% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 100%),
      radial-gradient(2px 2px at 90% 90%, rgba(6, 182, 212, 0.4) 0%, transparent 100%)`,
    animation: `${drift} 20s linear infinite`,
    pointerEvents: 'none',
  },
  '@media': {
    '(max-width: 768px)': {
      minHeight: '90vh',
      paddingTop: 100,
    },
  },
})

// Hero ::before responsive override
globalStyle(`${hero}::before`, {
  '@media': {
    '(max-width: 768px)': {
      width: '500px',
      height: '500px',
    },
  },
})

export const heroContent = style({
  maxWidth: 900,
  position: 'relative',
  zIndex: 2,
})

export const heroBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--space-sm)',
  padding: 'var(--space-sm) var(--space-md)',
  background: 'rgba(6, 182, 212, 0.1)',
  border: '1px solid rgba(6, 182, 212, 0.3)',
  borderRadius: 'var(--radius-2xl)',
  fontFamily: fontSatoshi,
  fontSize: '0.8rem',
  fontWeight: 500,
  color: 'var(--color-accent)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  marginBottom: 'var(--space-xl)',
  animation: `${fadeInUp} 0.8s var(--ease-out) both`,
  '::before': {
    content: '""',
    width: 8,
    height: 8,
    background: 'var(--color-accent)',
    borderRadius: '50%',
    animation: `${pulseDot} 2s ease-in-out infinite`,
  },
})

export const heroH1 = style({
  fontFamily: fontClash,
  fontSize: 'clamp(3.5rem, 10vw, 7rem)',
  fontWeight: 600,
  lineHeight: 0.95,
  letterSpacing: '-0.04em',
  marginBottom: 'var(--space-xl)',
  animation: `${fadeInUp} 0.8s var(--ease-out) 0.1s both`,
})

export const gradientText = style({
  background: `linear-gradient(135deg, var(--color-text) 0%, var(--color-text) 30%, var(--color-accent) 60%, var(--color-gold) 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
})

export const highlight = style({
  position: 'relative',
  display: 'inline-block',
  '::after': {
    content: '""',
    position: 'absolute',
    bottom: '0.1em',
    left: 0,
    right: 0,
    height: '0.15em',
    background: 'linear-gradient(90deg, var(--color-accent), var(--color-gold))',
    opacity: 0.6,
    transform: 'skewX(-12deg)',
  },
})

export const heroSubtitle = style({
  fontFamily: fontSatoshi,
  fontSize: '1.35rem',
  fontWeight: 400,
  color: 'var(--color-text-secondary)',
  maxWidth: 600,
  margin: '0 auto var(--space-2xl)',
  lineHeight: 1.7,
  animation: `${fadeInUp} 0.8s var(--ease-out) 0.2s both`,
})

export const heroCta = style({
  display: 'flex',
  gap: 'var(--space-md)',
  justifyContent: 'center',
  flexWrap: 'wrap',
  animation: `${fadeInUp} 0.8s var(--ease-out) 0.3s both`,
  '@media': {
    '(max-width: 480px)': {
      flexDirection: 'column',
      width: '100%',
      padding: '0 var(--space-md)',
    },
  },
})

// ============================================
//   BUTTONS
// ============================================

const btnBase = {
  fontFamily: fontSatoshi,
  padding: 'var(--space-md) var(--space-xl)',
  fontSize: '0.95rem',
  fontWeight: 600,
  borderRadius: 'var(--radius-xl)',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'all var(--duration-normal) var(--ease-out)',
  position: 'relative' as const,
  overflow: 'hidden' as const,
}

export const btnPrimary = style({
  ...btnBase,
  background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dim) 100%)',
  color: 'white',
  border: 'none',
  boxShadow: `
    0 0 0 1px rgba(6, 182, 212, 0.5),
    0 4px 24px -4px rgba(6, 182, 212, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
  '::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
    opacity: 0,
    transition: 'opacity var(--duration-fast)',
  },
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: `
      0 0 0 1px rgba(6, 182, 212, 0.8),
      0 8px 40px -4px rgba(6, 182, 212, 0.6),
      0 0 80px -20px var(--color-accent),
      inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
  },
  '@media': {
    '(max-width: 480px)': {
      width: '100%',
      textAlign: 'center',
    },
  },
})

globalStyle(`${btnPrimary}:hover::before`, {
  opacity: 1,
})

export const btnSecondary = style({
  ...btnBase,
  background: 'transparent',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  ':hover': {
    background: 'var(--color-bg-elevated)',
    borderColor: 'var(--color-border-glow)',
    transform: 'translateY(-2px)',
  },
  '@media': {
    '(max-width: 480px)': {
      width: '100%',
      textAlign: 'center',
    },
  },
})

// ============================================
//   DEMO / EVALUATION SECTION
// ============================================

export const demo = style({
  background: 'var(--color-bg-elevated)',
  borderTop: '1px solid var(--color-border)',
  borderBottom: '1px solid var(--color-border)',
  position: 'relative',
  overflow: 'hidden',
  '::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 800,
    height: 400,
    background: 'radial-gradient(ellipse at center top, var(--color-accent-glow) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
})

export const demoContainer = style({
  maxWidth: 800,
  margin: '0 auto',
  position: 'relative',
  zIndex: 1,
})

export const demoHeader = style({
  textAlign: 'center',
  marginBottom: 'var(--space-2xl)',
})

globalStyle(`${demoHeader} h2`, {
  fontFamily: fontClash,
  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
  fontWeight: 600,
  marginBottom: 'var(--space-sm)',
  letterSpacing: '-0.02em',
})

globalStyle(`${demoHeader} p`, {
  color: 'var(--color-text-muted)',
  fontSize: '1rem',
})

export const passwordGroup = style({
  display: 'flex',
  gap: 'var(--space-sm)',
  alignItems: 'center',
  padding: 'var(--space-sm) var(--space-md)',
  background: 'rgba(245, 158, 11, 0.08)',
  border: '1px solid rgba(245, 158, 11, 0.2)',
  borderRadius: 'var(--radius-lg)',
  fontSize: '0.85rem',
})

export const passwordLabel = style({
  fontFamily: fontSatoshi,
  fontSize: '0.8rem',
  fontWeight: 500,
  color: 'var(--color-gold)',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
})

export const passwordInput = style({
  flex: 1,
  padding: 'var(--space-sm) var(--space-md)',
  fontFamily: fontSatoshi,
  fontSize: '0.9rem',
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text)',
  outline: 'none',
  transition: 'all var(--duration-fast)',
  ':focus': {
    borderColor: 'var(--color-accent-dim)',
    boxShadow: '0 0 0 3px var(--color-accent-glow)',
  },
  '::placeholder': {
    color: 'var(--color-text-faint)',
  },
})

export const betaNote = style({
  fontSize: '0.8rem',
  color: 'var(--color-text-muted)',
  textAlign: 'center',
  marginTop: 'var(--space-sm)',
  fontStyle: 'italic',
})

export const demoInput = style({
  flex: 1,
  padding: 'var(--space-md) var(--space-lg)',
  fontFamily: fontSatoshi,
  fontSize: '1.1rem',
  background: 'transparent',
  border: 'none',
  color: 'var(--color-text)',
  outline: 'none',
  '::placeholder': {
    color: 'var(--color-text-faint)',
  },
})

export const demoButton = style({
  padding: 'var(--space-md) var(--space-xl)',
  fontFamily: fontSatoshi,
  fontSize: '0.95rem',
  fontWeight: 600,
  background: 'var(--color-accent)',
  color: 'white',
  border: 'none',
  borderRadius: 'var(--radius-lg)',
  cursor: 'pointer',
  transition: 'all var(--duration-fast)',
  whiteSpace: 'nowrap',
  ':hover': {
    background: 'var(--color-accent-bright)',
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  '@media': {
    '(max-width: 768px)': {
      width: '100%',
    },
  },
})

export const fullWidth = style({
  width: '100%',
})

// ============================================
//   WORKFLOW FORM
// ============================================

export const workflowForm = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-md)',
  marginBottom: 'var(--space-xl)',
})

export const demoTextarea = style({
  width: '100%',
  padding: 'var(--space-md) var(--space-lg)',
  fontFamily: fontSatoshi,
  fontSize: '1rem',
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  color: 'var(--color-text)',
  resize: 'vertical',
  minHeight: 80,
  outline: 'none',
  transition: 'all var(--duration-fast)',
  ':focus': {
    borderColor: 'var(--color-accent-dim)',
    boxShadow: '0 0 0 3px var(--color-accent-glow)',
  },
  '::placeholder': {
    color: 'var(--color-text-faint)',
  },
})

export const workflowFormInput = style({
  padding: 'var(--space-md) var(--space-lg)',
  fontFamily: fontSatoshi,
  fontSize: '1.1rem',
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  color: 'var(--color-text)',
  outline: 'none',
  ':focus': {
    borderColor: 'var(--color-accent-dim)',
    boxShadow: '0 0 0 3px var(--color-accent-glow)',
  },
  '::placeholder': {
    color: 'var(--color-text-faint)',
  },
})

// ============================================
//   PROGRESS INDICATOR
// ============================================

export const progressContainer = style({
  marginTop: 'var(--space-lg)',
  padding: 'var(--space-lg)',
  background: 'rgba(15, 23, 42, 0.6)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
})

export const progressMessage = style({
  fontSize: '0.9rem',
  color: 'var(--color-accent)',
  marginBottom: 'var(--space-sm)',
  fontWeight: 500,
})

export const progressBarContainer = style({
  height: 4,
  background: 'rgba(6, 182, 212, 0.2)',
  borderRadius: 2,
  overflow: 'hidden',
  marginBottom: 'var(--space-md)',
})

export const progressBar = style({
  height: '100%',
  background: 'linear-gradient(90deg, var(--color-accent), var(--color-gold))',
  borderRadius: 2,
  transition: 'width 0.3s ease',
})

export const candidatePreview = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--space-xs)',
  marginTop: 'var(--space-sm)',
})

export const previewLabel = style({
  fontSize: '0.75rem',
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
})

export const previewName = style({
  fontSize: '0.8rem',
  padding: '2px 8px',
  background: 'rgba(6, 182, 212, 0.15)',
  color: 'var(--color-text-secondary)',
  borderRadius: 'var(--radius-sm)',
})

export const previewMore = style({
  fontSize: '0.75rem',
  color: 'var(--color-text-muted)',
})

// ============================================
//   ERROR STATE
// ============================================

export const evalError = style({
  background: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  color: '#ef4444',
  padding: 'var(--space-md) var(--space-lg)',
  borderRadius: 'var(--radius-lg)',
  marginTop: 'var(--space-lg)',
  fontSize: '0.9rem',
  lineHeight: 1.5,
})

// ============================================
//   WORKFLOW RESULTS
// ============================================

export const workflowResults = style({
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-xl)',
  overflow: 'hidden',
  animation: `${resultAppear} 0.5s var(--ease-spring)`,
})

export const workflowSummary = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-md)',
  padding: 'var(--space-lg)',
  background: 'var(--color-bg-elevated)',
  borderBottom: '1px solid var(--color-border)',
  flexWrap: 'wrap',
  '@media': {
    '(max-width: 768px)': {
      flexDirection: 'column',
      gap: 'var(--space-sm)',
    },
  },
})

export const summaryStat = style({
  fontFamily: fontSatoshi,
  fontSize: '0.95rem',
  color: 'var(--color-text-secondary)',
})

globalStyle(`${summaryStat} strong`, {
  fontFamily: fontClash,
  fontSize: '1.5rem',
  color: 'var(--color-text)',
  display: 'inline-block',
  marginRight: 'var(--space-xs)',
})

export const summaryArrow = style({
  color: 'var(--color-accent)',
  fontSize: '1.2rem',
  '@media': {
    '(max-width: 768px)': {
      transform: 'rotate(90deg)',
    },
  },
})

export const recommendationCard = style({
  padding: 'var(--space-xl)',
  textAlign: 'center',
  background: `linear-gradient(180deg, rgba(6, 182, 212, 0.05) 0%, transparent 100%)`,
  borderBottom: '1px solid var(--color-border)',
})

export const recBadge = style({
  display: 'inline-block',
  padding: 'var(--space-xs) var(--space-md)',
  background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-gold) 100%)',
  color: 'white',
  fontFamily: fontSatoshi,
  fontSize: '0.7rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  borderRadius: 'var(--radius-md)',
  marginBottom: 'var(--space-md)',
})

export const recName = style({
  fontFamily: fontClash,
  fontSize: '2.5rem',
  fontWeight: 600,
  color: 'var(--color-text)',
  marginBottom: 'var(--space-sm)',
})

export const recScore = style({
  fontFamily: fontSatoshi,
  fontSize: '1.1rem',
  color: 'var(--color-text-secondary)',
  marginBottom: 'var(--space-xs)',
})

globalStyle(`${recScore} strong`, {
  color: 'var(--color-success)',
  fontWeight: 700,
})

export const recSource = style({
  fontFamily: fontSatoshi,
  fontSize: '0.85rem',
  color: 'var(--color-text-muted)',
})

// ============================================
//   CANDIDATES TABLE
// ============================================

export const candidatesTable = style({
  padding: 'var(--space-lg)',
  '@media': {
    '(max-width: 768px)': {
      overflowX: 'auto',
    },
  },
})

globalStyle(`${candidatesTable} h4`, {
  fontFamily: fontClash,
  fontSize: '1rem',
  fontWeight: 500,
  color: 'var(--color-text-muted)',
  marginBottom: 'var(--space-md)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
})

globalStyle(`${candidatesTable} table`, {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: fontSatoshi,
})

globalStyle(`${candidatesTable} th`, {
  textAlign: 'left',
  padding: 'var(--space-sm) var(--space-md)',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--color-text-muted)',
  borderBottom: '1px solid var(--color-border)',
})

globalStyle(`${candidatesTable} td`, {
  padding: 'var(--space-sm) var(--space-md)',
  fontSize: '0.9rem',
  color: 'var(--color-text-secondary)',
  borderBottom: '1px solid var(--color-border)',
})

globalStyle(`${candidatesTable} tr:last-child td`, {
  borderBottom: 'none',
})

globalStyle(`${candidatesTable} table`, {
  '@media': {
    '(max-width: 768px)': {
      minWidth: '500px',
    },
  },
})

export const filteredOut = style({
  opacity: 0.5,
})

export const clickable = style({
  cursor: 'pointer',
  transition: 'background 0.2s',
  ':hover': {
    background: 'rgba(6, 182, 212, 0.05)',
  },
})

export const expanded = style({
  background: 'rgba(6, 182, 212, 0.1)',
})

export const candidateName = style({
  fontWeight: 500,
  color: 'var(--color-text)',
})

export const starBadge = style({
  color: 'var(--color-gold)',
  marginRight: 'var(--space-xs)',
})

export const expandIcon = style({
  marginLeft: 'var(--space-sm)',
  fontSize: '0.7rem',
  color: 'var(--color-text-muted)',
  transition: 'transform 0.2s',
})

export const available = style({
  color: 'var(--color-success)',
})

export const unavailable = style({
  color: 'var(--color-error)',
})

export const domainLink = style({
  color: 'var(--color-success)',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  transition: 'opacity 0.2s',
  ':hover': {
    opacity: 0.8,
    textDecoration: 'underline',
  },
})

export const price = style({
  fontSize: '0.75rem',
  opacity: 0.8,
  fontWeight: 400,
})

// Details row
export const detailsRow = style({})

globalStyle(`${detailsRow} td`, {
  padding: '0 !important',
  background: 'rgba(15, 23, 42, 0.6)',
  borderBottom: '2px solid var(--color-accent) !important',
})

export const nameDetails = style({
  padding: 'var(--space-lg)',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 'var(--space-lg)',
})

export const detailSection = style({
  background: 'rgba(30, 41, 59, 0.5)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-md)',
  border: '1px solid var(--color-border)',
})

globalStyle(`${detailSection} h5`, {
  fontFamily: fontClash,
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--color-accent)',
  marginBottom: 'var(--space-sm)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
})

export const detailContent = style({
  fontSize: '0.85rem',
  color: 'var(--color-text-secondary)',
})

globalStyle(`${detailContent} p`, {
  margin: 'var(--space-xs) 0',
})

globalStyle(`${detailContent} strong`, {
  color: 'var(--color-text)',
})

export const assessment = style({
  marginTop: 'var(--space-sm)',
  fontStyle: 'italic',
  color: 'var(--color-text-muted)',
  fontSize: '0.8rem',
})

export const scoreGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 'var(--space-sm)',
})

export const scoreItem = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: 'var(--space-sm)',
  background: 'rgba(15, 23, 42, 0.5)',
  borderRadius: 'var(--radius-sm)',
})

export const scoreLabel = style({
  fontSize: '0.7rem',
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
})

export const scoreValue = style({
  fontFamily: fontClash,
  fontSize: '1.25rem',
  fontWeight: 600,
  color: 'var(--color-accent)',
})

export const internationalGrid = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--space-xs)',
})

export const langBadge = style({
  fontSize: '0.75rem',
  padding: '2px 8px',
  borderRadius: 'var(--radius-sm)',
  textTransform: 'capitalize',
})

export const langSafe = style({
  background: 'rgba(34, 197, 94, 0.2)',
  color: 'var(--color-success)',
})

export const langIssue = style({
  background: 'rgba(239, 68, 68, 0.2)',
  color: 'var(--color-error)',
})

export const socialGrid = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--space-xs)',
})

export const socialBadge = style({
  fontSize: '0.75rem',
  padding: '2px 8px',
  borderRadius: 'var(--radius-sm)',
  textTransform: 'capitalize',
})

export const socialAvailable = style({
  background: 'rgba(34, 197, 94, 0.2)',
  color: 'var(--color-success)',
})

export const socialTaken = style({
  background: 'rgba(239, 68, 68, 0.2)',
  color: 'var(--color-error)',
})

export const taglines = style({})

export const tagline = style({
  fontStyle: 'italic',
  color: 'var(--color-text)',
  margin: 'var(--space-xs) 0',
})

// ============================================
//   DISCLAIMER
// ============================================

export const evalDisclaimer = style({
  marginTop: 'var(--space-lg)',
  padding: 'var(--space-md)',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontFamily: fontSatoshi,
  fontSize: '0.75rem',
  color: 'var(--color-text-muted)',
  textAlign: 'center',
  lineHeight: 1.5,
})

// ============================================
//   FEATURES SECTION
// ============================================

export const features = style({
  textAlign: 'center',
})

globalStyle(`${features} h2`, {
  fontFamily: fontClash,
  fontSize: 'clamp(2rem, 5vw, 3rem)',
  fontWeight: 600,
  letterSpacing: '-0.03em',
  marginBottom: 'var(--space-md)',
})

globalStyle(`${features} > p`, {
  color: 'var(--color-text-secondary)',
  fontSize: '1.15rem',
  maxWidth: 600,
  margin: '0 auto var(--space-3xl)',
})

export const featuresGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 'var(--space-lg)',
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
})

export const featureCard = style({
  padding: 'var(--space-xl)',
  background: 'var(--color-bg-card)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-xl)',
  textAlign: 'left',
  transition: 'all var(--duration-normal) var(--ease-out)',
  position: 'relative',
  overflow: 'hidden',
  '::before': {
    content: '""',
    position: 'absolute',
    inset: -1,
    background: 'linear-gradient(135deg, var(--color-accent) 0%, transparent 50%)',
    borderRadius: 'inherit',
    opacity: 0,
    transition: 'opacity var(--duration-normal)',
    zIndex: -1,
  },
  '::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'var(--color-bg-card)',
    borderRadius: 'calc(var(--radius-xl) - 1px)',
    zIndex: -1,
  },
  ':hover': {
    transform: 'translateY(-4px)',
    borderColor: 'transparent',
  },
})

globalStyle(`${featureCard}:hover::before`, {
  opacity: 1,
})

export const featureIcon = style({
  width: 48,
  height: 48,
  marginBottom: 'var(--space-lg)',
  padding: 'var(--space-sm)',
  background: 'var(--color-accent-glow)',
  borderRadius: 'var(--radius-lg)',
  color: 'var(--color-accent)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

globalStyle(`${featureIcon} svg`, {
  width: '100%',
  height: '100%',
})

globalStyle(`${featureCard} h3`, {
  fontFamily: fontClash,
  fontSize: '1.25rem',
  fontWeight: 600,
  marginBottom: 'var(--space-sm)',
  letterSpacing: '0.01em',
  wordSpacing: '0.05em',
})

globalStyle(`${featureCard} p`, {
  fontFamily: fontSatoshi,
  fontSize: '1rem',
  color: 'var(--color-text-secondary)',
  lineHeight: 1.6,
})

// ============================================
//   HOW IT WORKS SECTION
// ============================================

export const howItWorks = style({
  background: 'var(--color-bg-elevated)',
  borderTop: '1px solid var(--color-border)',
  borderBottom: '1px solid var(--color-border)',
})

globalStyle(`${howItWorks} h2`, {
  fontFamily: fontClash,
  fontSize: 'clamp(2rem, 5vw, 3rem)',
  fontWeight: 600,
  letterSpacing: '-0.03em',
  textAlign: 'center',
  marginBottom: 'var(--space-3xl)',
})

export const steps = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 'var(--space-xl)',
  position: 'relative',
  '::before': {
    content: '""',
    position: 'absolute',
    top: 48,
    left: 'calc(16.67% + 24px)',
    right: 'calc(16.67% + 24px)',
    height: 2,
    background: `linear-gradient(90deg, var(--color-border) 0%, var(--color-accent) 50%, var(--color-border) 100%)`,
  },
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: 'var(--space-2xl)',
    },
  },
})

globalStyle(`${steps}::before`, {
  '@media': {
    '(max-width: 768px)': {
      display: 'none',
    },
  },
})

export const step = style({
  textAlign: 'center',
  position: 'relative',
})

export const stepNumber = style({
  width: 48,
  height: 48,
  margin: '0 auto var(--space-lg)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--color-bg)',
  border: '2px solid var(--color-accent)',
  borderRadius: '50%',
  fontFamily: fontClash,
  fontSize: '1.25rem',
  fontWeight: 700,
  color: 'var(--color-accent)',
  position: 'relative',
  zIndex: 1,
})

globalStyle(`${step} h3`, {
  fontFamily: fontClash,
  fontSize: '1.15rem',
  fontWeight: 600,
  marginBottom: 'var(--space-sm)',
})

globalStyle(`${step} p`, {
  fontFamily: fontSatoshi,
  fontSize: '0.95rem',
  color: 'var(--color-text-secondary)',
  lineHeight: 1.6,
})

// ============================================
//   CTA SECTION
// ============================================

export const cta = style({
  textAlign: 'center',
  padding: 'var(--space-4xl) var(--space-lg)',
  position: 'relative',
  '::before': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 800,
    height: 400,
    background: `
      radial-gradient(ellipse at center bottom, var(--color-accent-glow) 0%, transparent 60%),
      radial-gradient(ellipse at 30% 100%, var(--color-gold-glow) 0%, transparent 40%),
      radial-gradient(ellipse at 70% 80%, var(--color-indigo-glow) 0%, transparent 50%)`,
    pointerEvents: 'none',
  },
})

globalStyle(`${cta} h2`, {
  fontFamily: fontClash,
  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
  fontWeight: 600,
  letterSpacing: '-0.03em',
  marginBottom: 'var(--space-md)',
  position: 'relative',
  zIndex: 1,
})

globalStyle(`${cta} p`, {
  fontFamily: fontSatoshi,
  fontSize: '1.2rem',
  color: 'var(--color-text-secondary)',
  marginBottom: 'var(--space-xl)',
  position: 'relative',
  zIndex: 1,
})

export const ctaButtons = style({
  display: 'flex',
  gap: 'var(--space-md)',
  justifyContent: 'center',
  flexWrap: 'wrap',
  position: 'relative',
  zIndex: 1,
  '@media': {
    '(max-width: 480px)': {
      flexDirection: 'column',
      width: '100%',
      padding: '0 var(--space-md)',
    },
  },
})

// ============================================
//   FOOTER
// ============================================

export const footer = style({
  textAlign: 'center',
  padding: 'var(--space-2xl) var(--space-lg)',
  borderTop: '1px solid var(--color-border)',
  marginTop: 'var(--space-2xl)',
})

export const footerTagline = style({
  fontFamily: fontSatoshi,
  fontSize: '0.85rem',
  color: 'var(--color-text-muted)',
  marginBottom: 'var(--space-sm)',
})

export const footerLinks = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 'var(--space-sm)',
  flexWrap: 'wrap',
})

globalStyle(`${footerLinks} a`, {
  fontFamily: fontSatoshi,
  fontSize: '0.8rem',
  color: 'var(--color-text-secondary)',
  textDecoration: 'none',
  transition: 'color 0.2s ease',
})

globalStyle(`${footerLinks} a:hover`, {
  color: 'var(--color-accent)',
})

export const footerSep = style({
  color: 'var(--color-text-muted)',
  fontSize: '0.7rem',
})

// ============================================
//   RESPONSIVE (section overrides)
// ============================================

globalStyle(`${home} section`, {
  '@media': {
    '(max-width: 768px)': {
      padding: 'var(--space-3xl) var(--space-md)',
    },
  },
})
