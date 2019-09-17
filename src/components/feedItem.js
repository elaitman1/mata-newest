import React from "react";

const FeedItem = props => {
  const { name, utilization, timer, status } = props.machSpecs;
  let { timeOn } = props.machSpecs;

  const feedItemImg = timer ? (
    <img className="feed-item-img timer" src="./assets/timer.png" alt="Timer" />
  ) : (
    <img className="feed-item-img machlist" src="./assets/machList.png" alt="MachList" />
  );

  const timerText = timer ? (
    <div className="feed-item-timer-text">
      <p>{timer.timer}</p>
      <p>{timer.status}</p>
    </div>
  ) : (
    ""
  );
  timeOn = timeOn === "0 Sec" ? "Off" : `${timeOn} On`;

  return (
    <div
      className="feed-item"
      style={{
        border: status === "Online" ? "2px solid #7ED321" : "2px solid #9B9B9B"
      }}
      onClick={props.toggleMachineSelection(props.machSpecs)}
    >
      <span
        className="feed-indicator-dot"
        style={{
          backgroundColor: status === "Online" ? "#7ED321" : "#9B9B9B"
        }}
      />
      <div className="feed-item-img-wrapper">
        {feedItemImg}
        {timerText}
      </div>
      <div className="feed-item-text-wrapper">
        <p>{name}</p>
        <div
          style={{
            color:
              utilization >= 66
                ? "#7ED321"
                : utilization <= 39 ? "#BB0000" : "orange"
          }}
        >
          <p>{utilization}% Utilization</p>
          <p>{timeOn} Today</p>
        </div>
      </div>
      <p>{status}</p>
    </div>
  );
};

export default FeedItem;
