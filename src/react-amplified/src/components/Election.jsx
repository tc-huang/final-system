import {
    useState,
    useEffect
} from 'react';

import { Divider, Typography } from 'antd';
import { Menu } from 'antd';
import { FileOutlined } from '@ant-design/icons';

import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent, {
    timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import Highlighter from "react-highlight-words";


import { gMapToObject } from '../utility/GraphSON';
// import { run_gremlin } from '../utility/gremlin';
import {
    response_array_to_timeline_data,
    response_array_to_group_data,
    response_array_to_id_data
} from '../utility/object_map';

import { Link } from 'react-router-dom';

import { Card } from 'antd';
import { Collapse } from 'antd';

const { Panel } = Collapse;



const { Title } = Typography;





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
                                <Timeline sx={{ [`& .${timelineOppositeContentClasses.root}`]: { flex: 0.2, }, }}>
                                    {
                                        id_group.map((val) => {
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
                                                                                            <Panel header={value.opinion_list && value.opinion_list.join(" ")} >
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
                                                        <Highlighter
                                                            highlightClassName="YourHighlightClass"
                                                            searchWords={["當選後將", "當選後會", "上任後將", "上任後會", "承諾會", "承諾將", "當選後，", "當選後", "當選，", "他會", "他將", "未來會", "未來將", "承諾"]}
                                                            autoEscape={true}
                                                            textToHighlight={value.opinion_list &&value.opinion_list.join(" ")}
                                                        />
                                                        <Collapse ghost>
                                                            <Panel header="段落原文" >
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
    }
}

function ShowContent(props) {

    const [show_data, setShowData] = useState(null);
    const [loading, setLoading] = useState(true);

    let date_list = props.date_list;
    let keyword_list = props.keyword_list;
    let show_type = props.show_type;
    let date = props.date;
    console.log(show_type);
    console.log("date_list", date_list);
    console.log("keyword_list", keyword_list);
    console.log("show_type in date_list", show_type in date_list);
    console.log("show_type in keyword_list", show_type in keyword_list);

    useEffect(() => {
        let gremlin_cmd = "";
        let response_array = [];
        let end_point = "https://g60lj6ls7h.execute-api.us-east-1.amazonaws.com/Prod";
        let post_url = "";

        if (date_list.includes(show_type)) {
            gremlin_cmd = `\
g.V().hasLabel('person').as('person_vertex')\
.out('person_to_opinion').as('opinion_vertex')\
.in('paragraph_to_opinion').as('paragraph_vertex')\
.in('title_to_paragraph').has('date', '${date}').as('title_vertex').as('title_id').order().by('time',desc)\
.select('person_vertex', 'opinion_vertex', 'paragraph_vertex', 'title_vertex', 'title_id')\
.by(valueMap('name')).by(valueMap('WHO', 'VERB', 'OPINION_list')).by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url')).by(id)\
`
            post_url = end_point + "?gremlin=" + gremlin_cmd;

            fetch(post_url, { method: 'POST' })
                .then((response) => response.json())
                .then((data) => {
                    response_array = data['response']['result']['data']['@value'];
                    console.log(response_array.map((val) => {
                        let temp = gMapToObject(val['@value']);
                        temp['opinion_vertex'] = gMapToObject(temp['opinion_vertex']);
                        temp['paragraph_vertex'] = gMapToObject(temp['paragraph_vertex']);
                        temp['title_vertex'] = gMapToObject(temp['title_vertex']);
                        temp['person_vertex'] = gMapToObject(temp['person_vertex']);
                        return temp;
                    }))
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
        else if (keyword_list.includes(show_type)) {
            // let date_list_str = "'" + date_list.join("','") + "'";
            const date_list_str = "\
'2022-11-06','2022-11-07','2022-11-08','2022-11-09','2022-11-10','2022-11-11','2022-11-12', \
'2022-11-13','2022-11-14','2022-11-15','2022-11-16','2022-11-17', '2022-11-18','2022-11-19',\
'2022-11-20','2022-11-21','2022-11-22','2022-11-23','2022-11-24','2022-11-25','2022-11-26','2022-11-27'\
";
            gremlin_cmd = `\
g.V().hasLabel('person').as('person_vertex')\
.out('person_to_opinion').has('OPINION_list', containing('${show_type}')).as('opinion_vertex')\
.in('paragraph_to_opinion').as('paragraph_vertex')
.in('title_to_paragraph').has('date', within(${date_list_str})).as('title_vertex').as('title_id').order().by('time',desc)\
.select('person_vertex', 'opinion_vertex', 'paragraph_vertex', 'title_vertex', 'title_id')\
.by(valueMap('name')).by(valueMap('WHO', 'VERB', 'OPINION_list')).by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url')).by(id)\
`
//     gremlin_cmd = `\
// g.V().hasLabel('person').as('person_vertex')\
// .out('person_to_opinion').as('opinion_vertex')\
// .in('paragraph_to_opinion').has('text', containing('${show_type}')).as('paragraph_vertex')\
// .in('title_to_paragraph').has('date', within(${date_list_str})).as('title_vertex').as('title_id').order().by('time',desc)\
// .select('person_vertex', 'opinion_vertex', 'paragraph_vertex', 'title_vertex', 'title_id')\
// .by(valueMap('name')).by(valueMap('WHO', 'VERB', 'OPINION_list')).by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url')).by(id)\
// `

            post_url = end_point + "?gremlin=" + gremlin_cmd;

            fetch(post_url, { method: 'POST' })
                .then((response) => response.json())
                .then((data) => {
                    console.log("248:", data);
                    response_array = data['response']['result']['data']['@value'];
                    console.log(response_array.map((val) => {
                        let temp = gMapToObject(val['@value']);
                        temp['opinion_vertex'] = gMapToObject(temp['opinion_vertex']);
                        temp['paragraph_vertex'] = gMapToObject(temp['paragraph_vertex']);
                        temp['title_vertex'] = gMapToObject(temp['title_vertex']);
                        temp['person_vertex'] = gMapToObject(temp['person_vertex']);
                        return temp;
                    }))
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
        else if (show_type == "coreference_resolution")
        {
            gremlin_cmd = `\
g.V().hasLabel('person').as('person_vertex')\
.out('person_to_opinion').has('WHO', '他').as('opinion_vertex')\
.in('paragraph_to_opinion').as('paragraph_vertex')\
.in('title_to_paragraph').as('title_vertex').as('title_id').order().by('time',desc)\
.select('person_vertex', 'opinion_vertex', 'paragraph_vertex', 'title_vertex', 'title_id')\
.by(valueMap('name')).by(valueMap('WHO', 'VERB', 'OPINION_list')).by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url')).by(id)\
`
            post_url = end_point + "?gremlin=" + gremlin_cmd;

            fetch(post_url, { method: 'POST' })
                .then((response) => response.json())
                .then((data) => {
                    response_array = data['response']['result']['data']['@value'];
                    console.log(response_array.map((val) => {
                        let temp = gMapToObject(val['@value']);
                        temp['opinion_vertex'] = gMapToObject(temp['opinion_vertex']);
                        temp['paragraph_vertex'] = gMapToObject(temp['paragraph_vertex']);
                        temp['title_vertex'] = gMapToObject(temp['title_vertex']);
                        temp['person_vertex'] = gMapToObject(temp['person_vertex']);
                        return temp;
                    }))
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
    else if (show_type == "VE_promise"){
        const date_list_str = "\
'2022-11-06','2022-11-07','2022-11-08','2022-11-09','2022-11-10','2022-11-11','2022-11-12', \
'2022-11-13','2022-11-14','2022-11-15','2022-11-16','2022-11-17', '2022-11-18','2022-11-19',\
'2022-11-20','2022-11-21','2022-11-22','2022-11-23','2022-11-24','2022-11-25','2022-11-26','2022-11-27'\
";
        gremlin_cmd = `\
g.V().hasLabel('person').as('person_vertex')\
.out('person_to_opinion').has('VERB', '承諾').as('opinion_vertex')\
.in('paragraph_to_opinion').as('paragraph_vertex')
.in('title_to_paragraph').has('date', within(${date_list_str})).as('title_vertex').as('title_id').order().by('time',desc)\
.select('person_vertex', 'opinion_vertex', 'paragraph_vertex', 'title_vertex', 'title_id')\
.by(valueMap('name')).by(valueMap('WHO', 'VERB', 'OPINION_list')).by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url')).by(id)\
`
        post_url = end_point + "?gremlin=" + gremlin_cmd;

        fetch(post_url, { method: 'POST' })
            .then((response) => response.json())
            .then((data) => {
                response_array = data['response']['result']['data']['@value'];
                console.log(response_array.map((val) => {
                    let temp = gMapToObject(val['@value']);
                    temp['opinion_vertex'] = gMapToObject(temp['opinion_vertex']);
                    temp['paragraph_vertex'] = gMapToObject(temp['paragraph_vertex']);
                    temp['title_vertex'] = gMapToObject(temp['title_vertex']);
                    temp['person_vertex'] = gMapToObject(temp['person_vertex']);
                    return temp;
                }))
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

        // }
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
        // g.V().hasLabel('person').as('person_vertex')\
        // .out('person_to_opinion').as('opinion_vertex')\
        // .in('paragraph_to_opinion').as('paragraph_vertex')\
        // .in('title_to_paragraph').as('title_vertex').as('title_id').order().by('time',desc)\
        // .select('person_vertex', 'opinion_vertex', 'paragraph_vertex', 'title_vertex', 'title_id')\
        // .by(valueMap('name')).by(valueMap('WHO', 'VERB', 'OPINION_list')).by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url')).by(id)\
        // `
        //             else
        //                 gremlin_cmd = `\
        // g.V().hasLabel('person').as('person_vertex')\
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
        // g.V().hasLabel('title').order().by('time',desc).as('title_vertex').as('title_id')\
        // .out('title_to_paragraph').has('index', '0').as('paragraph_vertex')\
        // .select('paragraph_vertex', 'title_vertex', 'title_id')\
        // .by(valueMap('text')).by(valueMap('time', 'title', 'media', 'url')).by(id)\
        // `
        //                     else
        //                         gremlin_cmd = `\
        // g.V().hasLabel('title').has('date', '${target_date}').order().by('time',desc).as('title_vertex').as('title_id')\
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
        // else {
        //     setShowData(null);
        // }
    }, [show_type, date]);


    if (loading) return (<span>"Loading..."</span>);
    if (!show_data) return "No data!";

    // console.log(show_data);
    return (
        <TimeLine data={show_data} show_type={show_type} />
    );
}




export default function TodaysNews(props) {
    const [date, setDate] = useState(new Date().toLocaleString().slice(0, 10).replace('/', '-').replace('/', '-'));
    const [current, setCurrent] = useState('2022-11-27');

    const onClick = (e) => {
        // console.log('click ', e);
        setCurrent(e.key);
    };

    const date_list = ["2022-11-20", "2022-11-21", "2022-11-22", "2022-11-23", "2022-11-24", "2022-11-25", "2022-11-26", "2022-11-27"];

    const keyword_list = [
        "當選後將", "當選後會", "上任後將", "上任後會", "承諾會", "承諾將", "當選後，", "當選後", "當選", "未來會", "未來將", "承諾","他將", "他會"];

    return (
        <>
            <Divider orientation="left">請選擇瀏覽方式</Divider>
            <Menu mode="horizontal" defaultSelectedKeys={[current]} onClick={onClick} selectedKeys={[current]}>
                <Menu.SubMenu key="timeline" title="依照「時間軸」呈現" icon={<FileOutlined />}>
                    <Menu.Item key="2022-11-27" icon={<FileOutlined />}>
                        11/27 投票後一天
                    </Menu.Item>
                    <Menu.Item key="2022-11-26" icon={<FileOutlined />}>
                        11/26 投票
                    </Menu.Item>
                    <Menu.Item key="2022-11-25" icon={<FileOutlined />}>
                        11/25 公告選舉人數
                    </Menu.Item>
                    <Menu.Item key="2022-11-24" icon={<FileOutlined />}>
                        11/24
                    </Menu.Item>
                    <Menu.Item key="2022-11-23" icon={<FileOutlined />}>
                        11/23
                    </Menu.Item>
                    <Menu.Item key="2022-11-22" icon={<FileOutlined />}>
                        11/22
                    </Menu.Item>
                    <Menu.Item key="2022-11-21" icon={<FileOutlined />}>
                        11/21
                    </Menu.Item>
                    <Menu.Item key="2022-11-20" icon={<FileOutlined />}>
                        11/20
                    </Menu.Item>
                </Menu.SubMenu>
                <Menu.Item key="VE_promise" icon={<FileOutlined />}>
                    VE 承諾
                </Menu.Item>
                <Menu.Item key="coreference_resolution" icon={<FileOutlined />}>
                    代名詞「他」還原
                </Menu.Item>
                <Menu.SubMenu key="key" title="依照「關鍵字」呈現" icon={<FileOutlined />}>
                    {
                        keyword_list.map((keyword) => {
                            return (
                                <Menu.Item key={keyword} icon={<FileOutlined />}>
                                    {keyword}
                                </Menu.Item>
                            );
                        })
                    }
                </Menu.SubMenu>
            </Menu>
            <Divider orientation="left">{current}</Divider>
            <ShowContent date={current} show_type={current} date_list={date_list} keyword_list={keyword_list} />
        </>
    )
}

//  https://udn.com/vote2022/candidate_mayor?city=phc#mayor

let candidate_data = {
    "縣長": {
        "北部": {
            "新竹縣": {
            }
        },
        "中部": {
            "苗栗縣": {
            },
            "彰化縣": {
            }
        },
        "南部": {
            "嘉義縣": {
            },
            "屏東縣": {
            }
        },
        "東部": {
            "宜蘭縣": {
            },
            "花蓮縣": {
            },
            "台東縣": {
            }
        },
        "離島": {
            "澎湖縣": {
            },
            "連江縣": {
            },
            "金門縣": {

            }
        }
    },
    "市長": {
        "北部": {
            "基隆市": {
            },
            "台北市": {
            },
            "新北市": {
            },
            "桃園市": {
            },
            "新竹市": {
            },
        },
        "中部": {
            "台中市": {
            }
        },
        "南部": {
            "嘉義市": {
            },
            "台南市": {
            },
            "高雄市": {
            },
        },
        "東部": {
        },
        "離島": {
        }
    }
};