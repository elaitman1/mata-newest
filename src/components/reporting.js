import React, { Component } from "react";
import Confirmation from "./confirmation";
// import { connect } from 'react-redux';

export default class Reporting extends Component {
  state = {
    cells: {
      Machining: {
        "Clean Chamber": false,
        "Setup Job": false,
        "Inspection Room": false
      },
      Preparation: {
        "Job Spec Confirmation": false,
        "Revise CAD Modeling": false,
        "Edit Toolpath": false
      },
      Note: ""
    },
    cellSelected: "Machining",
    prevCell: null,
    displayNote: false,
    prevNote: "",
    firstCellSelection: false,
    showConfirmation: false,
    prepCheckJobNum:0,
    jobNumber:"",
    displayArrowDown:false,
    errorModal:false,
  };

  // componentDidMount = () => {
    // const reportingDict = {
    //   clean: ["Machining", "Clean Chamber"],
    //   offset: ["Machining", "Clear Alarm"],
    //   inspection: ["Machining", "Inspection Room"],
    //   speccheck: ["Preparation", "Job Spec Confirmation"],
    //   cadwork: ["Preparation", "Revise CAD Modeling"],
    //   toolpath: ["Preparation", "Edit Toolpath"]
    // };

    // fetch(`https://www.matainventive.com/cordovaserver/database/jsonmataPrepAll.php?id=${this.props.user.ID}`)


    // let reportingObj = { Machining: {}, Preparation: {} };
    // Object.keys(this.props.machine.reporting).forEach(prepType => {
    //   let prepVal = this.props.machine.reporting[prepType];
    //   if (prepType !== "jobnumber" && prepType !== "partnumber"){
    //     if (prepType === "notes") {
    //       reportingObj.Note = prepVal;
    //     } else {
    //       prepVal = this.handleEmptyString(prepVal);
    //       const stateKeys = reportingDict[prepType];
    //       reportingObj[stateKeys[0]][stateKeys[1]] = prepVal;
    //     }
    //   }
    // });
    // this.setState({ cells: reportingObj, prevNote: reportingObj.Note });
  // };

  handleEmptyString = str => {
    if (typeof str === "string") {
      if (str === "false") {
        return JSON.parse(str);
      } else {
        return str;
      }
    } else {
      return str;
    }
  };

  selectCell = cell => {
    return () => {
      if (this.state.firstCellSelection) {
        this.setState({ firstCellSelection: false });
      }
      // if Note is selected, open Note textbox on top of the usual selecting of cell styling change
      if (cell === "Note") {
        this.setState({ prevCell: this.state.cellSelected });
        this.toggleNote();
      }
      document.getElementById(this.state.cellSelected).className = "cell";
      document.getElementById(cell).className = "cell selected";
      this.setState({ cellSelected: cell });
    };
  };

  update = e => {
    let newCells = this.state.cells;
    newCells.Note = e.currentTarget.value;
    this.setState({ cells: newCells });
  };

  toggleConfirmation = () => {
    this.setState({ showConfirmation: !this.state.showConfirmation });
  };

  handleErrorModal = () => {
    this.setState({errorModal:false})
  }

  errorModal = () =>{
    if(this.state.errorModal){
      return(
        <span className="start-job-modal-overlay">
          <div className="start-job-modal-container">
            <p>Please Choose Job #</p>
            <button
              className="form-submit-button"
              onClick={this.handleErrorModal}
            >
              Ok
            </button>
          </div>
        </span>
      )
    }else{
      return ""
    }
  }

  saveChecklistValues = async () => {
    const url =
      "https://www.matainventive.com/cordovaserver/database/insertprepall.php";
    const data = {
      userid: JSON.parse(localStorage.getItem("Mata Inventive")).ID,
      deviceid: this.props.machine.device_id,
      prepspec: this.state.cells.Preparation["Job Spec Confirmation"],
      prepcad: this.state.cells.Preparation["Revise CAD Modeling"],
      preppath: this.state.cells.Preparation["Edit Toolpath"],
      prepreporting: this.state.cells.Machining["Setup Job"],
      prepclean: this.state.cells.Machining["Clean Chamber"],
      partnumber: "",
      jobnumber: "",
      inspection: this.state.cells.Machining["Inspection Room"]
    };

    fetch(url, {
      method: "POST",
      body:
        "userid=" +
        data.userid +
        "&deviceid=" +
        data.deviceid +
        "&prepspec=" +
        data.prepspec +
        "&prepcad=" +
        data.prepcad +
        "&preppath=" +
        data.preppath +
        "&prepoffset=" +
        data.prepreporting +
        "&prepclean=" +
        data.prepclean +
        "&partnumber=" +
        data.partnumber +
        "&jobnumber=" +
        data.jobnumber +
        "&inspection=" +
        data.inspection +
        "&insert=",
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
      .then(res => console.log(res))
      .then(response => console.log("Success:", JSON.stringify(response)))
      .catch(error => console.error("Error:", error));
  };

  handleSaveChecklist = () => {
    this.state.jobNumber === ""?
      this.setState({errorModal:true})
    :
    this.saveChecklistValues().then(res => {
      console.log(res);
      this.props.saveReporting(
        this.props.machine.cell_id,
        this.props.machine.device_id,
        this.state.cells
      );
      this.toggleConfirmation();
    });
  };

  toggleChecklist = checkList => {
    return () => {
      let newCells = this.state.cells;
      let bool = newCells[this.state.cellSelected][checkList];
      newCells[this.state.cellSelected][checkList] = bool ? false : true;
      this.setState({ cells: newCells });
    };
  };

  postNote = async () => {
    const url =
      "https://www.matainventive.com/cordovaserver/database/insertnote.php";
    const data = {
      userid: JSON.parse(localStorage.getItem("Mata Inventive")).ID,
      deviceid: this.props.machine.device_id,
      note: this.state.cells.Note,
      partnumber: "",
      jobnumber: this.state.jobNumber
    };

    fetch(url, {
      method: "POST",
      body:
        "userid=" +
        data.userid +
        "&deviceid=" +
        data.deviceid +
        "&note=" +
        data.note +
        "&partnumber=" +
        data.partnumber +
        "&jobnumber=" +
        data.jobnumber +
        "&insert=",
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
      .then(response => console.log("Success:", JSON.stringify(response)))
      .catch(error => console.error("Error:", error));
    };

  // after saving Note, switch back to the previous cell view that the user was at before displaying Note
  saveNote = () => {
    if(this.state.jobNumber === ""){
      return this.setState({displayNote:false, errorModal:true})
    }else{
      this.setState({displayNote:true, errorModal:false})
    }
    this.postNote().then(res => {
      console.log(res);
      document.getElementById(this.state.cellSelected).className = "cell";
      document.getElementById(this.state.prevCell).className = "cell selected";
      this.setState({
        cellSelected: this.state.prevCell,
        prevCell: null,
        prevNote: this.state.cells.Note
      });
      this.toggleNote();
    });
  };

  // similar logic to save note, but uses a previously saved value to switch the value back to it so as not to save any updates the user may have
  closeNote = () => {
    let newCells = this.state.cells;
    newCells.Note = this.state.prevNote;
    this.setState({ cells: newCells, cellSelected: this.state.prevCell });
    document.getElementById(this.state.cellSelected).className = "cell";
    document.getElementById(this.state.prevCell).className = "cell selected";
    this.toggleNote();
  };

  toggleNote = () => {
    this.setState({ displayNote: !this.state.displayNote });
  };

  renderCells = () => {
    return this.state.displayArrowDown?
      ""
    :
    Object.keys(this.state.cells).map((cell, idx) => {
      // first cell when rendering component sets styling for blue border on the first cell

      const className =
        this.state.firstCellSelection && idx === 0 ? "cell selected" : "cell";
      return (
        <span
          key={idx}
          id={cell}
          className={className}
          onClick={this.selectCell(cell)}
        >
          {cell}
        </span>
      );
    });
  };

  handleArrowDown = () => {
    this.setState({displayArrowDown:!this.state.displayArrowDown})
  }

  handleJobNumberClicked = (e) => {
    this.setState({jobNumber:e.target.innerText})
    fetch(`https://www.matainventive.com/cordovaserver/database/jsonmatanotes.php?id=${this.props.user.ID}`)
    .then(r=>r.json())
    .then(r=>{
      let found = r.find(element => {
        return element.jobnumber === this.state.jobNumber.toString() && element.device_id === this.props.machine.device_id
    })
      if (found !== undefined){
        let foundNote = found.note
        this.setState({ cells: { ...this.state.cells, Note: foundNote} })
      }
    })
    this.props.changeCurrentJobNumber(e.target.innerText)
    this.handleArrowDown()
  }

  note = () => {
    if(this.state.displayNote){
      return <div>
        <div
          className="preparation-checklist-note-overlay"
          onClick={this.closeNote}
        />
        <div className="preparation-checklist-note-container">
          <h5>Add Note</h5>
          <textarea value={this.state.cells.Note} onChange={this.update} />
          <button className="form-submit-button" onClick={this.saveNote}>
            Save
          </button>
        </div>
      </div>
    }else{
      return ""
    }
  }

  renderTask = () => {
    if (this.state.showConfirmation) {
      return (
        <Confirmation
          task="Preparation Checklist"
          hideTask={this.props.hideTask}
          toggleConfirmation={this.toggleConfirmation}
        />
      );
    } else {
      const errorModal = this.state.errorModal? (
        this.errorModal()
      ) : (
        ""
      )

    const handleDropDown = () =>{
      if(this.state.displayArrowDown){
        return <div className="reportingJobNumberDropdownContainer">
        <ul className='reportingJobNumberDropdownUl'>
        {this.props.allJobsParts.map(jobPart =>{
          if(this.props.machine.device_id === jobPart.device_id){
      ////////////////////////////////////////////////////////////////////////utc date created
            var date = new Date();
            var now_utc =  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
            date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            let utcDate = new Date(now_utc).toString().slice(4,15)
          ////////////////////////////////////////////////////////////////////////Application date changed to utc
            let s = jobPart["EditTime"].slice(0,10)
            let newS = [s[5],s[6]," ",s[8],s[9]," ",s[0],s[1],s[2],s[3]]
            let newSMonth = parseInt([newS[0],newS[1]].join(''))
            let months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            let newSWordMonth = months[newSMonth]
            let applicationDateToUTC = [newSWordMonth,' ',newS[3],newS[4],newS[5],newS[6],newS[7],newS[8],newS[9]].join('')

              if(applicationDateToUTC === utcDate){
                return <li className='reportingJobNumberDropdownli'
                  onClick={this.handleJobNumberClicked}
                  >
                    {jobPart.jobnumber}
                </li>
              }
            } else {
              return ""
            }})}
          </ul></div>
      } else {
        return Object.keys(this.state.cells[this.state.cellSelected]).map((checkList, idx) =>{
          return  <Button
              key={idx}
              type={checkList}
              cell={this.state.cellSelected}
              toggleChecklist={this.toggleChecklist}
              bool={this.state.cells[this.state.cellSelected][checkList]}
            />
          })
      }
    }

      return (
        <div>
          <div className="preparation-checklist-container">
            <h4>Reporting</h4>
            <h4>For Job# {" "}
            {this.state.displayArrowDown?
              "____________"
            :
             this.state.jobNumber
            }
              {this.state.displayArrowDown?
                <img
                  onClick={this.handleArrowDown}
                  className="arrowRight"
                  src="./assets/arrowDown.png"
                  alt="arrowDown"
                />
              :
                <img
                  onClick={this.handleArrowDown}
                  className="arrowRight"
                  src="./assets/arrowRight.png"
                  alt="arrowRight"
                />
              }

            </h4>
                  <header className="preparation-checklist-cells-container">
                    {this.renderCells()}
                  </header>
                  <section className="preparation-checklist-body">
                    <div className="preparation-checklist-buttons-container">
                    {handleDropDown()}
                    </div>
                    <button
                      className="form-submit-button"
                      onClick={this.handleSaveChecklist}
                    >
                      Save
                    </button>
                    {errorModal}
                    {this.note()}
                  </section>
                </div>
              </div>
      );
    }
  };


  render = () => {
    return (
      <div>
        <div className="overlay" onClick={this.props.hideTask} />
        {this.renderTask()}
      </div>
    );
  };
}

const Button = props => {
  return (
    <div>
      {props.cell !== "Note" ? (
        <div
          id={props.type}
          className="preparation-checklist-button-container"
          style={{
            backgroundImage: props.bool
              ? "radial-gradient(circle at 50% 50%, #FFFFFF, #2E5BFF)"
              : ""
          }}
          onClick={props.toggleChecklist(props.type)}
        >
          <p>{props.type}</p>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};
