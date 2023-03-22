import React from "react";
import ReactDOM from "react-dom/client";

import {
    createBrowserRouter,
    RouterProvider,

} from "react-router-dom";

import ErrorPage from "./error-page";
import Root from "./routes/root";



// import DashBoard from './components/DashBoard';
import AllPerson from "./components/AllPerson";
import Person from "./components/Person";
import Cluster from "./components/Cluster";


import TodaysNews from "./components/TodaysNews";
// import About from "./components/About";
// import News from "./components/News";
// import Election from "./components/Election";
// import Keyword from "./components/Keyword";
// import Keyword_in_paragraph from "./components/Keyword_in_paragraph";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
        //     {
        //         path: "/about",
        //         element: <About />,
        //         errorElement: <ErrorPage />,
        //     },
        //     {
        //         path: "dashboard",
        //         element: <DashBoard />,
        //         errorElement: <ErrorPage />,
        //     },
            {
                path: "todays-news",
                element: <TodaysNews />,
                errorElement: <ErrorPage />,
            },
            {
                path: "all-person",
                element: <AllPerson />,
                errorElement: <ErrorPage />,
            },
            {
                path: "person/:name",
                element: <Person />,
                errorElement: <ErrorPage />,
            },
            {
                path: "cluster",
                element: <Cluster />,
                errorElement: <ErrorPage />,
            }
        //     {
        //         path: "news/:news_id",
        //         element: <News />,
        //         errorElement: <ErrorPage />,
        //     },
        //     {
        //         path: "election",
        //         element: <Election />,
        //         errorElement: <ErrorPage />,
        //     },
        //     {
        //         path: "keyword/:keyword",
        //         element: <Keyword />,
        //         errorElement: <ErrorPage />,
        //     },
        //     {
        //         path: "keyword_in_paragraph/:keyword",
        //         element: <Keyword_in_paragraph />,
        //         errorElement: <ErrorPage />,
        //     }
        ],
    },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);