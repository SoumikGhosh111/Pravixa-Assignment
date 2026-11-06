import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
// import './App.css'x
import {router} from './routes'
import { RouterProvider } from 'react-router-dom'
function App() {
  const [count, setCount] = useState(0)

  return (
   <>
    <RouterProvider router={router}/>
   </>
  )
}

export default App
