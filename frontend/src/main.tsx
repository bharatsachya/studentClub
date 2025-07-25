import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import {Landing} from './pages/landing'
import Login from './pages/login'
import Verify from './components/verify'


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
       <Route path='/landing' element={<Landing/>} />
       {/* <Route path='/room' element={<Room/>} /> */}
       <Route path='/' element={<Login/>}/>
       <Route path='/verify' element={<Verify/>}/>

    </Route>
  ) 
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
