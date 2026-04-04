import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './routes/RootLayout';
import Home from './routes/Home';
import Members from './routes/Members';
import Books from './routes/Books';
import Lending from './routes/Lending';
import Search from './routes/Search';
import Groups from './routes/Groups';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'members/*', element: <Members /> },
      { path: 'books/*', element: <Books /> },
      { path: 'lending/*', element: <Lending /> },
      { path: 'search', element: <Search /> },
      { path: 'groups/*', element: <Groups /> }
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
