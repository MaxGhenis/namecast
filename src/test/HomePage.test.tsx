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

  it('has a brand name input field', () => {
    renderHomePage()
    const input = screen.getByPlaceholderText(/Enter a brand name/i)
    expect(input).toBeInTheDocument()
  })

  it('allows typing in the brand name input', () => {
    renderHomePage()
    const input = screen.getByPlaceholderText(/Enter a brand name/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'TestBrand' } })
    expect(input.value).toBe('TestBrand')
  })

  it('displays feature cards', () => {
    renderHomePage()
    expect(screen.getByText(/Domain.*Social Availability/i)).toBeInTheDocument()
    expect(screen.getByText('Similar Company Check')).toBeInTheDocument()
    expect(screen.getByText('AI Perception Forecasting')).toBeInTheDocument()
  })

  it('displays how it works section', () => {
    renderHomePage()
    expect(screen.getByText('How It Works')).toBeInTheDocument()
    expect(screen.getByText('Cast Your Names')).toBeInTheDocument()
    expect(screen.getByText('Receive the Forecast')).toBeInTheDocument()
    expect(screen.getByText('Choose Your Destiny')).toBeInTheDocument()
  })

  it('displays the CTA section', () => {
    renderHomePage()
    expect(screen.getByText(/See Your Name.*Future/i)).toBeInTheDocument()
    expect(screen.getByText('Consult the Oracle')).toBeInTheDocument()
  })
})
