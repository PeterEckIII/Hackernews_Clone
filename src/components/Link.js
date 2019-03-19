import React from "react";
import { className } from "postcss-selector-parser";
import { AUTH_TOKEN as authToken } from "../constants";
import timeDifferenceForDate from "../utils";

const Link = props => {
  return (
    <div className="flex mt2 items-start">
      <div className="flex items-center">
        <span className="gray"> {props.index + 1} </span>
        {authToken && (
          <div className="ml1 gray f11" onClick={() => props._voteForLink()}>
            ▲
          </div>
        )}
      </div>
      <div className="ml1">
        <div>
          {props.link.description} ({props.link.url})
        </div>
        <div className="f6 lh-copy gray">
          {props.link.votes.length} votes | by{" "}
          {props.link.postedBy ? props.link.postedBy.name : "Unknown "}
          {""}
          {timeDifferenceForDate(props.link.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default Link;
