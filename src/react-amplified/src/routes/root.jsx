import React from "react";
import { Outlet, Link } from "react-router-dom";
import { DoubleRightOutlined, HomeOutlined } from "@ant-design/icons";
import { Layout, Menu, FloatButton } from "antd";

const { Header, Content, Footer, Sider } = Layout;

const items = [
  // {
  //   icon: <HomeOutlined />,
  //   tag: "關於",
  //   link: '/about',
  // },
  // {
  //   icon: <HomeOutlined />,
  //   tag: "Dash Board",
  //   path: "/dashboard",
  // },
  {
    icon: <DoubleRightOutlined />,
    tag: "查看所有人物",
    path: "/all-person",
  },
  {
    icon: <DoubleRightOutlined />,
    tag: "瀏覽新聞",
    path: "/todays-news",
  },
  // {
  //   icon: <DoubleRightOutlined />,
  //   tag: "2022九合一選舉",
  //   path: "/election",
  // },
  // {
  //   icon: <DoubleRightOutlined />,
  //   tag: "關鍵字搜尋[更改網址]",
  //   path: "keyword_in_paragraph/當選後",
  // },
].map((element, index) => ({
  key: String(index + 1),
  icon: element.icon,
  label: <Link to={element.path}>{`${element.tag}`}</Link>,
}));

const App = () => (
  <Layout hasSider>
    <Sider
      style={{
        overflow: "auto",
        height: "100vh",
        // width: '100%',
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div className="logo" />
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["4"]}
        items={items}
      />
    </Sider>
    <Layout
      className="site-layout"
      style={{
        marginLeft: 200,
      }}
    >
      <Header
        className="site-layout-background"
        style={{
          padding: 0,
        }}
      ></Header>
      <FloatButton.BackTop visibilityHeight={-1} />
      <Content
        style={{
          margin: "24px 16px 0",
          overflow: "initial",
          minHeight: "100vh",
        }}
      >
        <Outlet />
      </Content>
      <Footer
        style={{
          textAlign: "center",
        }}
      >
        ©2022 Created by James HUANG
      </Footer>
    </Layout>
  </Layout>
);
export default App;
