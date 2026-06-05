import { ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../lib/i18n';

export function changeLanguage(lng: string) {
  return i18n.changeLanguage(lng);
}

export function renderWithProviders(
  ui: ReactNode,
  options?: RenderOptions & { route?: string; language?: string },
) {
  const { route = '/', language = 'fr', ...renderOptions } = options ?? {};

  if (language !== i18n.language) {
    i18n.changeLanguage(language);
  }

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <HelmetProvider>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </I18nextProvider>
      </HelmetProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export { screen } from '@testing-library/react';
