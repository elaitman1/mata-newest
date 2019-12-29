import React, { Component } from "react";
import FeedItem from "./feedItem";

export default class Feed extends Component {
  state = {
    // current cell stores index and the actual cell object - index will be used for selecting element by id
    currentCell: [0, this.props.cells[Object.keys(this.props.cells)[0]]],
    firstCellSelection: true,
  };

  // when selecting a new cell, swap class names to change blue border styling as well as setting state.
  selectCell = (cellArr) => {
    return () => {
      if (this.state.firstCellSelection) {
        this.setState({ firstCellSelection: false });
      }
      document.getElementById(this.state.currentCell[0]).className = "cell";
      document.getElementById(cellArr[0]).className = "cell selected";
      this.setState({ currentCell: cellArr });
    };
  };

  renderCells = () => {
    return Object.keys(this.props.cells).map((cell, idx) => {
      cell = this.props.cells[cell];
      // first cell when rendering component sets styling for blue border on the first cell
      const className =
        this.state.firstCellSelection && idx === 0 ? "cell selected" : "cell";
      return (
        <span
          key={idx}
          id={idx}
          className={className}
          onClick={this.selectCell([idx, cell])}
        >
          {cell.cellName}
        </span>
      );

    });
  };

  render(){
   // let sorted = Object.keys(this.props.cells[Object.keys(this.props.cells)[this.state.currentCell[0]]].devices).sort(function (a, b) {
   //   var x = a.toUpperCase(),
   //       y = b.toUpperCase();
   //   if (x > y) {
   //       return 1;
   //   }
   //   if (x < y) {
   //       return -1;
   //   }
   //   return 0;
   // })


//     return (
//       <div className="feed-container">
//         <header className="feed-cells-container">{this.renderCells()}</header>
//         <section className="feed-items-container">
//           {Object.keys(this.props.cells[Object.keys(this.props.cells)[this.state.currentCell[0]]].devices).map((machSpecs, idx) => {
//             debugger
//             // machSpecs = this.state.currentCell[1].devices[machSpecs];
//             machSpecs = this.props.cells[Object.keys(this.props.cells)[this.state.currentCell[0]]].devices[machSpecs];
//             return (
//               <FeedItem
//                 key={idx}
//                 machSpecs={machSpecs}
//                 toggleMachineSelection={this.props.toggleMachineSelection}
//               />
//             )
//           })}
//         </section>
//       </div>
//     );
//   };
// }

let array = []

Object.keys(this.props.cells[Object.keys(this.props.cells)[this.state.currentCell[0]]].devices).map((machSpecs, idx) => {

  // machSpecs = this.state.currentCell[1].devices[machSpecs];
   array.push(this.props.cells[Object.keys(this.props.cells)[this.state.currentCell[0]]].devices[machSpecs]);
 })

 array.sort((a, b) => (a.name > b.name) ? 1 : -1)
 console.log(array)

return (
  <div className="feed-container">
    <header className="feed-cells-container">{this.renderCells()}</header>
    <section className="feed-items-container">
      {array.map((item, idx) => {
        // machSpecs = this.state.currentCell[1].devices[machSpecs];
        return (
          <FeedItem
            key={idx}
            machSpecs={item}
            toggleMachineSelection={this.props.toggleMachineSelection}
          />
        )
      })}
    </section>
  </div>
);
};
}
