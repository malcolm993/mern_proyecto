// src/App.tsx
import { ConfigProvider } from 'antd'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' // ✅ Corregido a @tanstack
import { BrowserRouter } from 'react-router-dom'
import { antdTheme } from './styles/antd-theme'


import AppRoutes from './AppRoutes' // ✅ Ahora este archivo existe
import './styles/global.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antdTheme}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  )
}

export default App