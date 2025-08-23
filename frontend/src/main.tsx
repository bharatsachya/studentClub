import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import {Landing} from './pages/landing'
import Login from './pages/login'
import Verify from './components/verify'
import Register from './pages/register'
import Dashboard from './pages/dashboard'


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<Login/>}/>
      <Route path='/register' element={<Register/>}/>
      <Route path='/verify' element={<Verify/>}/>
      <Route path='/dashboard' element={<Dashboard/>}/>
      <Route path='/landing' element={<Landing/>} />
    </>
  ) 
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
