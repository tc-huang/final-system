import {
    useState,
    useEffect

 }from "react";
import { useParams } from "react-router-dom";
import Highlighter from "react-highlight-words";

export default function KeywordInParagraph(props) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    let params = useParams();
    let keyword = params.keyword;

    
    const end_point = "https://g60lj6ls7h.execute-api.us-east-1.amazonaws.com/Prod"
    const date_list_str = "\
'2022-11-06','2022-11-07','2022-11-08','2022-11-09','2022-11-10','2022-11-11','2022-11-12', \
'2022-11-13','2022-11-14','2022-11-15','2022-11-16','2022-11-17', '2022-11-18','2022-11-19',\
'2022-11-20','2022-11-21','2022-11-22','2022-11-23','2022-11-24','2022-11-25','2022-11-26','2022-11-27'\
";

    useEffect(() => {
        let germlin_cmd = `\
g.V().hasLabel('title').has('date', within(${date_list_str}))\
.out('title_to_paragraph').hasLabel('paragraph').has('text', containing('${keyword}')).as('opinion_vertex').values('text').fold()\
        `
        let post_url = end_point + "?gremlin=" + germlin_cmd;
        fetch(post_url, { method: 'POST' })
            .then((response) => response.json())
            .then((data) => {
                setData(
                    data['response']['result']['data']['@value'][0]['@value']
                );
                // console.log(data);
                setLoading(false);
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            });
        
    }, []);
    if (loading) return "Loading...";
    if (error) return "Error!";
    if (!data) return "No data!";
    // console.log(data);


    return (
        <>
            <h1>更改網址最後搜尋其他關鍵字</h1>
            <h1>KeywordInParagraph {keyword}</h1>
            <ul>
            {
                data.map((val) => {
                    return(
                        <li>
                            <Highlighter
                                highlightClassName="YourHighlightClass"
                                searchWords={[keyword]}
                                autoEscape={true}
                                textToHighlight={val}
                            />
                            <div></div>
                            <div></div>
                        </li>
                    );
                })
            }
            </ul>
        </>
    );
}