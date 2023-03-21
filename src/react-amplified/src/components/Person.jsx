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

import { useParams } from 'react-router-dom';

import {
    gMapToObject,
} from '../utility/GraphSON';

import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

import { Col, Divider, Row, Statistic, Typography } from 'antd';
import { Menu } from 'antd';
import { MailOutlined, AppstoreOutlined, SettingOutlined, FileOutlined } from '@ant-design/icons';
import { Card } from 'antd';

import {
    response_array_to_timeline_data,
    response_array_to_group_data,
    response_array_to_id_data
} from '../utility/object_map';
import { Link } from 'react-router-dom';


import { Collapse } from 'antd';

const { Panel } = Collapse;

const { Meta } = Card;
const { Title } = Typography;


let end_point = "https://g60lj6ls7h.execute-api.us-east-1.amazonaws.com/Prod"

function PersonInfo(props) {
    let person_name = props.person_name;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        let gremlin_cmd = `g.V('${person_name}').hasLabel('person').valueMap('daily_image_url', 'name', 'daily_category', 'title', 'party')`;
        let post_url = end_point + "?gremlin=" + gremlin_cmd;
        fetch(post_url, { method: 'POST' })
            .then((response) => response.json())
            .then((data) => {
                setData(gMapToObject(data['response']['result']['data']['@value'][0]['@value']));
                setLoading(false);
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            });
    }, []);
    const antIcon = (
        <LoadingOutlined
            style={{
                fontSize: 24,
            }}
            spin
        />
    );
    if (loading) return (<><span>"Loading..."</span><Spin indicator={antIcon} /></>);
    if (error) return "Error!";
    if (!data) return "No data!";

    return (
        <Row>
            <Col flex={1}>
                <Card
                    hoverable
                    style={{ width: 240 }}
                    cover={<img alt="example" src={data['daily_image_url'][0]} />}
                >
                    <Meta title={person_name} description={"圖片來源：" + data['daily_image_url'][0]} />
                </Card>
            </Col>
            <Col flex={1}>
                <Title level={1}>{person_name}</Title>
                <Title level={2}>所屬政黨：{(data['party'] != "TODO") && data['party']}</Title>
                <Title level={2}>職稱：{(data['title'] != "TODO") && data['title']}</Title>
                <p>備註：</p>
                <p>如果「所屬政黨」、「職稱」未顯示，因為 Google 搜尋無直接顯示資料。12345 為示意數值</p>
            </Col>
            <Col flex={4}>
                <Statistic title="出現於今日新聞共" value={12345} />
                <Statistic title="出現於這本週新聞共" value={12345} />
                <Statistic title="今日意見共" value={12345} />
                <Statistic title="本週意見共" value={12345} />
            </Col>
        </Row>

    );
}


function TimeLine(props) {
    let data = props.data;

    if (!data) return "No data!";

    if (Array.isArray(data)) {
        console.log("data timeline array", data);
        return (
            <>
                {
                    data.map((id_group, index) => {
                        return (
                            <>
                                <Divider orientation="left">Group[{index}]</Divider>
                                {/* {!id_group&&<TimelineContent><p>他沒有在參與此討論群</p></TimelineContent>} */}
                                <Timeline sx={{ [`& .${timelineOppositeContentClasses.root}`]: { flex: 0.2, }, }}>
                                    {
                                        id_group.map((val) => {
                                            return (
                                                // <TimelineItem>
                                                //     <TimelineOppositeContent>
                                                //         <Typography variant="body2" color="text.secondary">
                                                //             TODO: Add time {title.date}
                                                //         </Typography>
                                                //     </TimelineOppositeContent>
                                                //     <TimelineSeparator>
                                                //         <TimelineDot />
                                                //         <TimelineConnector />
                                                //     </TimelineSeparator>
                                                //     <TimelineContent>
                                                //         <Typography>標題：{title.title}</Typography>
                                                //     </TimelineContent>
                                                // </TimelineItem>
                                                <TimelineItem>
                                                    <TimelineOppositeContent color="textSecondary">
                                                        {val.time}
                                                    </TimelineOppositeContent>
                                                    <TimelineSeparator>
                                                        <TimelineDot />
                                                        <TimelineConnector />
                                                    </TimelineSeparator>
                                                    <TimelineContent>
                                                        <Link to={"/news/" + val.id}>{val.title}</Link>
                                                        <Collapse ghost>
                                                            <Panel header="read opinion" >
                                                                <>
                                                                    <div><a href={val.url}>[{val.media}原文]</a></div>
                                                                    {
                                                                        val.opinion_paragraph_pair.map((value) => {
                                                                            return (
                                                                                <>
                                                                                    <Card >
                                                                                        <Title level={5} >{value.name}({value.WHO})</Title>
                                                                                        <Title level={4} type="danger">{value.VERB}</Title>
                                                                                        {/* <Title level={5}>{value.opinion_list.join(" ")}</Title> */}
                                                                                        <Collapse ghost>
                                                                                            <Panel header={value.opinion_list.join(" ")} >
                                                                                                <Title level={5} type="secondary">{value.paragraph}</Title>
                                                                                            </Panel>
                                                                                        </Collapse>
                                                                                    </Card>
                                                                                </>
                                                                            );
                                                                        })
                                                                    }
                                                                </>
                                                            </Panel>
                                                        </Collapse>

                                                    </TimelineContent>
                                                </TimelineItem>
                                            )
                                        })
                                    }
                                </Timeline>
                            </>
                        )
                    })
                }
            </>
        )
    }
    else {
        return (
            <Timeline sx={{ [`& .${timelineOppositeContentClasses.root}`]: { flex: 0.2, }, }}>
                {
                    Object.values(data).map((val) => {
                        // console.log(val);
                        return (
                            <TimelineItem>
                                <TimelineOppositeContent color="textSecondary">
                                    {val.time}
                                </TimelineOppositeContent>
                                <TimelineSeparator>
                                    <TimelineDot />
                                    <TimelineConnector />
                                </TimelineSeparator>
                                <TimelineContent>
                                    <Title level={4}><Link to={"/news/" + val.id}>{val.title}</Link></Title><div><a href={val.url}>[{val.media}原文]</a></div>
                                    {
                                        val.opinion_paragraph_pair.map((value) => {
                                            return (
                                                <>
                                                    <Card >
                                                        <Title level={5} >{value.name}({value.WHO})</Title>
                                                        <Title level={4} type="danger">{value.VERB}</Title>
                                                        {/* <Title level={5}>{value.opinion_list.join(" ")}</Title> */}
                                                        <Collapse ghost>
                                                            <Panel header={value.opinion_list.join(" ")} >
                                                                <Title level={5} type="secondary">{value.paragraph}</Title>
                                                            </Panel>
                                                        </Collapse>
                                                    </Card>
                                                </>
                                            );
                                        }
                                        )
                                    }
                                </TimelineContent>
                            </TimelineItem>
                        );
                    })
                }
            </Timeline>
        );
        // return (
        //     <Timeline sx={{ [`& .${timelineOppositeContentClasses.root}`]: { flex: 0.2, }, }}>
        //         {
        //             Object.values(data).map((val) => {
        //                 return (
        //                     <TimelineItem>
        //                         <TimelineOppositeContent color="textSecondary">
        //                             {val.time}
        //                         </TimelineOppositeContent>
        //                         <TimelineSeparator>
        //                             <TimelineDot />
        //                             <TimelineConnector />
        //                         </TimelineSeparator>
        //                         <TimelineContent>
        //                             <Title level={4}><a href={val.url}>[{val.media}] {val.title}</a></Title>
        //                             <Title level={4}>TODO: Add link to my news view!</Title>
        //                             {
        //                                 val.opinion_paragraph_pair.map((value) => {
        //                                     return (
        //                                         <>
        //                                             <Title level={5} type="danger">{value.WHO}  {value.VERB}</Title>
        //                                             <Title level={5}>{value.opinion_list.join(" ")}</Title>
        //                                             <Title level={5} type="secondary">{value.paragraph}</Title>
        //                                         </>
        //                                     );
        //                                 }
        //                                 )
        //                             }
        //                         </TimelineContent>
        //                     </TimelineItem>
        //                 );
        //             })
        //         }
        //     </Timeline>
        // );
    }
}
function ShowContent(props) {

    const [show_data, setShowData] = useState(null);
    const [loading, setLoading] = useState(true);

    let show_type = props.show_type;
    let date = props.date;
    let person_name = props.person_name;
    console.log(show_type);

    useEffect(() => {
        let gremlin_cmd = "";
        let response_array = [];
        let end_point = "https://g60lj6ls7h.execute-api.us-east-1.amazonaws.com/Prod";
        let post_url = "";

        if (show_type === 'timeline_all' || show_type === 'timeline_today' || show_type === 'timeline_yesterday' || show_type === 'timeline_before_yesterday') {


            if (show_type === 'timeline_all') {
                gremlin_cmd = `\
g.V('${props.person_name}').hasLabel('person').as('person_vertex')\
.out('person_to_opinion').as('opinion_vertex')\
.in('paragraph_to_opinion').as('paragraph_vertex')
.in('title_to_paragraph').as('title_vertex').as('title_id').order().by('time',desc)\
.select('person_vertex','opinion_vertex', 'paragraph_vertex', 'title_vertex', 'title_id')\
.by(valueMap('name')).by(valueMap('WHO', 'VERB', 'OPINION_list')).by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url')).by(id)\
`
            }
            else {
                let target_date = date;

                if (show_type === 'timeline_yesterday') {
                    if (show_type === 'timeline_yesterday') {
                        target_date = new Date(date);
                        target_date.setDate(target_date.getDate() - 1);
                        target_date = target_date.toLocaleString().slice(0, 10).replace('/', '-').replace('/', '-');
                        console.log('timeline_yesterday', target_date);
                    }
                    else if (show_type === 'timeline_before_yesterday') {
                        target_date = new Date(date);
                        target_date.setDate(target_date.getDate() - 2);
                        target_date = target_date.toLocaleString().slice(0, 10).replace('/', '-').replace('/', '-');
                        console.log('timeline_before_yesterday', target_date);
                    }
                    else if (show_type === 'timeline_today') {
                        target_date = date;
                        console.log('timeline_today', target_date);
                    }
                }
                gremlin_cmd = `\
g.V('${props.person_name}').hasLabel('person').as('person_vertex')\
.out('person_to_opinion').as('opinion_vertex')\
.in('paragraph_to_opinion').as('paragraph_vertex')
.in('title_to_paragraph').has('date', '${target_date}').as('title_vertex').as('title_id').order().by('time',desc)\
.select('person_vertex','opinion_vertex', 'paragraph_vertex', 'title_vertex', 'title_id')\
.by(valueMap('name')).by(valueMap('WHO', 'VERB', 'OPINION_list')).by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url')).by(id)\
`
            }

            post_url = end_point + "?gremlin=" + gremlin_cmd;

            fetch(post_url, { method: 'POST' })
                .then((response) => response.json())
                .then((data) => {
                    response_array = data['response']['result']['data']['@value'];
                    console.log("response_array", response_array)
                    setShowData(
                        response_array_to_timeline_data(
                            response_array.map((val) => {
                                let temp = gMapToObject(val['@value']);
                                temp['opinion_vertex'] = gMapToObject(temp['opinion_vertex']);
                                temp['paragraph_vertex'] = gMapToObject(temp['paragraph_vertex']);
                                temp['title_vertex'] = gMapToObject(temp['title_vertex']);
                                temp['person_vertex'] = gMapToObject(temp['person_vertex']);
                                return temp;
                            })
                        )
                    );
                    setLoading(false);
                })
                .catch((error) => {
                    console.log("Post Error in run_gremlin: ", error);
                    setLoading(false);
                });
        }
        //         else if (show_type === "common_person_cluster_today") {
        //             gremlin_cmd = `\
        // g.V('${props.person_name}').hasLabel('person').out('person_to_opinion').as('opinion_vertex')\
        // .in('paragraph_to_opinion').as('paragraph_vertex').in('title_to_paragraph').has('date', '${date}').as('title_vertex')\
        // .order().by('time',desc)\
        // .select('person_vertex','opinion_vertex', 'paragraph_vertex', 'title_vertex')\
        // .by(valueMap('name')).by(valueMap('WHO', 'VERB', 'OPINION_list')).by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url'))\
        //             `
        //             post_url = end_point + "?gremlin=" + gremlin_cmd;

        //             fetch(post_url, { method: 'POST' })
        //                 .then((response) => response.json())
        //                 .then((data) => {
        //                     response_array = data['response']['result']['data']['@value'];
        //                     let news_dict = response_array_to_timeline_data(
        //                         response_array.map((val) => {
        //                             let temp = gMapToObject(val['@value']);
        //                             temp['opinion_vertex'] = gMapToObject(temp['opinion_vertex']);
        //                             temp['paragraph_vertex'] = gMapToObject(temp['paragraph_vertex']);
        //                             temp['title_vertex'] = gMapToObject(temp['title_vertex']);
        //                             // console.log(temp);
        //                             return temp;
        //                         })
        //                     )

        //                     console.log("news_dict", news_dict);
        //                     let min_group_num = 3;
        //                     let connected_components = [];

        //                     post_url = end_point + `/groupby-common-person?date=${date}&min_group_num=${min_group_num}`;
        //                     fetch(post_url, { method: 'POST' })
        //                         .then((response) => response.json())
        //                         .then((data) => {
        //                             connected_components = data['connected_components'];
        //                             // console.log(connected_components);
        //                             let timeline_after_group = [];
        //                             connected_components.forEach((title_group) => {
        //                                 let temp = [];
        //                                 title_group.forEach((title) => {
        //                                     if (title in news_dict)
        //                                         temp.push(news_dict[title]);
        //                                     else
        //                                         temp.push({ "title": title });
        //                                 })
        //                                 timeline_after_group.push(temp);
        //                             })
        //                             setShowData(timeline_after_group);
        //                         })
        //                         .catch((error) => {
        //                             console.log("Post Error in run_gremlin: ", error);
        //                         });
        //                 })
        //         }
        //         else if (show_type === "common_person_cluster_all" || show_type === "common_person_cluster_today" || show_type === "common_person_cluster_yesterday" || show_type === "common_person_cluster_before_yesterday") {
        //             let target_date = date;

        //             if (show_type === 'common_person_cluster_yesterday') {
        //                 target_date = new Date(date);
        //                 target_date.setDate(target_date.getDate() - 1);
        //                 target_date = target_date.toISOString().split('T')[0];
        //                 console.log(target_date);
        //             }
        //             else if (show_type === 'common_person_cluster_before_yesterday') {
        //                 target_date = new Date(date);
        //                 target_date.setDate(target_date.getDate() - 2);
        //                 target_date = target_date.toISOString().split('T')[0];
        //                 console.log(target_date);
        //             }

        //             console.log(show_type, target_date);
        //             if (show_type === "common_person_cluster_all")
        //                 gremlin_cmd = `\
        // g.V('${props.person_name}').hasLabel('person').as('person_vertex')\
        // .out('person_to_opinion').as('opinion_vertex')\
        // .in('paragraph_to_opinion').as('paragraph_vertex')\
        // .in('title_to_paragraph').as('title_vertex').as('title_id').order().by('time',desc)\
        // .select('person_vertex', 'opinion_vertex', 'paragraph_vertex', 'title_vertex', 'title_id')\
        // .by(valueMap('name')).by(valueMap('WHO', 'VERB', 'OPINION_list')).by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url')).by(id)\
        // `
        //             else
        //                 gremlin_cmd = `\
        // g.V('${props.person_name}').hasLabel('person').as('person_vertex')\
        // .out('person_to_opinion').as('opinion_vertex')\
        // .in('paragraph_to_opinion').as('paragraph_vertex')\
        // .in('title_to_paragraph').has('date', '${target_date}').as('title_vertex').as('title_id').order().by('time',desc)\
        // .select('person_vertex', 'opinion_vertex', 'paragraph_vertex', 'title_vertex', 'title_id')\
        // .by(valueMap('name')).by(valueMap('WHO', 'VERB', 'OPINION_list')).by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url')).by(id)\
        // `
        //             post_url = end_point + "?gremlin=" + gremlin_cmd;

        //             fetch(post_url, { method: 'POST' })
        //                 .then((response) => response.json())
        //                 .then((data) => {
        //                     response_array = data['response']['result']['data']['@value'];
        //                     let news_dict = response_array_to_group_data(
        //                         response_array.map((val) => {
        //                             let temp = gMapToObject(val['@value']);
        //                             temp['opinion_vertex'] = gMapToObject(temp['opinion_vertex']);
        //                             temp['paragraph_vertex'] = gMapToObject(temp['paragraph_vertex']);
        //                             temp['title_vertex'] = gMapToObject(temp['title_vertex']);
        //                             temp['person_vertex'] = gMapToObject(temp['person_vertex']);
        //                             return temp;
        //                         })
        //                     )

        //                     console.log("news_dict", news_dict);



        //                     //                     gremlin_cmd = `\
        //                     // g.V().hasLabel('title').has('date', '${target_date}').as('title_vertex').as('title_id').order().by('time',desc)\
        //                     // .out('title_to_paragraph').has('index', '0').as('paragraph_vertex')\
        //                     // .select('title_vertex', 'title_id', 'paragraph_vertex')\
        //                     // .by(valueMap('time', 'title', 'media', 'url')).by(id).by(valueMap('text'))\
        //                     // `
        //                     //
        //                     //
        //                     if (show_type === "common_person_cluster_all")
        //                         gremlin_cmd = `\
        // g.V('${props.person_name}').hasLabel('title').order().by('time',desc).as('title_vertex').as('title_id')\
        // .out('title_to_paragraph').has('index', '0').as('paragraph_vertex')\
        // .select('paragraph_vertex', 'title_vertex', 'title_id')\
        // .by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url')).by(id)\
        // `
        //                     else
        //                         gremlin_cmd = `\
        // g.V('${props.person_name}').hasLabel('title').has('date', '${target_date}').order().by('time',desc).as('title_vertex').as('title_id')\
        // .out('title_to_paragraph').has('index', '0').as('paragraph_vertex')\
        // .select('paragraph_vertex', 'title_vertex', 'title_id')\
        // .by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url')).by(id)\
        // `

        //                     post_url = end_point + "?gremlin=" + gremlin_cmd;

        //                     fetch(post_url, { method: 'POST' })
        //                         .then((response) => response.json())
        //                         .then((data) => {
        //                             response_array = data['response']['result']['data']['@value'];

        //                             let id_dict = response_array_to_id_data(
        //                                 response_array.map((val) => {
        //                                     let temp = gMapToObject(val['@value']);
        //                                     // temp['opinion_vertex'] = gMapToObject(temp['opinion_vertex']);
        //                                     temp['paragraph_vertex'] = gMapToObject(temp['paragraph_vertex']);
        //                                     temp['title_vertex'] = gMapToObject(temp['title_vertex']);
        //                                     // temp['person_vertex'] = gMapToObject(temp['person_vertex']);
        //                                     return temp;
        //                                 })
        //                             )

        //                             console.log("id_dict", id_dict);


        //                             let min_group_num = 2;
        //                             let connected_components = [];
        //                             if (show_type === "common_person_cluster_all")
        //                                 post_url = end_point + `/groupby-common-person?date=${'all'}&min_group_num=${min_group_num}`;
        //                             else
        //                                 post_url = end_point + `/groupby-common-person?date=${target_date}&min_group_num=${min_group_num}`;
        //                             fetch(post_url, { method: 'POST' })
        //                                 .then((response) => response.json())
        //                                 .then((data) => {
        //                                     connected_components = data['connected_components'];


        //                                     console.log('data', data)
        //                                     console.log('connected_components', connected_components);
        //                                     let timeline_after_group = [];
        //                                     connected_components.forEach((id_group) => {
        //                                         let temp = [];
        //                                         id_group.forEach((id) => {
        //                                             //! TODO
        //                                             if (id in news_dict) {
        //                                                 temp.push(news_dict[id]);
        //                                             }
        //                                             else if (id in id_dict) {
        //                                                 temp.push(id_dict[id]);
        //                                             }
        //                                             else {
        //                                                 temp.push({ "title": id });
        //                                             }
        //                                         })
        //                                         timeline_after_group.push(temp);
        //                                     })
        //                                     setShowData(timeline_after_group);
        //                                     console.log('timeline_after_group', timeline_after_group)
        //                                 })
        //                                 .catch((error) => {
        //                                     console.log("Post Error in run_gremlin: ", error);
        //                                 });
        //                         })
        //                         .catch((error) => {
        //                             console.log("Post Error in run_gremlin: ", error);
        //                         });

        //                 })
        //         }
        else if (show_type === "common_person_cluster_all" || show_type === "common_person_cluster_today" || show_type === "common_person_cluster_yesterday" || show_type === "common_person_cluster_before_yesterday") {
            let target_date = date;

            if (show_type === 'common_person_cluster_yesterday') {
                target_date = new Date(date);
                target_date.setDate(target_date.getDate() - 1);
                target_date = target_date.toISOString().split('T')[0];
                console.log(target_date);
            }
            else if (show_type === 'common_person_cluster_before_yesterday') {
                target_date = new Date(date);
                target_date.setDate(target_date.getDate() - 2);
                target_date = target_date.toISOString().split('T')[0];
                console.log(target_date);
            }

            console.log(show_type, target_date);
            if (show_type === "common_person_cluster_all")
                gremlin_cmd = `\
g.V('${person_name}').hasLabel('person').as('person_vertex')\
.out('person_to_opinion').as('opinion_vertex')\
.in('paragraph_to_opinion').as('paragraph_vertex')\
.in('title_to_paragraph').as('title_vertex').as('title_id').order().by('time',desc)\
.select('person_vertex', 'opinion_vertex', 'paragraph_vertex', 'title_vertex', 'title_id')\
.by(valueMap('name')).by(valueMap('WHO', 'VERB', 'OPINION_list')).by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url')).by(id)\
`
            else
                gremlin_cmd = `\
g.V('${person_name}').hasLabel('person').as('person_vertex')\
.out('person_to_opinion').as('opinion_vertex')\
.in('paragraph_to_opinion').as('paragraph_vertex')\
.in('title_to_paragraph').has('date', '${target_date}').as('title_vertex').as('title_id').order().by('time',desc)\
.select('person_vertex', 'opinion_vertex', 'paragraph_vertex', 'title_vertex', 'title_id')\
.by(valueMap('name')).by(valueMap('WHO', 'VERB', 'OPINION_list')).by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url')).by(id)\
`
            post_url = end_point + "?gremlin=" + gremlin_cmd;

            fetch(post_url, { method: 'POST' })
                .then((response) => response.json())
                .then((data) => {
                    response_array = data['response']['result']['data']['@value'];
                    let news_dict = response_array_to_group_data(
                        response_array.map((val) => {
                            let temp = gMapToObject(val['@value']);
                            temp['opinion_vertex'] = gMapToObject(temp['opinion_vertex']);
                            temp['paragraph_vertex'] = gMapToObject(temp['paragraph_vertex']);
                            temp['title_vertex'] = gMapToObject(temp['title_vertex']);
                            temp['person_vertex'] = gMapToObject(temp['person_vertex']);
                            return temp;
                        })
                    )

                    console.log("news_dict", news_dict);



                    //                     gremlin_cmd = `\
                    // g.V().hasLabel('title').has('date', '${target_date}').as('title_vertex').as('title_id').order().by('time',desc)\
                    // .out('title_to_paragraph').has('index', '0').as('paragraph_vertex')\
                    // .select('title_vertex', 'title_id', 'paragraph_vertex')\
                    // .by(valueMap('time', 'title', 'media', 'url')).by(id).by(valueMap('text'))\
                    // `
                    //
                    //
                    if (show_type === "common_person_cluster_all")
                        gremlin_cmd = `\
g.V('${person_name}').hasLabel('person')\
.out('person_to_title').hasLabel('title').order().by('time',desc).as('title_vertex').as('title_id')\
.out('title_to_paragraph').has('index', '0').as('paragraph_vertex')\
.select('paragraph_vertex', 'title_vertex', 'title_id')\
.by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url')).by(id)\
`
                    else
                        gremlin_cmd = `\
g.V('${person_name}').hasLabel('person')\
.out('person_to_title').hasLabel('title').has('date', '${target_date}').order().by('time',desc).as('title_vertex').as('title_id')\
.out('title_to_paragraph').has('index', '0').as('paragraph_vertex')\
.select('paragraph_vertex', 'title_vertex', 'title_id')\
.by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url')).by(id)\
`

                    post_url = end_point + "?gremlin=" + gremlin_cmd;

                    fetch(post_url, { method: 'POST' })
                        .then((response) => response.json())
                        .then((data) => {
                            response_array = data['response']['result']['data']['@value'];

                            let id_dict = response_array_to_id_data(
                                response_array.map((val) => {
                                    let temp = gMapToObject(val['@value']);
                                    // temp['opinion_vertex'] = gMapToObject(temp['opinion_vertex']);
                                    temp['paragraph_vertex'] = gMapToObject(temp['paragraph_vertex']);
                                    temp['title_vertex'] = gMapToObject(temp['title_vertex']);
                                    // temp['person_vertex'] = gMapToObject(temp['person_vertex']);
                                    return temp;
                                })
                            )

                            console.log("id_dict", id_dict);


                            let min_group_num = 2;
                            let connected_components = [];
                            if (show_type === "common_person_cluster_all")
                                post_url = end_point + `/groupby-common-person?date=${'all'}&min_group_num=${min_group_num}`;
                            else
                                post_url = end_point + `/groupby-common-person?date=${target_date}&min_group_num=${min_group_num}`;
                            fetch(post_url, { method: 'POST' })
                                .then((response) => response.json())
                                .then((data) => {
                                    connected_components = data['connected_components'];


                                    console.log('data', data)
                                    console.log('connected_components', connected_components);
                                    let timeline_after_group = [];
                                    connected_components.forEach((id_group) => {
                                        let temp = [];
                                        id_group.forEach((id) => {
                                            //! TODO
                                            if (id in news_dict) {
                                                temp.push(news_dict[id]);
                                            }
                                            else if (id in id_dict) {
                                                temp.push(id_dict[id]);
                                            }
                                        })
                                        timeline_after_group.push(temp);
                                    })
                                    setShowData(timeline_after_group);
                                    console.log('timeline_after_group', timeline_after_group)
                                })
                                .catch((error) => {
                                    console.log("Post Error in run_gremlin: ", error);
                                });
                        })
                        .catch((error) => {
                            console.log("Post Error in run_gremlin: ", error);
                        });

                })
        }
        else if (show_type === "promise") {
            let key_word = "承諾";
            console.log(key_word);
            gremlin_cmd = `\
            g.V('${props.person_name}').hasLabel('person').out('person_to_opinion').as('opinion_vertex')\
            .hasLabel('opinion').has('OPINION_list', containing('${key_word}')).as('opinion_vertex')\
            .in('paragraph_to_opinion').as('paragraph_vertex')
            .in('title_to_paragraph').as('title_vertex').order().by('time',desc)\
            .select('opinion_vertex', 'paragraph_vertex', 'title_vertex')\
            .by(valueMap('WHO', 'VERB', 'OPINION_list')).by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url'))\
            `
            post_url = end_point + "?gremlin=" + gremlin_cmd;

            fetch(post_url, { method: 'POST' })
                .then((response) => response.json())
                .then((data) => {
                    response_array = data['response']['result']['data']['@value'];
                    setShowData(
                        response_array_to_timeline_data(
                            response_array.map((val) => {
                                let temp = gMapToObject(val['@value']);
                                temp['opinion_vertex'] = gMapToObject(temp['opinion_vertex']);
                                temp['paragraph_vertex'] = gMapToObject(temp['paragraph_vertex']);
                                temp['title_vertex'] = gMapToObject(temp['title_vertex']);
                                // console.log(temp);
                                return temp;
                            })
                        )
                    );
                })
                .catch((error) => {
                    console.log("Post Error in run_gremlin: ", error);
                });
        }
        else if (show_type === "support") {
            let key_word = "投給";
            console.log(key_word);
            gremlin_cmd = `\
            g.V('${props.person_name}').hasLabel('person').out('person_to_opinion').as('opinion_vertex')\
            .hasLabel('opinion').has('OPINION_list', containing('${key_word}')).as('opinion_vertex').limit(10)\
            .in('paragraph_to_opinion').as('paragraph_vertex')
            .in('title_to_paragraph').as('title_vertex').order().by('time',desc)\
            .select('opinion_vertex', 'paragraph_vertex', 'title_vertex')\
            .by(valueMap('WHO', 'VERB', 'OPINION_list')).by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url'))\
            `
            post_url = end_point + "?gremlin=" + gremlin_cmd;

            fetch(post_url, { method: 'POST' })
                .then((response) => response.json())
                .then((data) => {
                    response_array = data['response']['result']['data']['@value'];
                    setShowData(
                        response_array_to_timeline_data(
                            response_array.map((val) => {
                                let temp = gMapToObject(val['@value']);
                                temp['opinion_vertex'] = gMapToObject(temp['opinion_vertex']);
                                temp['paragraph_vertex'] = gMapToObject(temp['paragraph_vertex']);
                                temp['title_vertex'] = gMapToObject(temp['title_vertex']);
                                // console.log(temp);
                                return temp;
                            })
                        )
                    );
                })
                .catch((error) => {
                    console.log("Post Error in run_gremlin: ", error);
                });
        }
        else {
            setShowData(null);
        }
    }, [show_type, date]);


    if (loading) return (<span>"Loading..."</span>);
    if (!show_data) return "No data!";

    return (
        <TimeLine data={show_data} show_type={show_type} />
    );
}


export default function Person(props) {
    let params = useParams();
    let person_name = params.name;

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [current, setCurrent] = useState('timeline_all');
    const onClick = (e) => {
        // console.log('click ', e);
        setCurrent(e.key);
    };
    return (
        <>
            <PersonInfo person_name={person_name} />

            <Divider orientation="left">請選擇瀏覽方式</Divider>
            <Menu mode="horizontal" defaultSelectedKeys={[current]} onClick={onClick}>
                <Menu.SubMenu key="timeline" title="依照「時間軸」呈現" icon={<FileOutlined />}>
                    <Menu.Item key="timeline_all" icon={<FileOutlined />}>
                        「全部」時間軸
                    </Menu.Item>
                    {/* <Menu.Item key="timeline_today" icon={<FileOutlined />}>
                        「今日」標題時間軸
                    </Menu.Item>
                    <Menu.Item key="timeline_yesterday" icon={<FileOutlined />}>
                        「昨日」標題時間軸
                    </Menu.Item>
                    <Menu.Item key="timeline_before_yesterday" icon={<FileOutlined />}>
                        「前天」標題時間軸
                    </Menu.Item> */}
                </Menu.SubMenu>

                {/* <Menu.SubMenu key="common_person_cluster" title="依照「共同人物分群結果」呈現" icon={<FileOutlined />}>
                    <Menu.Item key="common_person_cluster_all" icon={<FileOutlined />}>
                        「全部」共同人物分群
                    </Menu.Item>
                    <Menu.Item key="common_person_cluster_today" icon={<FileOutlined />}>
                        「本日」共同人物分群
                    </Menu.Item>
                    <Menu.Item key="common_person_cluster_yesterday" icon={<FileOutlined />}>
                        「昨日」共同人物分群
                    </Menu.Item>
                    <Menu.Item key="common_person_cluster_before_yesterday" icon={<FileOutlined />}>
                        「前天」共同人物分群
                    </Menu.Item>
                </Menu.SubMenu> */}

                {/* <Menu.Item key="promise" icon={<FileOutlined />}>
                    過去承諾
                </Menu.Item>

                <Menu.Item key="support" icon={<FileOutlined />}>
                    過去支持
                </Menu.Item> */}
                {/* <Menu.SubMenu key="agglomerative_cluster" title="依照「相似度分群結果」呈現（建置中）" icon={<FileOutlined />}> */}
                    {/* <Menu.Item key="agglomerative_cluster_today" icon={<FileOutlined />}>
                        「本日」相似度分群
                    </Menu.Item> */}
                    {/* <Menu.Item key="agglomerative_cluster_yesterday" icon={<FileOutlined />}>
                        「昨日」相似度分群（建置中）
                    </Menu.Item>
                    <Menu.Item key="agglomerative_cluster_before_yesterday" icon={<FileOutlined />}>
                        「前天」相似度分群（建置中）
                    </Menu.Item>
                </Menu.SubMenu> */}

            </Menu>

            <Divider orientation="left">{date} {person_name}({current})</Divider>
            <ShowContent person_name={person_name} show_type={current} date={date} />
        </>
    );
}