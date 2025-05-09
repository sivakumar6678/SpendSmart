import { BrowserRouter as Router, Routes, Route, useRoutes } from 'react-router-dom';
import Dashboard from '../src/Dashboard Component';
import './App.css'
import HomeComponent from './Home Component';
import AppContext from './Dashboard Component/context/AppContext';
export function CustomRoutes() {
  const element = useRoutes([
    {
      path: '/', element: <HomeComponent />
    },
    {
      path: '/dashboard', element: <Dashboard />
    },
    {
      path:'/app-content' ,element : <AppContext />
    }
  ]);
  return element;
}
function App() {
  return (
    <div>
      {/* <h1>App Component</h1> */}
      <CustomRoutes />
    </div>
  )
}

export default App;
