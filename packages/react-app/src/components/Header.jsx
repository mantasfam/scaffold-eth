import { PageHeader } from "antd";
import React from "react";

// displays a page header
export default function Header() {
  return (
    <div style={{ backgroundColor: "powderblue" }}>
      <PageHeader title="🏗 NFT" subTitle="marketplace" style={{ cursor: "pointer" }} />
    </div>
  );
}
