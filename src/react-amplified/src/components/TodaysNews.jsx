import { useState, useEffect } from "react";

import { Link } from "react-router-dom";

import {
  Divider,
  Typography,
  Menu,
  Card,
  Collapse,
  DatePickerProps,
  DatePicker,
} from "antd";
import { FileOutlined } from "@ant-design/icons";

import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent, {
  timelineOppositeContentClasses,
} from "@mui/lab/TimelineOppositeContent";

const { Panel } = Collapse;
const { Title } = Typography;

function TimeLine(props) {
  let [data, setData] = useState(props.data);


  if (!data) return "No data!";

  if (Array.isArray(props.data)) {
    console.log("data timeline array", props.data);
    return (
      <>
        {/* <Divider orientation="left">{item['title']}</Divider> */}
        <Timeline
          sx={{
            [`& .${timelineOppositeContentClasses.root}`]: { flex: 0.2 },
          }}
        >
          {props.data.map((val) => {
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
                    <Panel header="閱讀人物意見">
                      <>
                        {val.opinion_list.map((value) => {
                          return (
                            <>
                              <Card>
                                <Title level={5}>
                                  {value.OPINION_SRC_found.join(" ")}{value.opinion_src_resolution != null && " (可能為： " + value.opinion_src_resolution.join(" ") + ")"}
                                </Title>
                                <Title level={4} type="danger">
                                  {value.OPINION_OPR_found.join(" ")}
                                </Title>
                                <Title level={5}>
                                  {value.OPINION_SEG_found.join("\n")}
                                </Title>
                                <Collapse ghost>
                                  <Panel header="來源段落">
                                    <Title level={5} type="secondary">
                                      {val.content[value.paragraph_index]}
                                    </Title>
                                  </Panel>
                                </Collapse>
                              </Card>
                            </>
                          );
                        })}
                      </>
                      <div><a href={val.url}>[{val.source}原文]</a></div>
                    </Panel>
                  </Collapse>
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      </>
    );
  }
  //   else {
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
  const [date, setDate] = useState(props.date);
  console.log("props date : " + props.date)

  let show_type = props.show_type;

  const post_url =
    "https://6pd8cpbd2g.execute-api.us-east-1.amazonaws.com/Prod/news?";
  useEffect(() => {
    console.log("render show content!" + props.date);
    fetch(post_url + "date=" + props.date, { method: "POST" })
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        // console.log("Post Success: ", data);
        setShowData(data);
      })
      .catch((error) => {
        console.log("Post Error: ", error);
        setLoading(false);
      });
  }, [show_type, props.date]);

  if (loading) return <span>"Loading..."</span>;
  if (!show_data) return "No data!";

  return <TimeLine data={show_data} show_type={show_type} />;
}

export default function TodaysNews(props) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [current, setCurrent] = useState("timeline_today");

  const onClick = (e) => {
    setCurrent(e.key);
  };
  const onChange = (date, dateString) => {
    console.log(dateString);
    setDate(dateString)
  };

  return (
    <>
      <Divider orientation="left">請選擇瀏覽日期</Divider>

      <Menu
        mode="horizontal"
        defaultSelectedKeys={[current]}
        onClick={onClick}
        selectedKeys={[current]}
      >
        <DatePicker onChange={onChange} />
        {/* <Menu.SubMenu
          key="timeline"
          title="瀏覽日期"
          icon={<FileOutlined />}
        ></Menu.SubMenu>

        <Menu.SubMenu
          key="timeline"
          title="依照「時間軸」呈現"
          icon={<FileOutlined />}
        > */}
          {/* <Menu.Item key="timeline_today" icon={<FileOutlined />}>
                        「今日」標題時間軸
                    </Menu.Item>
                    <Menu.Item key="timeline_yesterday" icon={<FileOutlined />}>
                        「昨日」標題時間軸
                    </Menu.Item>
                    <Menu.Item key="timeline_before_yesterday" icon={<FileOutlined />}>
                        「前天」標題時間軸
                    </Menu.Item> */}
        {/* </Menu.SubMenu> */}
        {/* <Menu.SubMenu
          key="common_person_cluster"
          title="依照「共同人物分群結果」呈現"
          icon={<FileOutlined />}
        > */}
          {/* <Menu.Item key="common_person_cluster_all" icon={<FileOutlined />}>
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
                    </Menu.Item> */}
        {/* </Menu.SubMenu> */}
      </Menu>
      {/* <Divider orientation="left">
        {date}({current})
      </Divider> */}
      <ShowContent date={date} show_type={current} />
    </>
  );
}
