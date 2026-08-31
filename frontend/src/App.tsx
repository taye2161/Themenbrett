import { Routes, Route } from 'react-router'
import './App.css'
import { PageIndex } from './components/PageIndex'
import { PageGebiet } from './components/PageGebiet'
import { PageThema } from './components/PageThema'
import { PageAdmin } from './components/PageAdmin'
import { PagePrefs } from './components/PagePrefs'
import { AppMenu } from './components/AppMenu'
import { Navigate } from "react-router";


function App() {
  return (
      <div>

        <AppMenu/>

        <Routes>
          <Route path="/" element={<PageIndex/>}/>
          <Route path="/gebiet/:id" element={<PageGebiet/>} />
          <Route path="/thema/:themaId" element={<PageThema/>} />
          <Route path="/gebiet/:gebietId/thema/neu" element={<PageThema />} />
          <Route path="/admin" element={<PageAdmin/>} />
          <Route path="/prefs" element={<PagePrefs/>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    
  )
}

export default App
