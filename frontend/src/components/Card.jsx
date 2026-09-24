import React from "react";
import { C } from "../theme.js";

export default function Card({ children, style, ...rest }) {
  return (
    <div className="app-card" style={style} {...rest}>
      {children}
    </div>
  );
}
