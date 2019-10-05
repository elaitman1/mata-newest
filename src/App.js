import React, { Component } from "react";
import Splash from "./components/splash";
import Navbar from "./components/navbar";
import Chat from "./components/chat/chat";
import Profile from "./components/profile/profile";
import Main from "./components/main";
import "./App.css";

export default class App extends Component {
  state = {
    user: {
      ID: "",
      user_email: "",
      first_name: "",
      last_name: "",
      notifications: {
        Text: false,
        Email: false,
        "Do Not Disturb": {
          on: true,
          From: {
            hour: null,
            min: null,
            sec: null
          },
          To: {
            hour: null,
            min: null,
            sec: null
          }
        }
      }
    },
    cells: {},
    chats: {
      Machines: {},
      Parts: {},
      Jobs: {}
    },
    isLoading: true,
    machineSelected: null,
    toggledNavbarMenu: null,
    displayChat: null,
    displayProfile: null,
    jobs:[],
    latestJob: {"job":"","part":""},
  };

  countDown = 0;

  componentDidMount = () => {
    const userData = localStorage.getItem("Mata Inventive");
    if (userData) {
      this.logIn(JSON.parse(userData).ID).then(res => {
        this.countDownTimers();
      });
    }
  };

  // converts Date.now() milliseconds into the time, in the appropriate measurement, since the message was sent
  timeConversion = (millisec, type) => {
    if (type === "timer") {
      let seconds = Math.ceil(millisec / 1000);
      const hours = Math.floor(seconds / 3600);
      seconds = seconds % 3600;
      const minutes = Math.floor(seconds / 60);
      seconds = seconds % 60;
      let sec = seconds > 0 ? this.formatSingleDigit(seconds) : "00";
      let mins = minutes > 0 ? this.formatSingleDigit(minutes) : "00";
      let hrs = hours > 0 ? this.formatSingleDigit(hours) : "00";
      return `${hrs}:${mins}:${sec}`;
    } else if (type === "timeOn") {
      const seconds = (millisec / 1000).toFixed(0);
      const minutes = (millisec / (1000 * 60)).toFixed(0);
      const hours = (millisec / (1000 * 60 * 60)).toFixed(0);
      if (seconds < 60) {
        return seconds + " Sec";
      } else if (minutes < 60) {
        const mins = parseInt(minutes) === 1 ? " Min" : " Mins";
        return minutes + mins;
      } else if (hours < 24) {
        const hrs = parseInt(hours) === 1 ? " Hr" : " Hrs";
        return hours + hrs;
      }
    }
  };

  countDownTimers = () => {
    let timers = [];
    const cells = Object.keys(this.state.cells);
    for (let i = 0; i < cells.length; i++) {
      const cell = this.state.cells[cells[i]];
      const devices = Object.keys(cell.devices);
      for (let j = 0; j < devices.length; j++) {
        const device = this.state.cells[cells[i]].devices[devices[j]];
        const timer = device.timer;
        timers.push(timer);
      }
    }
    if (
      this.countDown === 0 &&
      timers.some(timer => timer.status === "Remaining")
    ) {
      this.countDown = setInterval(this.countDownTimer, 1000);
    }
  };

  countDownTimer = () => {
    let newCells = Object.assign(this.state.cells, {});
    const cells = Object.keys(newCells);
    let timers = [];
    for (let i = 0; i < cells.length; i++) {
      const cell = newCells[cells[i]];
      const devices = Object.keys(cell.devices);
      for (let j = 0; j < devices.length; j++) {
        const device = newCells[cells[i]].devices[devices[j]];
        const currentTime = Date.now();
        const timerEndTime = new Date(device.timerEnd).getTime();
        const remaining = timerEndTime - currentTime;
        let timer;
        if (remaining > 0) {
          const timerRemaining = this.timeConversion(remaining, "timer");
          timer = { timer: timerRemaining, status: "Remaining" };
        } else if (
          remaining < 0 &&
          this.formatTime(new Date(currentTime)).slice(0, 10) ===
            this.formatTime(new Date(timerEndTime)).slice(0, 10)
        ) {
          const timerDuration = this.timeConversion(
            timerEndTime - new Date(device.timerStart).getTime(),
            "timer"
          );
          timer = { timer: timerDuration, status: "Finished" };
        }
        if (timer) {
          newCells[cells[i]].devices[devices[j]].timer = timer;
          timers.push(timer);
        }
      }
    }
    this.setState(prevState => ({
      cells: Object.assign(prevState.cells, newCells)
    }));
    if (timers.every(timer => timer.status === "Finished")) {
      clearInterval(this.countDown);
    }
  };

  logIn = async id => {
    const configState = await this.loadData(id).
    then(data => {

      //this is where all the fetch data is so that you do not need to fetch multiple times
      this.setState({ user: data[0], cells: data[1], chats: data[2], isLoading: false })
    });
    return configState;
  };
/////////////////////////////////////////////////////////////////////////////////////////////////////////z
  createDevicesDetailsUrl = id => {
    const localTime = this.formatTime(new Date());

    return `https://www.matainventive.com/cordovaserver/database/jsonmatafloorplan.php?id=${id}&today=${localTime}`;
  };

  formatTime = date => {
    const year = date.getFullYear();
    const month = this.formatSingleDigit(date.getMonth() + 1);
    const day = this.formatSingleDigit(date.getDate());
    const hour = this.formatSingleDigit(date.getHours());
    const min = this.formatSingleDigit(date.getMinutes());
    const sec = this.formatSingleDigit(date.getSeconds());
    return `${year}-${month}-${day}T${hour}:${min}:${sec}`;
  };

  formatSingleDigit = timeVal => {
    return (timeVal = timeVal < 10 ? `0${timeVal}` : timeVal);
  };

  fetchData = async url => {
    const res = await fetch(url).then(res => res.json()).catch(err => console.log("err", err));
    return res;
  };

  loadData = async id => {
    const userUrl = `https://www.matainventive.com/cordovaserver/database/jsonmatausersprofile.php?id=${id}`;
    const user = await this.fetchData(userUrl).then(userData => userData);
    const notificationsUrl = `https://www.matainventive.com/cordovaserver/database/jsonmatastatusconfig.php?id=${id}`;
    const notifications = await this.fetchData(notificationsUrl).then(
      notificationsData => notificationsData
    );
    const cellsUrl = `https://www.matainventive.com/cordovaserver/database/jsonmatacell.php?id=${id}`;
    const cells = await this.fetchData(cellsUrl).then(cellsData => cellsData);
    const devicesUrl = `https://www.matainventive.com/cordovaserver/database/jsonmatacelladd.php?id=${id}`;
    const devices = await this.fetchData(devicesUrl).then(
      devicesData => devicesData
    );
    const devicesDetailsUrl = this.createDevicesDetailsUrl(id);
    const devicesDetails = await this.fetchData(devicesDetailsUrl).then(
      devsDetsData => devsDetsData
    );
    const jobsPartsUrl = `https://www.matainventive.com/cordovaserver/database/jsonmataparts.php?id=${id}`;
    const jobsParts = await this.fetchData(jobsPartsUrl).then(
      jobsPartsData => jobsPartsData
    );
    const reportingUrl = `https://www.matainventive.com/cordovaserver/database/jsonmataPrepAll.php?id=${id}`;
    const reporting = await this.fetchData(reportingUrl).then(
      reportingData => reportingData
    );
    const prepNotesUrl = `https://www.matainventive.com/cordovaserver/database/jsonmatanotes.php?id=${id}`;
    const prepNotes = await this.fetchData(prepNotesUrl).then(prepNotesData => prepNotesData);
    const timersUrl = `https://www.matainventive.com/cordovaserver/database/jsonmataSensorBasic.php?id=${id}`;
    ///timers takes a long time///////////////////////////////
    const timers = await this.fetchData(timersUrl).then(timerData => timerData);
    const chatHistoryUrl = `https://www.matainventive.com/cordovaserver/database/jsonmatachat.php?id=${id}`;
    const chatHistory = await this.fetchData(chatHistoryUrl).then(
      chatHistoryData => chatHistoryData
    );
    const inspectHistoryUrl = `https://www.matainventive.com/cordovaserver/database/jsonmatainspect.php?id=${id}`;
    const inspectHistory = await this.fetchData(inspectHistoryUrl).then(
      inspectHistoryData => inspectHistoryData
    );

    const currentTime = Date.now();

    const dataArr = await Promise.all([
      user,
      notifications,
      cells,
      devices,
      devicesDetails,
      jobsParts,
      timers,
      reporting,
      prepNotes,
      chatHistory,
      inspectHistory
    ]).then(data => {
      const user = data[0];
      const notifications = data[1];
      const cells = data[2];
      const devices = data[3];
      const devicesDetails = this.createDeviceObject(data[4]);
      const jobsParts = data[5];
      const timers = this.createObjectWithIDKeys(data[6]);
      const reporting = this.createObjectWithIDKeys(data[7]);
      const prepNotes = this.createObjectWithIDKeys(data[8]);
      const chatHistory = data[9];
      const inspectHistory = data[10];

      const userObj = user[0];
      userObj.notifications = {};
      userObj.notifications.Text =
        notifications[0].alertenablephone === "1" ? true : false;
      userObj.notifications.Email =
        notifications[0].alertenableemail === "1" ? true : false;
      let cellObj = {};
      let chatObj = { Machines: {}, Parts: {}, Jobs: {} };
      cells.forEach(cell => {

        let dataObj = {};
        dataObj["cellName"] = cell.name;

        const cellDevices = devices.filter(device=>{

           return device.cell_id === cell.cell_id
        });

        /////////////////////////////////////////////cell devices has all three of the devices where can we get the chat history
        let cellDevsObj = {};

        cellDevices.forEach(cellDev => {

          const id = cellDev.device_id;
          const devObj = devicesDetails[id];

          if (typeof devObj === "undefined") {
            cellDev["timeOn"] = 0
            cellDev["utilization"] = 0;
          } else {
            cellDev["timeOn"] = this.timeConversion(
            1000*parseInt(devObj.SumONTimeSeconds),
            "timeOn")
            let utilization = Math.round(
              parseInt(devObj.SumDayUpTime) /
                parseInt(devObj.SumONTimeSeconds) *
                100
            );
            utilization = utilization.toString() === "NaN" ? 0 : utilization;
            cellDev["utilization"] = utilization;
          };
          let timer = "";
          const devTimer = timers[id];
          if (devTimer) {
            cellDev["timerEnd"] = devTimer.MaxEndTimeIdle;
            cellDev["timerStart"] = devTimer.MaxStartTimeActive;
            const timerEndTime = new Date(devTimer.MaxEndTimeIdle).getTime();
            const remaining = timerEndTime - currentTime;
            if (remaining > 0) {
              const timerRemaining = this.timeConversion(remaining, "timer");
              timer = { timer: timerRemaining, status: "Remaining" };
            } else if (
              remaining < 0 &&
              this.formatTime(new Date(currentTime)).slice(0, 10) ===
                this.formatTime(new Date(timerEndTime)).slice(0, 10)
            ) {
              const timerDuration = this.timeConversion(
                timerEndTime - new Date(devTimer.MaxStartTimeActive).getTime(),
                "timer"
              );
              timer = { timer: timerDuration, status: "Finished" };
            }
          }
          cellDev["timer"] = timer;
          let status;
          var maxOnTime = '1970/01/01';
          var maxEndTime = '1970/01/01';
          if (typeof devObj !== "undefined") {
            maxOnTime = currentTime - new Date(devObj.MaxOnTime).getTime();
            maxEndTime =currentTime - new Date(devObj.MaxEndTime).getTime();
          }
          if (maxOnTime <= 600000) {
            // if (devObj.MaxEndTime <= devObj.MaxStartTime || maxEndTime <= 600000) {
            status = "Online";
            // }
          } else {
            status = "Offline";
          }
          cellDev["status"] = status;
          let reportingObj = {
            speccheck: false,
            cadwork: false,
            toolpath: false,
            offset: false,
            clean: false,
            inspection: false
          };
          const prepChk = reporting[id];
          if (prepChk) {
            reportingObj = prepChk;
          }
          let notes = "";
          const prepNote = prepNotes[id];
          if (prepNote) {
            notes = prepNote.note;
          }
          reportingObj.notes = notes;
          cellDev["reporting"] = reportingObj;


          // if (typeof devObj !== "undefined") {

            let machinename = cellDev.name



          chatObj.Machines[machinename] = {
            chatHistory: { chatFirstBegan: "", chatLog: [] },
            responses: {
              "Machine Utilization": `${cellDev["utilization"]}% of utilization.`,
              "Machine Status": status
            }
          };
        // }
          cellDevsObj[id] = cellDev;
        });
        dataObj["devices"] = cellDevsObj;
        cellObj[cell.cell_id] = dataObj;
      });

      // const latestJobPartDate = jobsParts[0].EditTime.slice(0, 10);
      jobsParts.forEach(jobPart => {
        const {
          EditTime: editTime,
          jobnumber,
          partnumber,
          partcount
        } = jobPart;

        let now = new Date();

        let date = Date.parse(editTime);
        let d = new Date(date);

        let editTimeZDisplay = d.getFullYear()+"/"+(d.getMonth()+1)+"/"+d.getDate()+ " " +
        d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();

        const inspectItem = inspectHistory.filter(
          device => device.jobnumber === jobnumber
        );
        let inspectgood = 0;
        let inspectbad = 0;
        inspectItem.forEach(inspectItemi => {
          if (inspectItemi.comment=="goodParts"){
            inspectgood += parseInt(inspectItemi.number)
          }
          if (inspectItemi.comment=="badParts"){
            inspectgood += parseInt(inspectItemi.number)
          }
        })

        // if (editTime.slice(0, 10) === latestJobPartDate) {
        chatObj.Jobs[jobnumber] = {
          chatHistory: { chatFirstBegan: "", chatLog: [] },
          responses: {
            "Start Time": editTimeZDisplay,
            "Part Number": partnumber,
            "Part Count": partcount,
            "Inspection": "Good:" + inspectgood.toString() + ",Bad:" + inspectbad.toString()
          }
        };

        const currLatestJobForPart = chatObj.Parts[partnumber];
        let currLatestPartEditTime;
        if (currLatestJobForPart) {
          currLatestPartEditTime = currLatestJobForPart.responses["Start Time"];
          currLatestPartEditTime = currLatestPartEditTime.slice(
            currLatestPartEditTime.length - 19,
            currLatestPartEditTime.length
          );
        }
        if (!currLatestJobForPart || currLatestPartEditTime < editTime) {
          chatObj.Parts[partnumber] = {
            chatHistory: { chatFirstBegan: "", chatLog: [] },
            responses: {
              "Start Time": `${jobnumber}: ${editTimeZDisplay}`,
              "Latest Job Number": jobnumber,
              "Part Count": `${jobnumber}: ${partcount}`
            }
          };
        }
        // }
      });

      chatHistory.forEach(chat => {
        const chatItem = chatObj[chat.type][chat.properties];
        if (chatItem) {
          chatObj[chat.type][chat.properties].chatHistory = JSON.parse(
            chat.chat_history
          );
        }
      });

      return [userObj, cellObj, chatObj];
    });

    return dataArr;
  };

  createDeviceObject = devicesArr => {
    const vibDataObj = this.createObjectWithIDKeys(devicesArr[0]);
    const mtconDataObj = this.createObjectWithIDKeys(devicesArr[1]);
    let deviceIds = Object.keys(vibDataObj);
    Object.keys(mtconDataObj).forEach(mtDevId => {
      if (!vibDataObj[mtDevId]) {
        deviceIds.push(mtDevId);
      }
    });
    devicesArr = deviceIds.map(devId => {
      let vibData = vibDataObj[devId];
      if (vibData) vibData.device_id = devId;
      let mtconData = mtconDataObj[devId];
      if (mtconData) mtconData.device_id = devId;
      if (vibData && mtconData) {
        return vibData["SumONTimeSeconds"] > mtconData["SumONTimeSeconds"]
          ? vibData
          : mtconData;
      } else if (vibData) {
        return vibData;
      } else if (mtconData) {
        return mtconData;
      }
    });

    return this.createObjectWithIDKeys(devicesArr);
  };

  createObjectWithIDKeys = objectsArr => {
    let outputObject = {};
    objectsArr.forEach(obj => {
      let newObj = {};
      let id;
      Object.keys(obj).forEach(key => {
        if (key === "device_id") {
          id = obj[key];
        } else {
          newObj[key] = obj[key];
        }
      });
      if (!outputObject[id]) {
        outputObject[id] = newObj;
      }
    });
    return outputObject;
  };

  // toggles between Overview and Floorplan views within Feed component based on toggled value from Footer component (currently removed)
  selectView = view => {
    this.setState({ viewSelected: view });
  };

  // this function is passed down as props all the way to Feed Item component to select a machine and view/interact with the machine's various tasks
  toggleMachineSelection = machInfo => {
    return () => {
      this.setState({ machineSelected: machInfo });
    };
  };

  saveNewJob = jobsArr => {
    let newChats = Object.assign(this.state.chats, {});
    jobsArr.forEach(jobObj => {
      const jobNumber = jobObj.inputValues.jobNumber;
      const partNumber = jobObj.inputValues.partNumber;
      const partCount = jobObj.inputValues.partCount;
      const now = new Date();
      const editTime = this.formatTime(
        new Date(now.getTime() + now.getTimezoneOffset() * 60000)
      );
      newChats.Jobs[jobNumber] = {
        chatHistory: { chatFirstBegan: "", chatLog: [] },
        responses: {
          "Start Time": editTime,
          "Part Number": partNumber,
          "Part Count": partCount
        }
      };
      const currLatestJobForPart = newChats.Parts[partNumber];
      let currLatestPartEditTime;
      if (currLatestJobForPart) {
        currLatestPartEditTime = currLatestJobForPart.responses["Start Time"];
        currLatestPartEditTime = currLatestPartEditTime.slice(
          currLatestPartEditTime.length - 19,
          currLatestPartEditTime.length
        );
      }
      if (!currLatestJobForPart || currLatestPartEditTime < editTime) {
        newChats.Parts[partNumber] = {
          chatHistory: { chatFirstBegan: "", chatLog: [] },
          responses: {
            "Start Time": `${jobNumber}: ${editTime}`,
            "Latest Job Number": jobNumber,
            "Part Count": `${jobNumber}: ${partCount}`
          }
        };
      }
    });

    this.setState({ chats: newChats });
  };

  saveReporting = (cellId, deviceId, reportingObj) => {
    const prepChkDict = {
      "Clean Chamber": "clean",
      "Setup Job": "offset",
      "Inspection Room": "inspection",
      "Job Spec Confirmation": "speccheck",
      "Revise CAD Modeling": "cadwork",
      "Edit Toolpath": "toolpath"
    };
    let newCells = Object.assign(this.state.cells, {});
    Object.keys(reportingObj).forEach(type => {
      if (type === "Note") {
        newCells[cellId].devices[deviceId].reporting.notes = reportingObj[type];
      } else {
        const typeObj = reportingObj[type];
        Object.keys(typeObj).forEach(prepChk => {
          const prckBool = reportingObj[type][prepChk];
          const converted = prepChkDict[prepChk];
          newCells[cellId].devices[deviceId].reporting[converted] = prckBool;
        });
      }
    });
    this.setState({ cells: newCells });
  };

  setDeviceTimer = (cellId, deviceId, dateString) => {
    let newCells = Object.assign(this.state.cells, {});
    const timerTime = new Date(dateString).getTime();
    const timerRemaining = this.timeConversion(timerTime, "timer");
    newCells[cellId].devices[
      deviceId
    ].timer = `${timerRemaining} Remain On Timer`;
    this.setState(prevState => ({
      cells: Object.assign(prevState.cells, newCells)
    }));
    this.countDownTimers();
  };

  // transition effects for chat submenu when clicking the navbar's left logo icon;
  // chat menu is positioned off of the viewport by an amount equal to its width until the logo icon is toggled, where it slides in as the app's Main component also slides off the viewport to the right by the same width.
  toggleNavbarMenu = type => {
    let menu, mainPos, mainTransform, sideMenuTransform;
    if (type !== null) {
      menu = type;
      mainPos = "fixed";
      mainTransform =
        type === "chat" ? "translateX(85vw)" : "translateX(-85vw)";
      sideMenuTransform = "none";
    } else {
      menu = this.state.toggledNavbarMenu;
      mainPos = "static";
      mainTransform = "none";
      sideMenuTransform =
        this.state.toggledNavbarMenu === "chat"
          ? "translateX(-85vw)"
          : "translateX(85vw)";
    }
    document.getElementById(menu).style.transform = sideMenuTransform;
    document.getElementById("nav").style.transform = mainTransform;
    document.getElementById("main").style.transform = mainTransform;
    document.getElementById("main").style.position = mainPos;
    this.setState({ toggledNavbarMenu: type });
  };

  // select chat stores both the type (Machine, Part, Job, etc..) and the specific chat within the type group
  selectChat = (type, chat) => {
    return () => {
      this.setState({ displayChat: [type, chat] });
      this.toggleNavbarMenu(null);
    };
  };

  hideChat = () => {
    this.setState({ displayChat: null });
    this.toggleNavbarMenu("chat");
  };

  setInitialTime = (type, chat, time) => {
    let newChats = this.state.chats;
    newChats[type][chat].chatHistory.chatFirstBegan = time;
    this.setState({ chats: newChats });
  };

  postNewMessages = async (type, chat) => {
    const url =
      "https://www.matainventive.com/cordovaserver/database/insertchat.php";
    const data = {
      userid: JSON.parse(localStorage.getItem("Mata Inventive")).ID,
      type: type,
      properties: chat,
      chat_history: JSON.stringify(this.state.chats[type][chat].chatHistory)
    };

    fetch(url, {
      method: "POST",
      body:
        "userid=" +
        data.userid +
        "&type=" +
        data.type +
        "&properties=" +
        data.properties +
        "&chat_history=" +
        data.chat_history +
        "&insert=",
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
      .then(res => console.log(res))
      .then(response => console.log("Success:", JSON.stringify(response)))
      .catch(error => console.error("Error:", error));
  };

  sendNewMessage = (type, chat, message) => {
    let newChats = this.state.chats;
    const newMessage = ["user", message, Date.now()];
    newChats[type][chat].chatHistory.chatLog.push(newMessage);
    this.setState({ chats: newChats });
    this.machineReplyMessage(type, chat, message);
  };

  machineReplyMessage = (type, chat, message) => {
    const errorReply =
      "Error code 404, aka something wrong with your input. Maybe try one of the presets?";
    let newChats = this.state.chats;
    let replyMessage = newChats[type][chat].responses[message];
    replyMessage = replyMessage ? replyMessage : errorReply;
    replyMessage = ["machine", replyMessage];
    newChats[type][chat].chatHistory.chatLog.push(replyMessage);
    this.setState({ chats: newChats });
    this.postNewMessages(type, chat);
  };

  selectProfile = type => {
    return () => {
      this.setState({ displayProfile: type });
      this.toggleNavbarMenu(null);
    };
  };

  hideProfile = () => {
    this.setState({ displayProfile: null });
    this.toggleNavbarMenu("profile");
  };

  toggleNotification = type => {
    const userid = this.state.user.ID.toString();
    let alertemail = this.state.user.notifications.Email;
    alertemail = type === "Email" ? !alertemail : alertemail;
    let alerttext = this.state.user.notifications.Text;
    alerttext = type === "Text" ? !alerttext : alerttext;
    let emailstate, textstate;
    emailstate = alertemail ? "1" : "0";
    textstate = alerttext ? "1" : "0";

    fetch(
      "https://www.matainventive.com/cordovaserver/database/togglealertconfig.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body:
          "userid=" +
          userid +
          "&emailstate=" +
          emailstate +
          "&textstate=" +
          textstate +
          "&insert="
      }
    ).then(res => {
      let newUser = Object.assign({}, this.state.user);
      newUser.notifications[type] = !newUser.notifications[type];
      this.setState({ user: newUser });
    });

    //below we are toggling the users attribute of specific categories being in do not disturb mode or not.
    // var dataString="userid="+title+"&emailstate="+emailstate+"&textstate="+textstate+"&insert=";
    // // $("#alertwarning").text("");
    // if($.trim(title).length>0)
    // {
    // 	$.ajax({
    // 		type: "POST",
    // 		url:"https://www.matainventive.com/cordovaserver/database/togglealertconfig.php",
    // 		data: dataString,
    // 		crossDomain: true,
    // 		cache: false,
    // 		beforeSend: function(){ $("#insertalert").val('Connecting...');},
    // 		success: function(data){
    // 		if(data=="success")
    // 			{
    // 			}
    // 		else if(data=="error")
    // 			{
    // 			}
    // 		}
    // 	});
    // }
  };

  render = () => {
    if (!localStorage.getItem("Mata Inventive")) {
      return <Splash fetchData={this.fetchData} logIn={this.logIn} />;
    } else {
      return (
        this.state.isLoading ?
        <div className="splash">
        <img src="./assets/splash.png" alt="Splash Logo" />
        <h2 className='loading' style={{color:"white"}}>Loading</h2>

        </div>
        :
        <div className="app-container">
          <div
            className="overlay"
            onClick={() => this.toggleNavbarMenu(null)}
            style={{
              display: this.state.toggledNavbarMenu ? "block" : "none"
            }}
          />
          <span id="chat" className="chat-wrapper">
            <Chat selectChat={this.selectChat} chats={this.state.chats} />
          </span>
          <div>
            <Navbar
              toggleNavbarMenu={this.toggleNavbarMenu}
              displayChat={this.state.displayChat}
              displayProfile={this.state.displayProfile}
              hideChat={this.hideChat}
              hideProfile={this.hideProfile}
            />
            <Main
              fetchData={this.fetchData}
              user={this.state.user}
              cells={this.state.cells}
              chats={this.state.chats}
              displayChat={this.state.displayChat}
              hideProfile={this.hideProfile}
              displayProfile={this.state.displayProfile}
              hideProfile={this.hideProfile}
              setInitialTime={this.setInitialTime}
              sendNewMessage={this.sendNewMessage}
              toggleNotification={this.toggleNotification}
              machineSelected={this.state.machineSelected}
              toggleMachineSelection={this.toggleMachineSelection}
              saveNewJob={this.saveNewJob}
              saveReporting={this.saveReporting}
              setDeviceTimer={this.setDeviceTimer}
              latestJob = {this.latestJob}
            />
          </div>
          <span id="profile" className="profile-wrapper">
            <Profile
              user={this.state.user}
              selectProfile={this.selectProfile}
            />
          </span>
        </div>
      );
    }
  };
}
