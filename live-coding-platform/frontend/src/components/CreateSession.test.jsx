import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateSession from './CreateSession';
import { vi } from 'vitest';

global.fetch = vi.fn();

describe('CreateSession', () => {
    it('renders start button', () => {
        render(
            <BrowserRouter>
                <CreateSession />
            </BrowserRouter>
        );
        expect(screen.getByText(/Start New Interview/i)).toBeInTheDocument();
    });
});
