import React, { PureComponent, useState, useEffect } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Col, Divider, Row, Statistic, Typography } from 'antd';

import {
  gMapToObject,
} from '../utility/GraphSON';
const { Title } = Typography;



function TodayCountPlot(props) {
  //   static demoUrl = 'https://codesandbox.io/s/stacked-bar-chart-s47i2';
  let hour_array = [
    "00", "01", "02", "03", "04", "05", "06", "07", "08", "09",
    "10", "11", "12", "13", "14", "15", "16", "17", "18", "19",
    "20", "21", "22", "23"
  ];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [person_count, setPersonCount] = useState(null);

  let end_point = "https://g60lj6ls7h.execute-api.us-east-1.amazonaws.com/Prod"
  useEffect(() => {
    let germlin_cmd = `g.V().hasLabel('title').has('date', '${props.date}').groupCount().by('hour').order(local).by(keys)`;
    // let germlin_cmd = `g.V().hasLabel('person').has('daily_category', '${category}').valueMap('daily_image_url', 'name', 'daily_category', 'title', 'party')`;    
    let post_url = end_point + "?gremlin=" + germlin_cmd;
    fetch(post_url, { method: 'POST' })
      .then((response) => response.json())
      .then((data) => {
        // setData(data['response']['result']['data']['@value'][0].map((item, index) => {
        //   let hour = item['@value'][0];
        //   let count = item['@value'][1];
        //   return (
        //     {
        //       "name": hour,
        //       "ALL": count,
        //     }
        //   );
        // }));
        let data_array = gMapToObject(data['response']['result']['data']['@value'][0]['@value']);

        setData(Object.values(data_array).map((item, index) => {
          let hour = Object.keys(data_array)[index];
          let count = item;
          return (
            {
              "name": hour,
              "ALL": count,
            }
          );
        }));
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


  return (
    <>
      <ResponsiveContainer width="80%" height="50%">
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {/* <Bar dataKey="pv" stackId="a" fill="#8884d8" />
                <Bar dataKey="uv" stackId="a" fill="#82ca9d" /> */}
          {/* <Bar dataKey="CNA" stackId="a" fill="#8884d8" /> */}
          <Bar dataKey="ALL" stackId="a" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

function DateCountPlot(props) {
  //   static demoUrl = 'https://codesandbox.io/s/stacked-bar-chart-s47i2';


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [person_count, setPersonCount] = useState(null);

  // generate array of date pass week
  let date_array = [];
  let date = new Date(props.date);
  let day = date.getDay();
  let start_date = new Date(date);
  start_date.setDate(date.getDate() - day);
  for (let i = 0; i < 7; i++) {
    let new_date = new Date(start_date);
    new_date.setDate(start_date.getDate() + i);
    date_array.push(new_date.toISOString().slice(0, 10));
  }
  let tartget_date = "'" + date_array.join("','") + "'"
  console.log(tartget_date);

  let end_point = "https://g60lj6ls7h.execute-api.us-east-1.amazonaws.com/Prod"
  useEffect(() => {
    let germlin_cmd = `g.V().hasLabel('title').has('date', within(${tartget_date})).groupCount().by('date').order(local).by(keys)`;
    // let germlin_cmd = `g.V().hasLabel('person').has('daily_category', '${category}').valueMap('daily_image_url', 'name', 'daily_category', 'title', 'party')`;    
    let post_url = end_point + "?gremlin=" + germlin_cmd;
    fetch(post_url, { method: 'POST' })
      .then((response) => response.json())
      .then((data) => {
        console.log(data['response']['result']['data']['@value'][0]['@value']);

        let data_array = gMapToObject(data['response']['result']['data']['@value'][0]['@value']);

        setData(Object.values(data_array).map((item, index) => {
          let hour = Object.keys(data_array)[index];
          let count = item;
          return (
            {
              "label": hour,
              "COUNT": count,
            }
          );
        }));
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


  return (
    <>
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Legend />
        {/* <Bar dataKey="pv" stackId="a" fill="#8884d8" />
                <Bar dataKey="uv" stackId="a" fill="#82ca9d" /> */}
        <Bar dataKey="COUNT" stackId="b" fill="#8884d8" />
        {/* <Bar dataKey="COUNT" stackId="a" fill="#82ca9d" /> */}
      </BarChart>

    </>
  );
}

function Ststistic() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [person_count, setPersonCount] = useState(null);

  let end_point = "https://g60lj6ls7h.execute-api.us-east-1.amazonaws.com/Prod"
  useEffect(() => {
    let germlin_cmd = `g.V().hasLabel('opinion').count()`;
    // let germlin_cmd = `g.V().hasLabel('person').has('daily_category', '${category}').valueMap('daily_image_url', 'name', 'daily_category', 'title', 'party')`;    
    let post_url = end_point + "?gremlin=" + germlin_cmd;
    fetch(post_url, { method: 'POST' })
      .then((response) => response.json())
      .then((data) => {
        setData(data['response']['result']['data']['@value'][0]["@value"]);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });

  }, []);
  useEffect(() => {
    let germlin_cmd = `g.V().hasLabel('person').count()`;
    // let germlin_cmd = `g.V().hasLabel('person').has('daily_category', '${category}').valueMap('daily_image_url', 'name', 'daily_category', 'title', 'party')`;    
    let post_url = end_point + "?gremlin=" + germlin_cmd;
    fetch(post_url, { method: 'POST' })
      .then((response) => response.json())
      .then((data) => {
        setPersonCount(data['response']['result']['data']['@value'][0]["@value"]);
        // setLoading(false);
      })
      .catch((error) => {
        // setError(error);
        // setLoading(false);
      });

  }, []);

  if (loading) return "Loading...";
  if (error) return "Error!";
  if (!data) return "No data!";
  return (
    <Title level={4} type="danger">{data} 句，來自 {person_count} 位政治人物的意見</Title>
  );
}

export default function DashBoard() {
  let date = new Date().toISOString().split('T')[0]

  return (
    <>
      <Ststistic />
      <Divider orientation="left">今天每小時新聞量</Divider>
      <TodayCountPlot date={date} />
      <Divider orientation="left">本星期每天新聞量</Divider>
      <DateCountPlot date={date} />
    </>
  );
}



