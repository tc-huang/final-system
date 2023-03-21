import {
    useState,
    useEffect
} from 'react';

import { useParams } from 'react-router-dom';


let end_point = "https://g60lj6ls7h.execute-api.us-east-1.amazonaws.com/Prod";

export default function News(props) {

    let param = useParams();
    const [news_id, setNewsId] = useState(param.news_id);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    let gremlin_cmd = `g.V('${news_id}').hasLabel('news')`

    useEffect(() => {
        fetch(`${end_point}?gremlin=${gremlin_cmd}`, { method: 'POST' })
            .then(res => res.json())
            .then(
                (result) => {
                    setLoading(false);
                    setData(result);
                    console.log(result);
                },
                (error) => {
                    setLoading(false);
                    setError(error);
                }
            )
    }
        , [news_id]);

    if (loading) return "Loading...";
    if (error) return "Error!";
    if (!data) return "No data!";
    return (
        <>
            {/* <h1>{data['title']}</h1>
            <p>{data['content']}</p> */}
        </>
    );
}
