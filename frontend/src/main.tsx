import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import {Landing} from './pages/landing'
import Login from './pages/login'
import Verify from './components/verify'
import Register from './pages/register'
import Dashboard from './pages/dashboard'
import VideoCall from './pages/VideoCall'
import ContactUs from './components/ContactUs'
import CollegeVerification from './components/CollegeVerification'


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/' element={<Login/>}/>
      <Route path='/register' element={<Register/>}/>
      <Route path='/verify' element={<Verify/>}/>
      <Route path='/dashboard' element={<Dashboard/>}/>
      <Route path='/landing' element={<Landing/>} />
      <Route path='/video-call' element={<VideoCall/>} />
      <Route path='/contact' element={<ContactUs/>} />
      <Route path='/verify-college' element={<CollegeVerification/>} />
    </>
  ) 
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
