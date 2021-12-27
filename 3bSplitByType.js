// this file divides the alerts into deciles and calculates the probablility of winning
const dfd = require("danfojs-node");

dfd
  .read_csv("3.Concat/May2021_concat.csv")
  .then((df) => {
    // MAKE SURE THESE VARIABLES ARE CORRECT BEFORE RUNNING
    //const optionType = "put";
    const optionType = "call"; //activate if you want to output calls, disable PUT above
    const winDefinition = [10, 25, 50, 75, 100];

    /*
    MAKE QUERY FOR JUST optionType
    */
    const dfOptionType = df.query({
      column: "option_type",
      is: "==",
      to: optionType,
    });

    /*
    MAKE winner COLUMN FOR EACH WIN DEFINITION
    */
    winDefinition.forEach((currentWinDef) => {
      // these winner columns are necessary for queries we have to make in the future
      const winner = dfOptionType["adj_high_return"].ge(currentWinDef);
      dfOptionType.addColumn({
        column: `winner_${currentWinDef}`,
        value: winner,
      });
    });

    /*
    OUTPUT AS CSV FILE
    */
    dfOptionType
      //.to_csv("3.Concat/May2021_put_with_winner.csv")
      .to_csv("3.Concat/May2021_call_with_winner.csv") //activate to get CALL data, disable PUT function above
      .catch((err) => {
        console.log(err);
      });
  })
  .catch((err) => {
    console.log(err);
  });
