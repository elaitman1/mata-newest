import React, { Component } from "react";
import Confirmation from "./confirmation";
import _ from "lodash";

export default class Inspection extends Component {
  state = {
    goodParts: 1,
    badParts: 1,
    reworkParts:1,
    showConfirmation: false
  };

  latestJobNumber = () => {

    fetch(`https://www.matainventive.com/cordovaserver/database/jsonmataparts.php?id=${JSON.parse(localStorage.getItem("Mata Inventive")).ID}`)
    .then(r=>r.json())
    .then(r=>{
      let latestStartJobEntry = r.find(machine=> this.props.machine.device_id === this.props.machine.device_id)
      this.setState({latestJobNumber:latestStartJobEntry.jobnumber})
      this.setState({latestPartNumber:latestStartJobEntry.partnumber})
    })
  }

  updatePartsNum = (type, oper) => {
    return () => {
      this.setState(prevState => {
        let input = prevState[type];
        if (!input && input !== 0) {
          input = 0;
        }
        if (oper === "add") {
          return { [type]: input + 1 };
        } else if (oper === "minus" && this.state[type] > 0) {
          return { [type]: input - 1 };
        }
      });
    };
  };

  update = type => {
    return e => {
      let input = e.currentTarget.value;
      // prevent NaN affecting adding/subtracting in updatePartsNum function when user manually inputs a parts number which will be of type string
      if (input !== "") {
        input = parseInt(input);
      }
      this.setState({ [type]: input });
    };
  };

  toggleConfirmation = () => {
    this.setState({ showConfirmation: !this.state.showConfirmation });
  };

  saveInspection = async (type, count) => {
    const url =
      "https://www.matainventive.com/cordovaserver/database/insertreport.php";
    const data = {
      userid: JSON.parse(localStorage.getItem("Mata Inventive")).ID,
      deviceid: this.props.machine.device_id,
      comment: type,
      number: count,
      jobnumber: this.state.latestJobNumber,
      partnumber: this.state.latestPartNumber
    };

    fetch(url, {
      method: "POST",
      body:
        "userid=" +
        data.userid +
        "&deviceid=" +
        data.deviceid +
        "&comment=" +
        data.comment +
        "&number=" +
        data.number +
        "&jobnumber=" +
        data.jobnumber +
        "&partnumber=" +
        data.partnumber +
        "&insert=",
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
      .then(res => console.log(res))
      .then(response => console.log("Success:", JSON.stringify(response)))
      .catch(error => console.error("Error:", error));
  };

  postAllInspections = async () => {
    const types = Object.keys(this.state);
    let insps = [];
    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      if (type !== "showConfirmation" && partsType !== "latestJobNumber" && partsType !== "latestPartNumber") {
        const count = this.state[type];
        const insp = await this.saveInspection(type, count);
        insps.push(insp);
      }
    }

    const allInspsRes = await Promise.all(insps).then(res => {
      console.log("pAll", res);
    });
    return allInspsRes;
  };

  handleSubmit = () => {
    this.postAllInspections().then(res => {
      console.log("res", res);
      this.toggleConfirmation();
    });
  };

  renderTask = () => {
    const good =
      this.state.goodParts !== "" ? parseInt(this.state.goodParts) : 0;
    const bad = this.state.badParts !== "" ? parseInt(this.state.badParts) : 0;
    const rework = this.state.reworkParts !== "" ? parseInt(this.state.reworkParts) : 0;

    const totalParts = _.sum([good, bad, rework]);
    const partsInputs = Object.keys(this.state).map((partsType, idx) => {
      if (partsType !== "showConfirmation" && partsType !== "latestJobNumber" && partsType !== "latestPartNumber") {
        let type = _.capitalize(partsType.slice(0, partsType.length - 5));
        return (
          <PartsInput
            key={idx}
            type={type}
            partsType={partsType}
            numParts={this.state[partsType]}
            update={this.update}
            updatePartsNum={this.updatePartsNum}
          />
        );
      }
    });

    this.latestJobNumber();
    if (this.state.showConfirmation) {
      return (
        <Confirmation
          task="Inspection"
          hideTask={this.props.hideTask}
          toggleConfirmation={this.toggleConfirmation}
        />
      );
    } else {
      return (
        <div className="inspection-container">
          <h4>Inspection</h4>
          <section className="inspection-body">
            {partsInputs}
            <div className="inspection-input-container">
              <p>Total Parts</p>
              <span className="inspection-parts-input">{totalParts}</span>
            </div>
            <button className="form-submit-button" onClick={this.handleSubmit}>
              Save
            </button>
          </section>
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

const PartsInput = props => {
  return (
    <div className="inspection-input-container">
    {props.type !== 'Rework'?
      <p>{props.type} Parts</p>
    :
      <p>{props.type}</p>
    }
      <span className="inspection-parts-input">
        <div onClick={props.updatePartsNum(props.partsType, "minus")}>-</div>
        <input
          type="number"
          value={props.numParts}
          onChange={props.update(props.partsType)}
        />
        <div onClick={props.updatePartsNum(props.partsType, "add")}>+</div>
      </span>
    </div>
  );
};
