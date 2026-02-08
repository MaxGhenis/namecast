import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import HomePage from '../pages/HomePage'

const renderHomePage = () => {
  return render(
    <BrowserRouter basename="">
      <HomePage />
    </BrowserRouter>
  )
}

describe('HomePage', () => {
  it('displays the oracle badge', () => {
    renderHomePage()
    expect(screen.getByText('Brand Name Oracle')).toBeInTheDocument()
  })

  it('displays the main headline', () => {
    renderHomePage()
    expect(screen.getByText(/Future Success/i)).toBeInTheDocument()
  })

  it('shows password input for beta access', () => {
    renderHomePage()
    expect(screen.getByText('Beta password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter access password/i)).toBeInTheDocument()
  })

  it('shows workflow form', () => {
    renderHomePage()
    expect(screen.getByPlaceholderText(/Describe your project/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Your name ideas/i)).toBeInTheDocument()
  })

  it('allows typing in the project description', () => {
    renderHomePage()
    const textarea = screen.getByPlaceholderText(/Describe your project/i) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'A SaaS tool for tracking carbon emissions' } })
    expect(textarea.value).toBe('A SaaS tool for tracking carbon emissions')
  })

  it('displays feature cards', () => {
    renderHomePage()
    expect(screen.getByText(/Domain & social availability/i)).toBeInTheDocument()
    expect(screen.getByText('Similar company check')).toBeInTheDocument()
    expect(screen.getByText('AI perception forecasting')).toBeInTheDocument()
  })

  it('displays how it works section', () => {
    renderHomePage()
    expect(screen.getByText('How it works')).toBeInTheDocument()
    expect(screen.getByText('Cast your names')).toBeInTheDocument()
    expect(screen.getByText('Receive the forecast')).toBeInTheDocument()
    expect(screen.getByText('Choose your destiny')).toBeInTheDocument()
  })

  it('displays the CTA section', () => {
    renderHomePage()
    expect(screen.getByText(/See your name.*future/i)).toBeInTheDocument()
    expect(screen.getByText('Consult the oracle')).toBeInTheDocument()
  })

  it('has a secondary CTA for GitHub', () => {
    renderHomePage()
    expect(screen.getByText('View on GitHub')).toBeInTheDocument()
  })
})
