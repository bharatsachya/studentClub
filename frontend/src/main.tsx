import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import {Landing} from './components/landing'
import Login from './components/login'
import Verify from './components/verify'
import Club from './components/club'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
       <Route path='/landing' element={<Landing/>} />
       {/* <Route path='/room' element={<Room/>} /> */}
       <Route path='/' element={<Login/>}/>
       <Route path='/verify' element={<Verify/>}/>
       <Route path='/club' element={<Club/>}/>
    </Route>
  ) 
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
