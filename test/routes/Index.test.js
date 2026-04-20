import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { MemoryRouter } from 'react-router';
import Euss from '../../src/routes/index';

jest.mock('hof-genesys-chat-component', () => ({
  GenesysChatComponent: jest.fn(() => <div data-testid="genesys-chat-component" />),
}));

const { GenesysChatComponent } = require('hof-genesys-chat-component');

const renderComponentWithRouter = (component) => render(
  <MemoryRouter>
    {component}
  </MemoryRouter>
);

describe('Euss page', () => {
  test('renders Euss page with correct content', () => {
    renderComponentWithRouter(<Euss />);

    expect(screen.getByRole('heading', { name: 'Home Office EUSS Chat' })).toBeInTheDocument();
    expect(screen.getByText((content) => /Ask our digital assistant about the EUSS \(EU Settlement Service\)\./i.test(content))).toBeInTheDocument();
    expect(screen.getByTestId('genesys-chat-component')).toBeInTheDocument();
  });

  test('renders error component when error occurs', async () => {
    // Mock GenesysChatComponent to call errorCallback after mount
    GenesysChatComponent.mockImplementation((props) => {
      useEffect(() => {
        props.errorCallback?.();
      }, [props.errorCallback]);

      return <div data-testid="genesys-chat-component" />;
    });

    renderComponentWithRouter(<Euss />);

    await waitFor(() => {
      expect(screen.getByTestId('error-contact-form')).toBeInTheDocument();
    });

    // Ensure chat component is not rendered
    expect(screen.queryByTestId('genesys-chat-component')).not.toBeInTheDocument();
  });
});
