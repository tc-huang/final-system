import { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';

// import { Divider } from "antd";

import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';



function TitlebarBelowImageList(props) {
    const [categorydata, setCategoryData] = useState(props.category_data);
    const [category, setCategory] = useState(props.category);

    useEffect(() => {
        setCategoryData(props.category_data);
        setCategory(props.category);
    }, [props.category_data, props.category]);
    
    if (!categorydata) return "No data!";

    return (
        <>
            <h2>{category} ({categorydata.length} 人)</h2>
            <ImageList sx={{ width: 1 / 1, height: 900 }} cols={7}>
                {categorydata.map((item) => (
                    <>
                        {/* <p>{item['daily_image_url']}</p> */}
                        <ImageListItem key={item['name']} component={Link} to={'/person/' + item['name']}>
                            <img
                                src={item['dailyview_image_url'] + "?w=248&fit=crop&auto=format"}
                                srcSet={item['dailyview_image_url'] + "?w=248&fit=crop&auto=format&dpr=2 2x"}
                                alt={item['name']}
                                loading="lazy"
                            />
                            <ImageListItemBar
                                title={item['name']}
                                subtitle={
                                    <div>
                                        <p>{item['dailyview_category']}</p>
                                        <p>{item['title'] && "任職於"+item['title']}</p>
                                        <p>{item['party'] && item['party']}</p>
                                    </div>
                                }
                                position="bottom"
                                key={item['name']}
                            />
                        </ImageListItem>
                    </>
                ))}
            </ImageList>
        </>
    );
}

export default function AllPerson(props) {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [person_data, setPersonData] = useState({});

    const category_list = ['政治人物', '地方首長', '立法委員', '陳揆內閣', '台北市議員', '高雄市議員', '政論名嘴'];
    const post_url = "https://6pd8cpbd2g.execute-api.us-east-1.amazonaws.com/Prod/person?category="


    useEffect(() => {
        for (let i = 0; i < category_list.length; i++) {
            fetch(post_url + category_list[i], { method: 'POST'})
                .then((response) => response.json())
                .then((data) => {
                    console.log()
                    setPersonData((person_data) => ({...person_data, [category_list[i]]: data}));
                    setLoading(false);
                    console.log(category_list[i])
                })
                // .catch((error) => {
                //     setError(error);
                //     setLoading(false)
                // });
        }
    }, []);


    if (loading) return "Loading...";
    // if (error) return "Error!";
    // if (person_data) return "No data!";
    

    return (
        <div className="all-person">
            {/* <Divider orientation="left">所有人物</Divider> */}
            <TitlebarBelowImageList category='政治人物' category_data={person_data['政治人物']}></TitlebarBelowImageList>
            <TitlebarBelowImageList category='地方首長' category_data={person_data['地方首長']}></TitlebarBelowImageList>
            <TitlebarBelowImageList category='立法委員' category_data={person_data['立法委員']}></TitlebarBelowImageList>
            <TitlebarBelowImageList category='陳揆內閣' category_data={person_data['陳揆內閣']}></TitlebarBelowImageList>
            <TitlebarBelowImageList category='台北市議員' category_data={person_data['台北市議員']}></TitlebarBelowImageList>
            <TitlebarBelowImageList category='高雄市議員' category_data={person_data['高雄市議員']}></TitlebarBelowImageList>
            <TitlebarBelowImageList category='政論名嘴' category_data={person_data['政論名嘴']}></TitlebarBelowImageList>
        </div>
    );
}