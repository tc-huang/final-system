import { useState, useEffect } from "react";

import { Link } from "react-router-dom";

import { Divider, Typography, Menu, Card, Collapse, DatePickerProps, DatePicker } from "antd";
import { FileOutlined } from "@ant-design/icons";


import Timeline from "@mui/lab/Timeline";
// import TimelineItem from "@mui/lab/TimelineItem";
// import TimelineSeparator from "@mui/lab/TimelineSeparator";
// import TimelineConnector from "@mui/lab/TimelineConnector";
// import TimelineContent from "@mui/lab/TimelineContent";
// import TimelineDot from "@mui/lab/TimelineDot";
// import { TimelineOppositeContent, timelineOppositeContentClasses} from "@mui/lab/TimelineOppositeContent";

// import { gMapToObject } from "../utility/GraphSON";

// import {
//   response_array_to_timeline_data,
//   response_array_to_group_data,
//   response_array_to_id_data,
// } from "../utility/object_map";



// const { Panel } = Collapse;

// const { Title } = Typography;

function TimeLine(props) {
    //   let data = props.data;

    //   if (!data) return "No data!";

    //   if (Array.isArray(data)) {
    //     console.log("data timeline array", data);
    //     return (
    //       <>
    //         {data.map((id_group, index) => {
    //           return (
    //             <>
    //               <Divider orientation="left">Group[{index}]</Divider>
    //               <Timeline
    //                 sx={{
    //                   [`& .${timelineOppositeContentClasses.root}`]: { flex: 0.2 },
    //                 }}
    //               >
    //                 {id_group.map((val) => {
    //                   return (
    //                     <TimelineItem>
    //                       <TimelineOppositeContent color="textSecondary">
    //                         {val.time}
    //                       </TimelineOppositeContent>
    //                       <TimelineSeparator>
    //                         <TimelineDot />
    //                         <TimelineConnector />
    //                       </TimelineSeparator>
    //                       <TimelineContent>
    //                         <Link to={"/news/" + val.id}>{val.title}</Link>
    //                         <Collapse ghost>
    //                           <Panel header="read opinion">
    //                             <>
    //                               <div>
    //                                 <a href={val.url}>[{val.media}原文]</a>
    //                               </div>
    //                               {val.opinion_paragraph_pair.map((value) => {
    //                                 return (
    //                                   <>
    //                                     <Card>
    //                                       <Title level={5}>
    //                                         {value.name}({value.WHO})
    //                                       </Title>
    //                                       <Title level={4} type="danger">
    //                                         {value.VERB}
    //                                       </Title>
    //                                       {/* <Title level={5}>{value.opinion_list.join(" ")}</Title> */}
    //                                       <Collapse ghost>
    //                                         <Panel
    //                                           header={
    //                                             value.opinion_list &&
    //                                             value.opinion_list.join(" ")
    //                                           }
    //                                         >
    //                                           <Title level={5} type="secondary">
    //                                             {value.paragraph}
    //                                           </Title>
    //                                         </Panel>
    //                                       </Collapse>
    //                                     </Card>
    //                                   </>
    //                                 );
    //                               })}
    //                             </>
    //                           </Panel>
    //                         </Collapse>
    //                       </TimelineContent>
    //                     </TimelineItem>
    //                   );
    //                 })}
    //               </Timeline>
    //             </>
    //           );
    //         })}
    //       </>
    //     );
    //   } else {
    //     return (
    //       <Timeline
    //         sx={{ [`& .${timelineOppositeContentClasses.root}`]: { flex: 0.2 } }}
    //       >
    //         {Object.values(data).map((val) => {
    //           return (
    //             <TimelineItem>
    //               <TimelineOppositeContent color="textSecondary">
    //                 {val.time}
    //               </TimelineOppositeContent>
    //               <TimelineSeparator>
    //                 <TimelineDot />
    //                 <TimelineConnector />
    //               </TimelineSeparator>
    //               <TimelineContent>
    //                 <Title level={4}>
    //                   <Link to={"/news/" + val.id}>{val.title}</Link>
    //                 </Title>
    //                 <div>
    //                   <a href={val.url}>[{val.media}原文]</a>
    //                 </div>
    //                 {val.opinion_paragraph_pair.map((value) => {
    //                   return (
    //                     <>
    //                       <Card>
    //                         <Title level={5}>
    //                           {value.name}({value.WHO})
    //                         </Title>
    //                         <Title level={4} type="danger">
    //                           {value.VERB}
    //                         </Title>
    //                         <Collapse ghost>
    //                           <Panel
    //                             header={
    //                               value.opinion_list && value.opinion_list.join(" ")
    //                             }
    //                           >
    //                             <Title level={5} type="secondary">
    //                               {value.paragraph}
    //                             </Title>
    //                           </Panel>
    //                         </Collapse>
    //                       </Card>
    //                     </>
    //                   );
    //                 })}
    //               </TimelineContent>
    //             </TimelineItem>
    //           );
    //         })}
    //   </Timeline>
    // );
    //   }

}

function ShowContent(props) {
    const [show_data, setShowData] = useState(null);
    const [loading, setLoading] = useState(true);

    let show_type = props.show_type;
    let date = props.date;
    //   console.log(show_type);

    const post_url = "";

    useEffect(() => {
        fetch(post_url, { method: "POST" })
            .then((response) => response.json())
            .then((data) => {
                setLoading(false);
            })
            .catch((error) => {
                console.log("Post Error: ", error);
                setLoading(false);
            });
    }, [show_type, date]);

    if (loading) return <span>"Loading..."</span>;
    if (!show_data) return "No data!";

    // console.log(show_data);
    return <TimeLine data={show_data} show_type={show_type} />;
}

export default function TodaysNews(props) {
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [current, setCurrent] = useState("timeline_today");

    const onClick = (e) => {
        setCurrent(e.key);
    };
    const onChange = (date, dateString) => {
        console.log(date, dateString);
    };

    return (
        <>
            <Divider orientation="left">請選擇瀏覽方式</Divider>

            <Menu
                mode="horizontal"
                defaultSelectedKeys={[current]}
                onClick={onClick}
                selectedKeys={[current]}
            >
                <DatePicker onChange={onChange} />
                <Menu.SubMenu
                    key="timeline"
                    title="瀏覽日期"
                    icon={<FileOutlined />}
                >
                </Menu.SubMenu>

                <Menu.SubMenu
                    key="timeline"
                    title="依照「時間軸」呈現"
                    icon={<FileOutlined />}
                >
                    <Menu.Item key="timeline_today" icon={<FileOutlined />}>
                        「今日」標題時間軸
                    </Menu.Item>
                    <Menu.Item key="timeline_yesterday" icon={<FileOutlined />}>
                        「昨日」標題時間軸
                    </Menu.Item>
                    <Menu.Item key="timeline_before_yesterday" icon={<FileOutlined />}>
                        「前天」標題時間軸
                    </Menu.Item>
                </Menu.SubMenu>
                <Menu.SubMenu
                    key="common_person_cluster"
                    title="依照「共同人物分群結果」呈現"
                    icon={<FileOutlined />}
                >
                    <Menu.Item key="common_person_cluster_all" icon={<FileOutlined />}>
                        「全部」共同人物分群
                    </Menu.Item>
                    <Menu.Item key="common_person_cluster_today" icon={<FileOutlined />}>
                        「本日」共同人物分群
                    </Menu.Item>
                    <Menu.Item
                        key="common_person_cluster_yesterday"
                        icon={<FileOutlined />}
                    >
                        「昨日」共同人物分群
                    </Menu.Item>
                    <Menu.Item
                        key="common_person_cluster_before_yesterday"
                        icon={<FileOutlined />}
                    >
                        「前天」共同人物分群
                    </Menu.Item>
                </Menu.SubMenu>
            </Menu>
            <Divider orientation="left">
                {date}({current})
            </Divider>
            <ShowContent date={date} show_type={current} />
        </>
    );
}
