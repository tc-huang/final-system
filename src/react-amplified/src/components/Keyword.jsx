import {
    useState,
    useEffect
} from 'react';


import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent, {
    timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';


import {
    gMapToObject,
} from '../utility/GraphSON';
import Typography from '@mui/material/Typography';

import { Divider } from 'antd';
import { Menu } from 'antd';
import { FileOutlined } from '@ant-design/icons';


import { useParams } from 'react-router-dom';

let end_point = "https://g60lj6ls7h.execute-api.us-east-1.amazonaws.com/Prod"



function OppositeContentTimeline(props) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

    const date_list_str = "'2022-11-20','2022-11-21','2022-11-22','2022-11-23','2022-11-24','2022-11-25','2022-11-26','2022-11-27'";



    useEffect(() => {
        let germlin_cmd = `\
        g.V().hasLabel('opinion').has('OPINION_list', containing('${props.key_word}')).as('opinion_vertex')\
        .in('paragraph_to_opinion').as('paragraph_vertex')
        .in('title_to_paragraph').has('date', within(${date_list_str})).as('title_vertex').order().by('time',desc)\
        .select('opinion_vertex', 'paragraph_vertex', 'title_vertex')\
        .by(valueMap('WHO', 'VERB', 'OPINION_list')).by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url'))\
        `
        let post_url = end_point + "?gremlin=" + germlin_cmd;
        fetch(post_url, { method: 'POST' })
            .then((response) => response.json())
            .then((data) => {
                let gMap_list = data['response']['result']['data']['@value'];
                setData(
                    gMap_list.map((val) => {
                        let temp = gMapToObject(val['@value']);
                        // temp['person_vertex'] = gMapToObject(temp['person_vertex']);
                        temp['opinion_vertex'] = gMapToObject(temp['opinion_vertex']);
                        temp['paragraph_vertex'] = gMapToObject(temp['paragraph_vertex']);
                        temp['title_vertex'] = gMapToObject(temp['title_vertex']);
                        // console.log(temp);
                        return temp;
                    })
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

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <Timeline
            sx={{
                [`& .${timelineOppositeContentClasses.root}`]: {
                    flex: 0.2,
                },
            }}
        >
            {
                data.map((val) => {
                    let paragraph_text = val['paragraph_vertex']['text'][0];
                    return (
                        <TimelineItem>
                            <TimelineOppositeContent color="textSecondary">
                                {val['title_vertex']['time'][0]}
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                                <TimelineDot />
                                <TimelineConnector />
                            </TimelineSeparator>
                            <TimelineContent>
                                <Typography variant="h6" component="span" color="orange">{val['opinion_vertex']['WHO'][0]} </Typography>
                                {/* <Typography variant="h6"  component="span" color="orange">{val['person_vertex']['name'][0]} </Typography> */}
                                <Typography variant="h6" component="span" color="red">{val['opinion_vertex']['VERB'][0]} </Typography>
                                <Typography
                                    variant="h6"
                                    aria-describedby={id}
                                    onClick={handleClick}
                                >
                                    {val['opinion_vertex']['OPINION_list'].join("").replace(props.key_word, `<mark>${props.key_word}</mark>`)}
                                </Typography>
                                <Typography variant="h8" color="grey">{paragraph_text} </Typography>
                                <Typography><a href={val['title_vertex']['url'][0]}>[{val['title_vertex']['media'][0]}] {val['title_vertex']['title'][0]}</a></Typography>
                            </TimelineContent>
                        </TimelineItem>
                    );
                })
            }

        </Timeline>
    );
}

export default function Promise() {

    // const [current, setCurrent] = useState('投給');

    // const onClick = (e) => {
    //     // console.log('click ', e);
    //     setCurrent(e.key);
    // };
    let params = useParams();
    let keyword = params['keyword'];

    return (
        <>
            {/* <Divider orientation="left">請選擇瀏覽方式</Divider>
            <Menu mode="horizontal" defaultSelectedKeys={[current]} onClick={onClick} selectedKeys={[current]}>
                <Menu.Item key="投給" icon={<FileOutlined />}>
                    投給
                </Menu.Item>
                <Menu.Item key="支持" icon={<FileOutlined />}>
                    支持
                </Menu.Item>
                <Menu.Item key="聲援" icon={<FileOutlined />}>
                    聲援
                </Menu.Item>
            </Menu> */}
            <Divider orientation="left">123{keyword}</Divider>
            <OppositeContentTimeline key_word={keyword} />
        </>
    )
}