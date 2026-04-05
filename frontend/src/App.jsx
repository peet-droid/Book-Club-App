import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './routes/RootLayout';
import Home from './routes/Home';
import MembersList from './routes/MembersList';
import MemberDetail from './routes/MemberDetail';
import BooksList from './routes/BooksList';
import BookDetail from './routes/BookDetail';
import Lending from './routes/Lending';
import Search from './routes/Search';
import GroupsList from './routes/GroupsList';
import GroupDetail from './routes/GroupDetail';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'members', element: <MembersList /> },
      { path: 'members/:id', element: <MemberDetail /> },
      { path: 'books', element: <BooksList /> },
      { path: 'books/:id', element: <BookDetail /> },
      { path: 'lending/*', element: <Lending /> },
      { path: 'search', element: <Search /> },
      { path: 'groups', element: <GroupsList /> },
      { path: 'groups/:id', element: <GroupDetail /> }
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
