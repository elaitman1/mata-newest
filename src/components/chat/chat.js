import React, { Component } from "react";
import _ from "lodash";

export default class Chat extends Component {
  state = {
    search: "",
    showToday:true,
    targetHeader:""
  };

  toggleAllChatsState = (e) => {
   let {allChats, showToday} = this.state 
      this.setState({allChats:!allChats, showToday:!showToday, targetHeader:e.target.attributes[0].nodeValue
    })
  }

  update = e => {
    this.setState({ search: e.currentTarget.value });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.setState({ search: "" });
  };

  render = () => {
   let {showToday, search, targetHeader} = this.state
    const chats = this.props.chats;

    let latestJobPartDate, filteredChatResult;
    if (search.trim() === "" && showToday) {
      Object.keys(chats).forEach(chatType => {

        if (chatType !== "Machines") {
          Object.keys(chats[chatType]).forEach(chatName => {

            const chatObj = chats[chatType][chatName];
            const startTime = chatObj.responses["Start Time"];
            const editTime =
              chatType === "Parts"
                ? startTime.slice(startTime.length - 19, startTime.length)
                : startTime;
            if (!latestJobPartDate || new Date(editTime) > new Date(latestJobPartDate)) {
              latestJobPartDate = editTime;
            }
          });
        }
      });

      filteredChatResult = {
        Machines: this.props.chats.Machines,
        Parts: {},
        Jobs: {}
      };

      let d = new Date(latestJobPartDate);
      let latestJobPartDateOutput = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();

      Object.keys(chats).forEach(chatType => {
        if (chatType !== "Machines") {
          Object.keys(chats[chatType]).forEach(chatName => {
            const chatObj = chats[chatType][chatName];
            const startTime = chatObj.responses["Start Time"];
            const editTime =
              chatType === "Parts"
                ? startTime.slice(startTime.length - 19, startTime.length)
                : startTime;
        let d = new Date(editTime);
        let editTimeOutput = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
            if (editTimeOutput === latestJobPartDateOutput) {
              filteredChatResult[chatType][chatName] = chatObj;
            }
          });
        }
      });

    }else if (search.trim() === "" && !showToday && targetHeader === "Parts") {
      Object.keys(chats).forEach(chatType => {

        if (chatType !== "Machines") {
          Object.keys(chats[chatType]).forEach(chatName => {

            const chatObj = chats[chatType][chatName];
            const startTime = chatObj.responses["Start Time"];
            const editTime =
              chatType === "Parts"
                ? startTime.slice(startTime.length - 19, startTime.length)
                : startTime;
            if (!latestJobPartDate || new Date(editTime) > new Date(latestJobPartDate)) {
              latestJobPartDate = editTime;
            }
          });
        }
      });

      filteredChatResult = {
        Machines: this.props.chats.Machines,
        Parts: this.props.chats.Parts,
        Jobs: {}
      };

      let d = new Date(latestJobPartDate);
      let latestJobPartDateOutput = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();

      Object.keys(chats).forEach(chatType => {
        if (chatType !== "Machines") {
          Object.keys(chats[chatType]).forEach(chatName => {
            const chatObj = chats[chatType][chatName];
            const startTime = chatObj.responses["Start Time"];
            const editTime =
              chatType === "Parts"
                ? startTime.slice(startTime.length - 19, startTime.length)
                : startTime;
        let d = new Date(editTime);
        let editTimeOutput = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
            if (editTimeOutput === latestJobPartDateOutput) {
              filteredChatResult[chatType][chatName] = chatObj;
            }
          });
        }
      });
    }else if(search.trim() === "" && !showToday && targetHeader === "Jobs"){
      Object.keys(chats).forEach(chatType => {

        if (chatType !== "Machines") {
          Object.keys(chats[chatType]).forEach(chatName => {

            const chatObj = chats[chatType][chatName];
            const startTime = chatObj.responses["Start Time"];
            const editTime =
              chatType === "Parts"
                ? startTime.slice(startTime.length - 19, startTime.length)
                : startTime;
            if (!latestJobPartDate || new Date(editTime) > new Date(latestJobPartDate)) {
              latestJobPartDate = editTime;
            }
          });
        }
      });

      filteredChatResult = {
        Machines: this.props.chats.Machines,
        Parts: {},
        Jobs: this.props.chats.Jobs
      };

      let d = new Date(latestJobPartDate);
      let latestJobPartDateOutput = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();

      Object.keys(chats).forEach(chatType => {
        if (chatType !== "Machines") {
          Object.keys(chats[chatType]).forEach(chatName => {
            const chatObj = chats[chatType][chatName];
            const startTime = chatObj.responses["Start Time"];
            const editTime =
              chatType === "Parts"
                ? startTime.slice(startTime.length - 19, startTime.length)
                : startTime;
        let d = new Date(editTime);
        let editTimeOutput = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
            if (editTimeOutput === latestJobPartDateOutput) {
              filteredChatResult[chatType][chatName] = chatObj;
            }
          });
        }
      });
    } else {
      filteredChatResult = {
        Machines: {},
        Parts: {},
        Jobs: {}
      };


      //here instead of filtering just the chats, we can also do all the machines
      //so want to add machines from the whole day in the same format
      Object.keys(chats).forEach(chatType => {

        //goes through chats
        Object.keys(chats[chatType]).forEach(chatName => {

          //goes through chatname
          const searchString = _.lowerCase(this.state.search);
          //cuts off string that is searched
          if (_.lowerCase(chatName).includes(searchString)) {
            //if what was searched matches the name of the chat
            const chatObj = chats[chatType][chatName];

            //then chat obj is created, then filtered chat result at chatname = chat obj
            filteredChatResult[chatType][chatName] = chatObj;
          }
        });
      });
    }

    return (
      <div className="chat-container">
        <div className="chat-header">
          <form className="chat-search" onSubmit={this.handleSubmit}>
            <img className="logo" src="./assets/search.png" alt="Search" />
            <input
              type="text"
              value={this.state.search}
              placeholder="Search"
              onChange={this.update}
            />
          </form>
        </div>
        {Object.keys(filteredChatResult).map((type, idx) => {
          const chats = filteredChatResult[type];
          return (
            <ChatGroup
              key={idx}
              type={type}
              chats={chats}
              selectChat={this.props.selectChat}
              toggleAllChatsState={this.toggleAllChatsState}
            />
          );
        })}
      </div>
    );
  };
}
const ChatGroup = props => {
  
  let sortedList = Object.keys(props.chats).sort(function (a, b) {
    var x = a.toUpperCase(),
        y = b.toUpperCase();
    if (x > y) {
        return 1;
    }
    if (x < y) {
        return -1;
    }
    return 0;
  });

  const chatGroupItems =
  sortedList.length === 0 ? (
      <p>No {_.lowerFirst(props.type)} for your searched value.</p>
    ) : (
      
      sortedList.map((chat, idx) => {
        const className = `chat-group-item-icon ${props.type}`;
        return (
          <div
            key={idx}
            className="chat-group-item"
            onClick={props.selectChat(props.type, chat)}
          >
            <span className={className} />
            <p>{chat}</p>
          </div>
        );
      })
    );

  return (
    <div className="chat-group-container">
      {props.type === "Machines"?
        <h5>{props.type}</h5> 
      : 
        <div class='toggleChatContainer'>
        <h5>{props.type}</h5> 
        <label class="switch" >       
        <input class="switch-input" type="checkbox"/>
        <span value={props.type} class="switch-label" data-on="All" data-off="Today" onClick={(param)=>props.toggleAllChatsState(param)}></span> 
        <span value={props.type}class="switch-handle" onClick={(param)=>props.toggleAllChatsState(param)}></span>
        </label>
        </div>
      }
      {chatGroupItems}
    </div>
  );
};
