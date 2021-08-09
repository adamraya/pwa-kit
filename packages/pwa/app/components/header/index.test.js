import React from 'react'
import {fireEvent} from '@testing-library/react'
import Header from './index'
import {renderWithProviders} from '../../utils/test-utils'

test('renders Header', () => {
    renderWithProviders(<Header />)
    const menu = document.querySelector('button[aria-label="Menu"]')
    const logo = document.querySelector('button[aria-label="Logo"]')
    const account = document.querySelector('button[aria-label="My account"]')
    const cart = document.querySelector('button[aria-label="My cart"]')
    const searchInput = document.querySelector('input[type="search"]')
    expect(menu).toBeInTheDocument()
    expect(logo).toBeInTheDocument()
    expect(account).toBeInTheDocument()
    expect(cart).toBeInTheDocument()
    expect(searchInput).toBeInTheDocument()
})

test('renders Header with event handlers', () => {
    const onMenuClick = jest.fn()
    const onLogoClick = jest.fn()
    const onMyAccountClick = jest.fn()
    const onMyCartClick = jest.fn()
    const onSearchChange = jest.fn()
    const onSearchSubmit = jest.fn()
    renderWithProviders(
        <Header
            onMenuClick={onMenuClick}
            onLogoClick={onLogoClick}
            onMyAccountClick={onMyAccountClick}
            onMyCartClick={onMyCartClick}
            onSearchChange={onSearchChange}
            onSearchSubmit={onSearchSubmit}
        />
    )
    const menu = document.querySelector('button[aria-label="Menu"]')
    const logo = document.querySelector('button[aria-label="Logo"]')
    const account = document.querySelector('button[aria-label="My account"]')
    const cart = document.querySelector('button[aria-label="My cart"]')
    const searchInput = document.querySelector('input[type="search"]')
    const form = document.querySelector('form')

    fireEvent.click(menu)
    expect(onMenuClick).toHaveBeenCalledTimes(1)
    fireEvent.click(logo)
    expect(onLogoClick).toHaveBeenCalledTimes(1)
    fireEvent.click(account)
    expect(onMyAccountClick).toHaveBeenCalledTimes(1)
    fireEvent.click(cart)
    expect(onMyCartClick).toHaveBeenCalledTimes(1)
    fireEvent.change(searchInput, {target: {value: '123'}})
    expect(searchInput.value).toBe('123')
    expect(onSearchChange).toHaveBeenCalledTimes(1)
    fireEvent.submit(form)
    expect(onSearchSubmit).toHaveBeenCalledTimes(1)
    expect(onSearchSubmit).toHaveBeenCalledWith(expect.anything(), '123')
})
