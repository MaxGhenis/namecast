import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders the Namecast logo/nav', () => {
    render(<App />)
    expect(screen.getByText('Namecast')).toBeInTheDocument()
  })

  it('renders the hero section', () => {
    render(<App />)
    expect(screen.getByText(/Forecast Your Name/i)).toBeInTheDocument()
  })

  it('renders the demo input', () => {
    render(<App />)
    expect(screen.getByPlaceholderText(/Enter a brand name/i)).toBeInTheDocument()
  })
})
