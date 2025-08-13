import { render, screen } from '@testing-library/react';
import App from './App';

test('renders double-view calendar with April visible', () => {
  render(<App />);
  // Look for month header text "April"
  const monthElement = screen.getByText(/April/i);
  expect(monthElement).toBeInTheDocument();
});
