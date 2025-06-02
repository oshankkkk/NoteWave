import React from "react";
import logo from "../../assets/Logos/SideBar_logo.svg";
export const Sidebar = () => {
  return (
    <aside>
      <div
        style={{
          position: "absolute",
          left: "69px",
          top: 0,
          bottom: 0,
          width: "1px",
          backgroundColor: "#ccc",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "92px",
          left: 0,
          right: 0,
          height: "1px",
          backgroundColor: "#ccc",
        }}
      />
      <div>
        <img src={logo} alt="App logo" />
        <ul>
          <li></li>
        </ul>
      </div>
    </aside>
  );
};
