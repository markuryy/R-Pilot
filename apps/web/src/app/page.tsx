import React from "react";
import SessionManager from "./session/session_manager";
import Authentication from "./authentication";
import pkg from "../../package.json";

export default function Home() {
  return (
    <Authentication>
      <SessionManager version={pkg.version} />
    </Authentication>
  );
}
