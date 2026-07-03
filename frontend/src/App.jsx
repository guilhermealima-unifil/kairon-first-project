import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import POS from './pages/POS'
import Analytics from './pages/Analytics'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="produtos" element={<Products />} />
          <Route path="clientes" element={<Customers />} />
          <Route path="clientes/:id" element={<CustomerDetail />} />
          <Route path="caixa" element={<POS />} />
          <Route path="relatorios" element={<Analytics />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
