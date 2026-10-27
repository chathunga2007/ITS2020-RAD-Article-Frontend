// import { BrowserRouter, Route, Routes } from "react-router-dom"
// import Register from "./pages/Register"
// import Login from "./pages/Login"
// import Home from "./pages/Home"

import AuthProvider from "./context/AuthContext"
import Router from "./router"

function App() {
  return (
    // <BrowserRouter>
    //   <Routes>
    //     <Route path="/register" element={<Register />} />
    //     <Route path="/login" element={<Login />} />
    //     <Route path="/home" element={<Home />} />
    //   </Routes>
    // </BrowserRouter>
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}

export default App