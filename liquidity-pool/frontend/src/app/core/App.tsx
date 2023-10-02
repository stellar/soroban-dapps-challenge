import React from 'react'

import { AppProvider } from './context/appContext'
import { CoreRouter } from 'app/core/routes'

import ErrorBoundary from './error-boundary'

const App = (): JSX.Element => (
  <ErrorBoundary displayMessage="Ooooppss... An unexpected error occured">
    <AppProvider>
      <CoreRouter />
    </AppProvider>
  </ErrorBoundary>
)

export default App
