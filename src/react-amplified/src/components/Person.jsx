import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent, {timelineOppositeContentClasses} from "@mui/lab/TimelineOppositeContent";

import { LoadingOutlined } from "@ant-design/icons";
import {
  Spin,
  Col,
  Divider,
  Row,
  Statistic,
  Typography,
  Menu,
  FileOutlined,
  Card,
  Collapse,
} from "antd";

const { Panel } = Collapse;
const { Meta } = Card;
const { Title } = Typography;



function PersonInfo(props) {
  let person_name = props.person_name;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  let post_url = "https://6pd8cpbd2g.execute-api.us-east-1.amazonaws.com/Prod/person-info?name=";

  useEffect(() => {
    fetch(post_url + person_name, { method: "POST" })
      .then((response) => response.json())
      .then((data) => {
        setData(data);
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
  if (loading)
    return (
      <>
        <span>"Loading..."</span>
        <Spin indicator={antIcon} />
      </>
    );
  if (error) return "Error!";
  if (!data) return "No data!";

  return (
    <Row>
      <Col flex={1}>
        <Card
          hoverable
          style={{ width: 240 }}
          cover={<img alt="example" src={data['dailyview_image_url']} />}
        >
          <Meta
            title={person_name}
            description={"圖片來源：" + data['dailyview_image_url']}
          />
        </Card>
      </Col>
      <Col flex={1}>
        <Title level={1}>{person_name}</Title>
        <Title level={2}>
          所屬政黨：{data["party"] && data["party"]}
        </Title>
        <Title level={2}>
          職稱：{data["title"] && data["title"]}
        </Title>
        <p>備註：如果「所屬政黨」、「職稱」未顯示，是因為 Google 搜尋無直接顯示資料，故該欄位為空。</p>
      </Col>
      {/* <Col flex={4}>
        <Statistic title="出現於今日新聞共" value={12345} />
        <Statistic title="出現於這本週新聞共" value={12345} />
        <Statistic title="今日意見共" value={12345} />
        <Statistic title="本週意見共" value={12345} />
      </Col> */}
    </Row>
  );
}

function TimeLine(props) {
    let [data, setData] = useState(props.data);
  
    if (!data) return "No data!";
  
    if (Array.isArray(data)) {
      console.log("data timeline array", data);
      return (
        <>
          {/* <Divider orientation="left">{item['title']}</Divider> */}
          <Timeline
            sx={{
              [`& .${timelineOppositeContentClasses.root}`]: { flex: 0.2 },
            }}
          >
            {data.map((val) => {
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
                                    {value.OPINION_SRC_found.join(" ")}
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
}
function ShowContent(props) {
    const [show_data, setShowData] = useState(null);
    const [loading, setLoading] = useState(true);
    const person_name = props.person_name;
  
    let show_type = props.show_type;
    let date = props.date;
  
    const post_url =
      "https://6pd8cpbd2g.execute-api.us-east-1.amazonaws.com/Prod/person-news?name=";
  
    useEffect(() => {
      fetch(post_url + person_name, { method: "POST" })
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
    }, [show_type, date]);
  
    if (loading) return <span>"Loading..."</span>;
    if (!show_data) return "No data!";
  
    return <TimeLine data={show_data} show_type={show_type} />;
}

export default function Person(props) {
  let params = useParams();
  const person_name = params.name;
  
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [current, setCurrent] = useState("timeline_all");
  const onClick = (e) => {
    // console.log('click ', e);
    setCurrent(e.key);
  };
  return (
    <>
        <PersonInfo person_name={person_name} />

      {/*<Divider orientation="left">請選擇瀏覽方式</Divider>
      <Menu mode="horizontal" defaultSelectedKeys={[current]} onClick={onClick}>
        <Menu.SubMenu
          key="timeline"
          title="依照「時間軸」呈現"
          icon={<FileOutlined />}
        >
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
        {/* </Menu.SubMenu> */}

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
      {/* </Menu> */}

      {/* <Divider orientation="left">
        {date} {person_name}({current})
      </Divider> */}


      <ShowContent person_name={person_name} show_type={current} date={date} />
    </>
  );
}
