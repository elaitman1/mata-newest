import React from "react";
import Feed from "./feed";
import Machine from "./machine";
import ChatItem from "./chat/chatItem";
import ProfileItem from "./profile/profileItem";

const Main = props => {
  const renderMain = () => {

    //see parent of profileItem to see where toggleNotification comes from
    if (props.displayProfile) {
      return (
        <ProfileItem
          displayProfile={props.displayProfile}
          user={props.user}
          hideProfile={props.hideProfile}
          toggleNotification={props.toggleNotification}
        />
      );
    } else if (props.displayChat) {
      return (
        <ChatItem
          user={props.user}
          chats={props.chats}
          displayChat={props.displayChat}
          setInitialTime={props.setInitialTime}
          sendNewMessage={props.sendNewMessage}
        />
      );
    } else {
      if (!props.machineSelected) {
        return (
          <Feed
            logIn={props.logIn}
            cells={props.cells}
            toggleMachineSelection={props.toggleMachineSelection}
            user={props.user}
          />
        );
      } else {
        return (
          <Machine
            login={props.logIn}
            user={props.user}
            machine={props.machineSelected}
            chats={props.chats}
            toggleMachineSelection={props.toggleMachineSelection}
            saveReporting={props.saveReporting}
            setDeviceTimer={props.setDeviceTimer}
            saveNewJob={props.saveNewJob}
            latestJob={props.latestJob}
          />
        );
      }
    }
  };

  return (
    <div id="main" className="main-container">
      {renderMain()}
    </div>
  );
};

export default Main;
