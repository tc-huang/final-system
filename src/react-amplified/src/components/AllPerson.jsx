import { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';

import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';

// import { gMapToObject, } from '../utility/GraphSON';






function TitlebarBelowImageList(props) {
    const [data, setData] = useState(props.category_data);
    const category = props.category;
    
    if (!data) return "No data!";

    return (
        <ImageList sx={{ width: 1 / 1, height: 900 }} cols={7}>
            {data.map((item) => (
                <ImageListItem key={item['name']} component={Link} to={'/person/' + item['name']}>
                    <img
                        src={item['daily_image_url'] + "?w=248&fit=crop&auto=format"}
                        srcSet={item['daily_image_url'] + "?w=248&fit=crop&auto=format&dpr=2 2x"}
                        alt={item['name']}
                        loading="lazy"
                    />
                    <ImageListItemBar
                        title={item['name']}
                        subtitle={
                            <div>
                                <p>{item['daily_category']}</p>
                                <p>{item['title'] && "任職於"+item['title']}</p>
                                <p>{item['party'] && item['party']}</p>
                            </div>
                        }
                        position="bottom"
                        key={item['name']}
                    />
                </ImageListItem>
            ))}
        </ImageList>
    );
}

export default function AllPerson(props) {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [person_data, setPersonData] = useState({});

    const category_list = ['政治人物', '地方首長', '立法委員', '陳揆內閣', '台北市議員', '高雄市議員', '政論名嘴'];
    const post_url = "https://g60lj6ls7h.execute-api.us-east-1.amazonaws.com/Prod/person"


    useEffect(() => {
        // for cetera in category_list:
        for (let i = 0; i < category_list.length; i++) {
            fetch(post_url, { method: 'POST' , body: JSON.stringify({'category': category_list[i]})})
                .then((response) => response.json())
                .then((data) => {
                    person_data[category_list[i]] = data['body'];
                    setLoading(false);
                })
                .catch((error) => {
                    setError(error);
                    setLoading(false);
                });
        } 
    }, []);
    if (loading) return "Loading...";
    if (error) return "Error!";
    if (person_data) return "No data!";

    return (
        <div className="all-person">
            <h1>所有人物</h1>
            <h2>政治人物 ({person_data['政治人物'].length} 人)</h2>
            <TitlebarBelowImageList category='政治人物' category_data={person_data['政治人物']}></TitlebarBelowImageList>
            <h2>地方首長 ({person_data['地方首長'].length} 人)</h2>
            <TitlebarBelowImageList category='地方首長' category_data={person_data['']}></TitlebarBelowImageList>
            <h2>立法委員 ({person_data['立法委員'].length} 人)</h2>
            <TitlebarBelowImageList category='立法委員' category_data={person_data['']}></TitlebarBelowImageList>
            <h2>蘇揆內閣 ({person_data['陳揆內閣'].length} 人)</h2>
            <TitlebarBelowImageList category='陳揆內閣' category_data={person_data['']}></TitlebarBelowImageList>
            <h2>台北市議員 ({person_data['台北市議員'].length} 人)</h2>
            <TitlebarBelowImageList category='台北市議員' category_data={person_data['']}></TitlebarBelowImageList>
            <h2>高雄市議員 ({person_data['高雄市議員'].length} 人)</h2>
            <TitlebarBelowImageList category='高雄市議員' category_data={person_data['']}></TitlebarBelowImageList>
            <h2>政論名嘴 ({person_data['政論名嘴'].length} 人)</h2>
            <TitlebarBelowImageList category='政論名嘴' category_data={person_data['']}></TitlebarBelowImageList>
        </div>
    );
}